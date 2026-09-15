import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ImageProps, ViewStyle, Pressable } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import RNRestart from 'react-native-restart';
import messaging from '@react-native-firebase/messaging';
import { clearAnalyticsUser } from '../../utils/analytics';
import { routes } from '../../constants/values'
import { NavigationBar } from '../../components'
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
import { formatDateToMonthYear } from '../ProfileCompelete/ProfileCompelete';
import { pick, types } from '@react-native-documents/picker';
import { setUser } from '../../reducer/userReducer';
const logoutUser = async () => {
    try {
        await messaging().deleteToken();
        await clearAnalyticsUser();
        await AsyncStorage.multiRemove(['token', 'role', 'FCM']);
    } catch (e) { }
};
const logoutAndRestart = async () => {
    await logoutUser();
    RNRestart.restart();
};

// --- Helpers ---
const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].substring(0, 2).toUpperCase()
}

const SectionHeader = ({ title, titleColor, actionText, onAction, actionColor }: { titleColor: string, title: string; actionText?: string; onAction?: () => void; actionColor?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1.2), marginTop: responsiveHeight(2) }}>
        <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '700', color: titleColor, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</Text>
        {actionText && (
            <TouchableOpacity onPress={onAction}>
                <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '800', color: actionColor }}>{actionText}</Text>
            </TouchableOpacity>
        )}
    </View>
)

const ProfileRow = ({ rightIcon, containerStyle, icon, title, subtitle, onPress, actionText }: {
    rightIcon?: ImageProps; icon?: ImageProps; title: string; subtitle?: string; onPress?: () => void; actionText?: string, containerStyle?: ViewStyle
}) => {
    const { colors } = useContext(ThemeContext)

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: responsiveHeight(1.5),
                paddingHorizontal: responsiveWidth(4),

                ...containerStyle
            }}
        >
            {icon && (
                <View style={{
                    width: responsiveWidth(11), aspectRatio: 1,
                    marginRight: responsiveWidth(3),
                }}>
                    <Image source={icon} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                </View>
            )}
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
                {subtitle && <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, marginTop: responsiveHeight(0.2) }}>{subtitle}</Text>}
            </View>
            {actionText && (
                <TouchableOpacity onPress={onPress}>
                    <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '600', color: colors.primary }}>{actionText}</Text>
                </TouchableOpacity>
            )}
            {
                rightIcon && (
                    <View style={{
                        width: responsiveWidth(4),
                        aspectRatio: 1,
                        marginRight: responsiveWidth(3),
                    }}>
                        <Image source={rightIcon} style={{ width: "100%", height: "100%", resizeMode: "contain", transform: [{ rotate: "-90deg" }] }} />
                    </View>
                )
            }

        </TouchableOpacity>
    )
}

const TagChip = ({ label }: { label: string; }) => {
    const { colors } = useContext(ThemeContext)
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary50,
            borderRadius: 6,
            paddingHorizontal: responsiveWidth(3),
            paddingVertical: responsiveHeight(0.6),
            marginRight: responsiveWidth(2),
            marginBottom: responsiveHeight(0.8),
            gap: responsiveWidth(2)
        }}>
            <View style={{ width: responsiveWidth(3), aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={imagePath.Check2} style={{ tintColor: colors.primary, width: "100%", height: "100%", resizeMode: "contain" }} />
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '600', color: colors.primary }}>{label}</Text>
        </View>
    )
}

const Profile = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    // const pickImage = async (field: string) => {
    //     try {
    //         const image = await ImagePicker.openPicker({
    //             cropperCircleOverlay: false,
    //             compressImageQuality: 0.9,
    //             mediaType: 'photo',
    //         });
    //         if (!image?.path) return;
    //         const fileName = `project_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`;
    //         const fd = new FormData();
    //         fd.append(field, {
    //             uri: image.path,
    //             name: fileName,
    //             type: image.mime || 'image/jpeg',
    //         } as any);
    //         setProfile({ ...user, [field]: image.path });
    //         dispatch(UpdateProfile(fd))
    //             .unwrap()
    //             .then((res) => {
    //                 if (res.success) {
    //                     dispatch(ProfileData()).unwrap().then((res) => {
    //                         if (res.success) {
    //                             setProfile(res.data)
    //                         } else {
    //                             setProfile(user)
    //                         }
    //                     })
    //                 } else {
    //                     Alert.alert('Error', 'Failed to update user image.');
    //                 }
    //             })
    //     } catch (e) { }
    // };

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
    return (
        <>
            <NavigationBar name={routes.PROFILE}>
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
                                <TouchableOpacity style={{ width: responsiveWidth(7), aspectRatio: 1 }} onPress={() => navigation.navigate(routes.NOTIFICATION)}>
                                    <Image source={imagePath.UserIcon} style={{ width: "100%", height: "100%", resizeMode: 'contain', }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                borderWidth: 1,
                                borderColor: colors.gray,
                                borderRadius: 15,

                            }}>
                                <View style={{
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
                                        {user.image ? (
                                            <Image source={{ uri: user.image }} style={{ width: '100%', height: '100%', borderRadius: responsiveWidth(6.5) }} />
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
                                            {user.location || user.city || user.email}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate(routes.PROFILEPREVIEW)}
                                        style={{
                                            backgroundColor: colors.primary50, borderRadius: 8,
                                            paddingHorizontal: responsiveWidth(3.5), paddingVertical: responsiveHeight(0.7),
                                        }}
                                    >
                                        <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '800', color: colors.primary }}>Preview</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{
                                    borderTopWidth: 1,
                                    borderColor: colors.gray,
                                    paddingHorizontal: responsiveWidth(4),
                                    paddingVertical: responsiveHeight(1.5),
                                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <View style={{ flex: 1, gap: responsiveHeight(1) }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: colors.textPrimary }}>
                                                Profile {user?.percentage?.percentage}% complete
                                            </Text>
                                            <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: colors.primary, marginLeft: responsiveWidth(3) }}>
                                                Add a photo
                                            </Text>
                                        </View>

                                        <View style={{ flex: 1, height: responsiveHeight(.7), backgroundColor: colors.gray, borderRadius: 20, }}>
                                            <View style={{ width: `${user?.percentage?.percentage}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 20 }} />
                                        </View>

                                    </View>

                                </View>
                            </View>

                            <SectionHeader titleColor={colors.textSecondary} title="RESUME" onAction={() => navigation.navigate(routes.RESUME)} actionText="Optional" actionColor={colors.primary} />
                            {
                                user.cv?.cv_url ? (
                                    <ResumeCard
                                        fileName={user.cv?.cv_file}
                                        subtitle={user.cv?.uploaded_at}
                                        onView={() => { user.cv?.cv_url && openBrowser(user.cv.cv_url, colors.primary) }}
                                        onReplace={pickResume}
                                    />
                                ) :
                                    <Pressable
                                        onPress={pickResume}
                                        style={{ width: '100%', aspectRatio: 350 / 91, marginVertical: responsiveHeight(0), }}
                                    >
                                        {
                                            loadingCV ? (
                                                <View style={{ width: '100%', height: '100%', borderWidth: 2, borderRadius: 12, borderStyle: "dashed", borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                                                    <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                                                </View>
                                            ) :
                                                <Image source={require("./ResumeUpload.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                                        }
                                    </Pressable>

                            }
                            <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, marginTop: responsiveHeight(0.8) }}>
                                Most shift jobs do not need one. Your user is enough.
                            </Text>
                            <SectionHeader titleColor={colors.textSecondary} title="VIDEO AND PORTFOLIO" actionText="Optional" actionColor={colors.primary} />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                <ProfileRow
                                    icon={require("./VideoIcon.png")}
                                    title="Video intro"
                                    subtitle="30 seconds"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, }}
                                    actionText={user.video ? "Edit" : "Add"}
                                    onPress={() => navigation.navigate(routes.VIDEO, { link: user.video ? user.video?.video_url : null, uploaded_at: user.video ? user.video?.uploaded_at : null, file: user.video ? user.video?.video_name : null })}
                                />
                                <ProfileRow
                                    icon={require('./PortfolioLink.png')}
                                    title="Portfolio link"
                                    subtitle={user.portfolio || 'jordanlee.myportfolio.com'}
                                    actionText={user.portfolio ? "Edit" : "Add"}
                                    onPress={() => navigation.navigate(routes.LINK)}
                                />
                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="CERTIFICATIONS" actionText="Optional" actionColor={colors.primary} onAction={() => navigation.navigate(routes.CERTIFICATIONS)} />
                            {user?.certificates && user.certificates.length > 0 ? (
                                user.certificates.map((cert: any) => (
                                    <View key={cert.id} style={{
                                        borderWidth: 1.5,
                                        borderColor: colors.surfaces,
                                        borderRadius: 12,
                                        padding: responsiveWidth(3.5),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: responsiveHeight(1),
                                        gap: responsiveWidth(3),
                                    }}>
                                        <View style={{
                                            width: responsiveWidth(12),
                                            aspectRatio: 1,
                                            borderRadius: 8,
                                            backgroundColor: colors.surfaces,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: "hidden"
                                        }}>
                                            <Image source={{ uri: cert?.certificate_file }} style={{ width: '100%', height: '100%' }} />
                                        </View>
                                        <Text style={{ flex: 1, color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>{cert.title}</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate(routes.CERTIFICATIONS)}>
                                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <View style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.surfaces,
                                    borderRadius: 12,
                                    padding: responsiveWidth(3.5),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: responsiveHeight(1),
                                    gap: responsiveWidth(3),
                                }}>
                                    <View style={{
                                        width: responsiveWidth(12),
                                        aspectRatio: 1,
                                        borderRadius: 8,
                                        backgroundColor: colors.surfaces,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(2.5), fontWeight: '600' }}>+</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>Add certifications</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.6), marginTop: responsiveHeight(0.2) }}>Not added yet</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.CERTIFICATIONS)}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <SectionHeader titleColor={colors.textSecondary} title="AVAILABILITY" actionText="Edit" actionColor={colors.primary} onAction={() => navigation.navigate(routes.AVAILABILITY)} />

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <TagChip label="Evenings" />
                                <TagChip label="Weekends" />
                                <TagChip label="Overnight" />

                            </View>

                            <SectionHeader titleColor={colors.textSecondary} title="SKILLS" actionText="Edit" actionColor={colors.primary} onAction={() => navigation.navigate(routes.SKILLS)} />

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {user.skills && user.skills.length > 0 &&
                                    user.skills.map((skill: any, i: number) => (
                                        <TagChip key={i} label={skill.skill_name} />
                                    ))
                                }
                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="EXPERIENCE" actionText="Edit" actionColor={colors.primary} onAction={() => navigation.navigate(routes.EXPERIENCEPAGE)} />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                {roles.length > 0 ? (
                                    roles.map((item: RoleItem, i: number) => (
                                        <View key={i} style={{
                                            paddingVertical: responsiveHeight(1.5),
                                            paddingHorizontal: responsiveWidth(4),
                                            borderBottomWidth: i == roles.length - 1 ? 0 : 1,
                                            borderBottomColor: colors.gray,
                                        }}>
                                            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.textPrimary }}>{item.jobTitle}</Text>
                                            <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, fontWeight: "600", marginTop: responsiveHeight(0.4) }}>
                                                {item.startDate} – {item.endDate} · {item.businessName}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <>
                                        <View style={{
                                            borderBottomWidth: 0.5,
                                            paddingVertical: responsiveHeight(1.5),
                                            paddingHorizontal: responsiveWidth(4),
                                        }}>
                                            <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#1A1A2E' }}>Bartender · The Alley</Text>
                                            <Text style={{ fontSize: responsiveFontSize(1.3), color: '#9CA3AF', marginTop: responsiveHeight(0.2) }}>2023 – now · Brunswick</Text>
                                        </View>
                                        <View style={{ paddingVertical: responsiveHeight(1), borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' }}>
                                            <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#1A1A2E' }}>Floor staff · Nonna's</Text>
                                            <Text style={{ fontSize: responsiveFontSize(1.3), color: '#9CA3AF', marginTop: responsiveHeight(0.2) }}>2021 – 2023 · Coburg</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                            <SectionHeader titleColor={colors.textSecondary} title="PROMPTS AND PHOTO" actionColor={colors.primary} />
                            <ProfileRow
                                icon="📸"
                                title="Profile photo"
                                subtitle="Added recently"
                                actionText="Change"
                                actionColor={colors.primary}
                                onAction={() => pickImage('image')}
                            />
                            <ProfileRow
                                icon="✓"
                                iconColor="#2E7D32"
                                title="Prompt 1"
                                subtitle="Reliable, on time, happy on a busy bar."
                                actionText="Change"
                                actionColor={colors.primary}
                            />
                            <ProfileRow
                                icon="+"
                                iconColor={colors.primary}
                                title="Right to work expiry"
                                subtitle="Not added yet"
                                actionText="Add"
                                actionColor={colors.primary}
                            />
                            <ProfileRow
                                icon="+"
                                iconColor={colors.primary}
                                title="Prompt 2"
                                subtitle="Not added yet"
                                actionText="Add"
                                actionColor={colors.primary}
                            />

                            <SectionHeader titleColor={colors.textSecondary} title="ACCOUNT" />
                            <View
                                style={{
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                }}
                            >
                                <ProfileRow
                                    title="Where I can work"
                                    subtitle="Brunswick +3 areas"
                                    containerStyle={{ borderBottomColor: colors.gray, borderBottomWidth: 1, }}
                                    rightIcon={imagePath.DownAngle}
                                    onPress={() => navigation.navigate(routes.WHEREICANWORK)}
                                />
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

export default Profile