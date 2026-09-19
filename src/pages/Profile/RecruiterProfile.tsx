import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ImageProps, ViewStyle, Pressable } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import RNRestart from 'react-native-restart';
import messaging from '@react-native-firebase/messaging';
import { clearAnalyticsUser } from '../../utils/analytics';
import { routes } from '../../constants/values'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { useAppDispatch, useAppSelector } from '../../store'
import { DeleteSesdkfjds, GetExperience, ProfileData, UploadCV } from '../../reducer/jobsReducer'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../../components/Text';
import ImagePicker from 'react-native-image-crop-picker';
import { useAlert } from '../../context/AlertContext';
import ResumeCard from '../../components/ResumeCard';
import { openBrowser } from '../Resume/Resume';
import { pick, types } from '@react-native-documents/picker';
import { setUser } from '../../reducer/userReducer';
import { formatDateToMonthYear } from '../Auth/ProfileCompelete';
import NavigationBar from '../../recruiter/components/NavigationBar';
import { getInitials, logoutAndRestart, ProfileRow, SectionHeader } from './Profile';




const RecruiterProfile = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        dispatch(ProfileData()).unwrap().then((res) => {
            console.log(res)
        })
        setRefreshing(false);
    };
    const { showConfirm, showAlert } = useAlert();

    const [roles, setRoles] = useState<RoleItem[]>([]);
    useEffect(() => {
        dispatch(GetExperience()).unwrap().then(res => {
            if (res.success && res.data) {
                const fetchedRoles = res.data.map((item: any) => ({
                    id: item.id,
                    jobTitle: item.title ?? '',
                    businessName: item.company ?? '',
                    startDate: formatDateToMonthYear(item.date_start),
                    endDate: item.is_currently_working ? 'Still here' : formatDateToMonthYear(item.date_end),
                    stillHere: !!item.is_currently_working,
                    description: item.description ?? ''
                }));
                setRoles(fetchedRoles);
            }
        })
    }, [user])
    const [loadingCV, setLoadingCV] = useState<boolean>(false)

    const normalizeFileUri = (u?: string) => {
        if (!u) return '';
        if (u.startsWith('/')) return `file://${u}`;
        return u;
    };
    const pickResume = async () => {
        const [doc] = await pick({
            type: [types.pdf],
            allowMultiSelection: false,
            mode: 'import',
        });
        const uri = normalizeFileUri((doc as any).fileCopyUri || doc.uri);
        const file = { uri, name: doc.name ?? 'resume.pdf', type: doc.type || 'application/pdf' };
        const fd = new FormData();
        fd.append('title', '');
        fd.append('is_default', '1');
        fd.append('cv_file', {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);
        setLoadingCV(true)
        dispatch(UploadCV(fd)).unwrap().then(res => {
            if (res.success) {
                dispatch(setUser({ user: { ...user, cv: res.data } }))
            }
        }).finally(() => {
            setLoadingCV(false)
        })
    };
    console.log("profile_recruiter", user)
    return (
        <>
            <NavigationBar name={routes.ACCOUNT}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    style={{ flex: 1, }}
                    contentContainerStyle={{ paddingBottom: responsiveHeight(4) }}
                    showsVerticalScrollIndicator={false}
                >
                    {(!user || !user.id) ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: responsiveHeight(2), paddingVertical: responsiveHeight(20) }}>
                            <Image source={imagePath.image1} />
                            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600', textAlign: 'center', width: responsiveWidth(80) }}>
                                You're not logged in. Please log in to access this feature
                            </Text>
                            <View style={{ marginHorizontal: responsiveWidth(5), flexDirection: 'row', gap: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                                <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: 'center', borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: responsiveHeight(1.5) }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>Register</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: responsiveHeight(1.5) }}>
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : user?.id && !loading ? (
                        <View style={{ paddingHorizontal: responsiveWidth(5) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: responsiveHeight(1), paddingBottom: responsiveHeight(1.5) }}>
                                <Text style={{ fontSize: responsiveFontSize(3.2), fontWeight: '800', color: colors.textPrimary }}>
                                    Profile
                                </Text>
                            </View>
                            <View style={{
                                borderWidth: 1,
                                borderColor: colors.gray,
                                borderRadius: 15,
                                flexDirection: 'row', alignItems: 'center',
                                paddingHorizontal: responsiveWidth(4),
                                paddingVertical: responsiveHeight(1.5)
                            }}>
                                <TouchableOpacity onPress={() => pickImage('image')} style={{
                                    width: responsiveWidth(15), aspectRatio: 1,
                                    borderRadius: 20,
                                    backgroundColor: colors.primary + '18',
                                    justifyContent: 'center', alignItems: 'center',
                                    marginRight: responsiveWidth(3),
                                    overflow: 'hidden',
                                }}>
                                    {user.logo ? (
                                        <Image source={{ uri: user.logo }} style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: colors.primary }}>
                                            {getInitials(user.name)}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' }}>
                                        {user.name}
                                    </Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.textSecondary, marginTop: responsiveHeight(0.2) }}>
                                        {user.email}
                                    </Text>
                                </View>
                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="VENUE" />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                <ProfileRow
                                    title="Business page"
                                    subtitle="Photos, about, industry"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, }}
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => navigation.navigate(routes.WHEREICANWORK)}
                                />
                                <ProfileRow
                                    title="Business details"
                                    subtitle="ABN, trading name, address"
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => { }}
                                />

                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="PLAN & BILLING" />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                <ProfileRow
                                    title="Current plan"
                                    subtitle="Gold · 1 posting left · expires 15 Sep"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, }}
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => navigation.navigate(routes.WHEREICANWORK)}
                                />
                                <ProfileRow
                                    title="Buy more postings"
                                    subtitle="Free, Basic, Gold, Diamond, Platinum"
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => { }}
                                />
                                <ProfileRow
                                    title="Payment history"
                                    subtitle="Invoices and receipts"
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => { }}
                                />

                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="ACCOUNT" />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                <ProfileRow
                                    title="Notifications"
                                    subtitle="Email and push"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, }}
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => { }}
                                />
                                <ProfileRow
                                    title="Help and support"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, paddingVertical: responsiveHeight(2.5) }}
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => { }}
                                />

                                <ProfileRow
                                    title="Logout"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, paddingVertical: responsiveHeight(2.5) }}
                                    onPress={() => { }}
                                />
                                <ProfileRow
                                    title="Delete Account"
                                    containerStyle={{ paddingVertical: responsiveHeight(2.5) }}
                                    onPress={async () => {
                                        showConfirm({
                                            title: 'Delete Account',
                                            message: 'Are you sure you want to delete your account?',
                                            okText: 'Delete',
                                            cancelText: 'Cancel',
                                            waitForOk: true,
                                            onOkPress: async () => {
                                                await dispatch(DeleteSesdkfjds({ id: user.id })).unwrap().then((res) => {
                                                    if (res.success) {
                                                        showAlert({
                                                            title: 'Account Deleted',
                                                            message: 'Your account has been deleted successfully.',
                                                            okText: 'OK'
                                                        })
                                                        logoutAndRestart()
                                                    }
                                                })
                                                return true;
                                            },
                                        })
                                    }}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: responsiveHeight(40) }}>
                            <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                        </View>
                    )}
                </ScrollView>
            </NavigationBar>
        </>
    )
}

export default RecruiterProfile