import { View, ScrollView, Image, TouchableOpacity, ImageBackground, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import RNRestart from 'react-native-restart';

import { routes } from '../../constants/values'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { useAppDispatch, useAppSelector } from '../../store'
import { ProfileData, ProfileData2, UpdateProfile } from '../../reducer/jobsReducer'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../../components/Text';
import ImagePicker from 'react-native-image-crop-picker';
const logoutUser = async () => {
    try {
        await AsyncStorage.multiRemove([
            'token',
            'role',
        ]);
    } catch (e) {
    }
};
const logoutAndRestart = async () => {
    await logoutUser();
    RNRestart.restart();
};
const Profile = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector(state => state.userStore)
    const [profile, setProfile] = useState<User>()
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    const pickImage = async (field:string) => {
        try {
            const image = await ImagePicker.openPicker({
                // width: 800,
                // height: 800,
                // cropping: true,
                cropperCircleOverlay: false, // true if profile pic
                compressImageQuality: 0.9,
                mediaType: 'photo',
            });

            if (!image?.path) return;

            const fileName = `project_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`;

            const fd = new FormData();

            fd.append(field, {
                uri: image.path,
                name: fileName,
                type: image.mime || 'image/jpeg',
            } as any);

            setProfile({ ...profile, [field]: image.path });
console.log(fd)
            dispatch(UpdateProfile(fd))
                .unwrap()
                .then((res) => {
                    if (res.success) {
                        console.log(res)
                        dispatch(ProfileData())
                    }
                    else {
                        Alert.alert('Error', 'Failed to update profile image.');
                    }
                })



        } catch (e) {
            console.log('Image pick cancelled or error', e);
        }
    };
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        dispatch(ProfileData()).unwrap().then((res) => {
            // if (res.success) {

            //     setProfile(res.data)
            // }
            // else {
            //     setProfile(user)
            // }
            // setLoading(false)
        })

        setRefreshing(false);
    };
    useEffect(() => { setProfile(user) }, [user])
    return (
        <>
            <NavigationBar name={routes.PROFILE} statusbar={false}>
                <ScrollView refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                } style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}>
                    {
                        (!user || !user.id) ? <>
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: responsiveScreenHeight(2), paddingVertical: responsiveScreenHeight(20) }}>
                                <Image source={imagePath.image1} />
                                <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", textAlign: "center", width: responsiveScreenWidth(80) }}>You’re not logged in. Please log in to access this feature</Text>
                                <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(2) }}>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                        <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Register</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>Log In</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </> : profile?.id && !loading ?
                            <>
                                <View style={{ flex: 1, width: "100%", gap: responsiveScreenHeight(2.6), }}>
                                    <ImageBackground style={{ borderWidth: 1, backgroundColor: colors.gray, position: "relative", height: responsiveScreenHeight(25) }} source={{
                                        uri: profile.cover_image
                                    }}>
                                        <TouchableOpacity onPress={() => pickImage("cover_image")} style={{ position: "absolute", bottom: responsiveScreenHeight(1), right: responsiveScreenWidth(2) }}>
                                            <Image source={imagePath.camera} style={{}} />
                                        </TouchableOpacity>
                                        <View style={{ maxHeight: responsiveScreenHeight(21), width: responsiveScreenWidth(70), backgroundColor: colors.white, paddingVertical: responsiveScreenHeight(2), borderRadius: 15, borderWidth: 1, borderColor: colors.lightGrayNatural, marginHorizontal: "auto", position: "relative", top: "70%", gap: responsiveScreenHeight(1), paddingTop: 0, }}>
                                            <View style={{ borderRadius: 100, height: responsiveScreenHeight(10), aspectRatio: 1, position: "relative", top: "-30%", marginHorizontal: "auto" }}>
                                                <Image source={{ uri: profile.image }} style={{ borderRadius: 100, height: "100%", backgroundColor: "white", }} />
                                                <TouchableOpacity onPress={() => pickImage("image", 1)} style={{ backgroundColor: colors.primary, borderRadius: 100, padding: 3, borderWidth: 2, borderColor: "white", position: "absolute", bottom: responsiveScreenHeight(1), right: responsiveScreenWidth(0) }}>
                                                    <Image source={imagePath.camera2} style={{}} />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={{ textAlign: "center", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.1), position: "relative", top: "-30%", fontWeight: "600", textTransform: "capitalize" }}>{profile.name}</Text>
                                            <Text style={{ position: "relative", top: "-30%", textAlign: "center", color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), textTransform: "lowercase" }}>{profile.email}</Text>
                                            <View style={{ position: "relative", top: "-30%", width: "100%", borderBottomWidth: 1, borderBottomColor: colors.textDisabled }}></View>
                                            <View style={{ position: "relative", top: "-30%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: responsiveScreenWidth(2) }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ textAlign: "center", color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), textTransform: "capitalize" }}>Applied</Text>
                                                    <Text style={{ textAlign: "center", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.2), fontWeight: "600", textTransform: "capitalize" }}>{profile.applied_jobs_count}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ textAlign: "center", color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), textTransform: "capitalize" }}>Favorite</Text>
                                                    <Text style={{ textAlign: "center", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.2), fontWeight: "600", textTransform: "capitalize" }}>{profile.favorite_companies_count}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ textAlign: "center", color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), textTransform: "capitalize" }}>View</Text>
                                                    <Text style={{ textAlign: "center", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.2), fontWeight: "600", textTransform: "capitalize" }}>{profile.profile_views}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.PERSONALINFO, { ...user })} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(15), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} tintColor={colors.textPrimary} source={imagePath.profile} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Personal Information</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.WORKEXPERIENCE)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.bag} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Work Experience</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.SUGGESTEDJOB, { isBookmark: true })} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.bookmark} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Save Jobs</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.COMPANY, { isFavorite: true })} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.heart} />

                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Favorite company</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.EDUCATION)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.education2} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Education</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.CV)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.CV} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Add CV</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.PROJECT)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.project} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Project</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.SKILL)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.skill} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Skills</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.LANGUAGE)} style={{ width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.language} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Language</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={logoutAndRestart} style={{ marginBottom: responsiveScreenHeight(5), width: "90%", marginHorizontal: "auto", flexDirection: "row", marginTop: responsiveScreenHeight(1), alignItems: "center", gap: responsiveScreenHeight(1) }}>
                                        <Image tintColor={colors.textPrimary} style={{ width: responsiveScreenWidth(7), resizeMode: "contain" }} source={imagePath.logout} />
                                        <Text style={{ fontSize: responsiveScreenFontSize(2) }}>Log Out</Text>
                                    </TouchableOpacity>


                                </View>
                            </> : <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: responsiveScreenHeight(2), paddingVertical: responsiveScreenHeight(50) }}>
                                <ActivityIndicator size={responsiveScreenFontSize(3)} />
                            </View>
                    }
                </ScrollView>
            </NavigationBar>
            {/* <Image style={{ position: "absolute", height: "100%", width: "100%", opacity: .1 }} source={require("./Profile.png")} /> */}
        </>

    )
}

export default Profile