import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { use, useContext, } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { routes } from '../../../constants/values'
import { useAppDispatch, useAppSelector } from '../../../store'
import Text from '../../../components/Text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNRestart from 'react-native-restart';
import { useAlert } from '../../../context/AlertContext'
import { DeleteRecruter } from '../../../reducer/jobsReducer'
import messaging from '@react-native-firebase/messaging';
import { clearAnalyticsUser } from '../../../utils/analytics';

const logoutUser = async () => {
    try {
        await messaging().deleteToken();
        await clearAnalyticsUser();
        await AsyncStorage.multiRemove([
            'token',
            'role',
            'FCM'
        ]);
    } catch (e) {
    }
};
const logoutAndRestart = async () => {
    await logoutUser();
    RNRestart.restart();
};

const Profile = () => {
    const { showConfirm, showAlert } = useAlert();
    const { colors } = useContext(ThemeContext);
    const { user } = useAppSelector(state => state.userStore);
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const dispatch = useAppDispatch()
    return (
        <NavigationBar name={routes.ACCOUNT}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        position: "relative",
                        alignItems: 'center',
                        borderBottomColor: colors.textDisabled,
                        borderBottomWidth: 0.5,
                        paddingBottom: responsiveScreenHeight(2),
                        width: responsiveScreenWidth(100),
                        paddingHorizontal: responsiveScreenWidth(5)
                    }}
                >
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            fontSize: responsiveScreenFontSize(2),
                            color: colors.textPrimary,
                            fontWeight: '800',
                        }}
                    >
                        Account
                    </Text>
                    <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
                </View>
                <View style={{ gap: responsiveScreenWidth(3), marginTop: responsiveScreenHeight(3), flexDirection: "row", backgroundColor: colors.lightGrayNatural, width: "100%", paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 15 }}>
                    <View style={{ borderRadius: 100, height: responsiveScreenHeight(7), aspectRatio: 1, overflow: "hidden", backgroundColor: "#CECECE38" }}>
                        <Image source={{ uri: user.logo }} style={{ height: "100%", aspectRatio: 1 }} />
                    </View>
                    <View style={{ flex: 1, alignSelf: "stretch", justifyContent: "center", gap: responsiveScreenHeight(.3) }}>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "700", textTransform: "capitalize" }}>{user.name}</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", color: "#474747", textTransform: "lowercase" }}>{user.email}</Text>
                    </View>
                    <Pressable onPress={() => navigation.navigate(routes.RECRUITERPROFILE)} style={{ marginTop: responsiveScreenHeight(0) }}>
                        <Image source={imagePath.edit2} />
                    </Pressable>
                </View>
                <View style={{ gap: responsiveScreenHeight(1) }}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.COMPANYDETAILS, { id: user?.id, company: true })} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.profile} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Company Public Profile</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.ADDJOB)} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.bag} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Post a job</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.BLOGPAGE, { user_type: 'company' })} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.blog} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Creator</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.OPENJOBS)} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.book} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Manage Job</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.navigate(routes.PAYMENTHISTORY) }} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.card} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Payment History</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => {navigation.navigate(routes.ACTIVECANDIDATE)}} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                    <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.lockUser} />
                    <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Unlock Users</Text>
                    <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={() => {navigation.navigate(routes.CHAT)}} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                    <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.message2} />
                    <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Company Messages</Text>
                    <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                </TouchableOpacity> */}

                    <TouchableOpacity onPress={async () => {
                        showConfirm({
                            title: "Logout",
                            message: "Are you sure you want to Logout?",
                            okText: "Logout",
                            cancelText: "Cancel",
                            waitForOk: true,
                            onOkPress: async () => {
                                await logoutAndRestart()
                                await new Promise(resolve => setTimeout(resolve, 800))
                                return true;
                            },
                        })
                    }} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.logout2} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Logout</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async () => {
                        showConfirm({
                            title: "Delete this Company",
                            message: "Are you sure you want to delete this Company? Once you delete this your all data will permanently delete",
                            okText: "Delete",
                            cancelText: "Cancel",
                            waitForOk: true,
                            onOkPress: async () => {
                                const a = await dispatch(DeleteRecruter({ id: user.id })).unwrap()
                                if (a.success) {
                                    await logoutAndRestart()
                                    await new Promise(resolve => setTimeout(resolve, 800))
                                }
                                return true;
                            },
                        })
                    }} style={{ width: "100%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.delete} />
                        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2) }}>Delete Account</Text>
                        <Image style={{ resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.rightAngle} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </NavigationBar>
    );
};


export default Profile

const styles = StyleSheet.create({})