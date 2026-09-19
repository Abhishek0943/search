import React, { useContext, useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveScreenHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import imagePath from '../../assets/imagePath'
import InputWithLabel from '../../components/InPutWithLabel'
import Text from '../../components/Text'
import { ThemeContext } from '../../context/ThemeProvider'
import { routes } from '../../constants/values'
import Button from '../../components/Button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ComLoginByPassword } from '../../reducer/recruiterReducer'
import { useAppDispatch } from '../../store';
import { useAlert } from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecruiterProfile } from '../../reducer/recruiterReducer';
import { googleLogin } from '../../utils/socialLogin'
import { postApiCall } from '../../api'
import { getFCMToken } from '../../utils/notificationService'
import authStyles from './styles'

const CompLogin = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [hidePassword, setHidePassword] = useState(false);
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{
        email: string,
        password: string
    }>({
        email: '',
        password: '',
    });
    const { colors } = useContext(ThemeContext);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (googleLoading) return;
        setGoogleLoading(true);
        try {
            const result = await googleLogin();
            if ('code' in result) {
                // User cancelled or error
                return;
            }
            const userInfo = result as any;
            const userData = userInfo?.data?.user || userInfo?.user || userInfo;
            if (!userData?.email) {
                showAlert({ title: 'Error', message: 'Could not get email from Google account' });
                return;
            }
            const FCM = await getFCMToken();
            const res: any = await postApiCall('/auth/companies/social-login', {
                device_token: FCM,
                device_type: Platform.OS,
                type: 'google',
                auth_id: userData.id,
                name: userData.givenName || userData.name || '',
                email: userData.email,
            });
            if (res?.success || res?.data?.token) {
                await AsyncStorage.setItem('token', res.data.token);
                await AsyncStorage.setItem("role", "recruiter");
                await checkCompanyRegistration();
            } else {
                showAlert({ title: 'Error', message: res?.message || 'Google login failed' });
            }
        } catch (error: any) {
            console.log('Google login error', error);
            showAlert({ title: 'Error', message: error?.message || 'Google login failed' });
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleLogin = async () => {
        const email = user.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert({
                title: "Validation",
                message: "Please enter a valid email address.",
            });
            return;
        }

        if (!user.password) {
            showAlert({
                title: "Validation",
                message: "Please enter your password.",
            });
            return;
        }

        if (loading) return;
        try {
            setLoading(true);
            const res = await dispatch(ComLoginByPassword({ email, password: user.password })).unwrap();
            if (!res.success) {
                showAlert({
                    title: "Login Failed",
                    message: res.message || "Invalid email or password.",
                });
                return;
            }
            const token = res.data.token;

            if (!token) {
                showAlert({
                    title: "Error",
                    message: "Login successful but token was not received.",
                });
                return;
            }
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("role", "recruiter");
            await checkCompanyRegistration();

        } catch (error) {
            console.log(
                "Company login error:",
                error
            );

            showAlert({
                title: "Login Failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
            });

        } finally {
            setLoading(false);
        }
    };


    const checkCompanyRegistration = async () => {
        try {
            const profileRes = await dispatch(
                RecruiterProfile()
            ).unwrap();

            console.log(
                "Company Profile:",
                JSON.stringify(profileRes, null, 2)
            );

            // First check success
            if (!profileRes.success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: routes.DETAILS }],
                });
                return;
            }

            // Now TypeScript knows this is the successful response
            const onboardingStep = profileRes.data.onboarding_step;

            console.log("Onboarding Step:", onboardingStep);

            if (onboardingStep === 1) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: routes.DETAILS }],
                });
                return;
            }

            if (onboardingStep === 2) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: routes.HOME }],
                });
                return;
            }

            // Unknown onboarding step
            navigation.reset({
                index: 0,
                routes: [{ name: routes.DETAILS }],
            });

        } catch (error) {
            console.log(
                "Company profile check error:",
                error
            );

            navigation.reset({
                index: 0,
                routes: [{ name: routes.DETAILS }],
            });
        }
    };

    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };
    const insets = useSafeAreaInsets();
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ height: responsiveScreenHeight(100) - insets.bottom, }}>
                <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), flex: 1, }}>
                    <Image style={authStyles.bgImage} source={require("../Welcome/BgGradiant.png")} />
                    <View style={{ position: "absolute", paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: responsiveWidth(5), top: 0, left: 0, height: responsiveHeight(100), width: responsiveWidth(100), }}>
                        <Pressable onPress={() => navigation.goBack()} style={authStyles.backButton}>
                            <Image style={authStyles.bgImage} source={imagePath.leftAngle} />
                        </Pressable>
                        <View style={{ width: responsiveWidth(75), marginBottom: responsiveHeight(3), marginTop: responsiveHeight(3), aspectRatio: 238 / 120.5 }}>
                            <Image style={authStyles.bgImage} source={require("./images/LoginTop.png")} />
                        </View>
                        <InputWithLabel label='Work Email' value={user.email} onChangeText={(text) => handleInputChange({ name: "email", value: text })} placeholder="Email" mainColor={''} secondaryColor={''} />
                        <InputWithLabel sideOption={() => {
                            return (
                                <Text onPress={() => {
                                    navigation.navigate(routes.FORGOTPASSWORD, { type: 'comp' })
                                }} style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '800' }}>
                                    Forget?
                                </Text>
                            )
                        }} label='Password' secureText={hidePassword} rightIcon={() => {
                            return (
                                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                                    <Image style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.4 }} source={imagePath.EyeOpen} />
                                </TouchableOpacity>
                            )
                        }} value={user.password} onChangeText={(text) => handleInputChange({ name: "password", value: text })} placeholder="Password" mainColor={''} secondaryColor={''} />
                        <View style={authStyles.checkboxRow}>
                            <Pressable style={authStyles.checkboxIcon}>
                                <Image style={authStyles.bgImage} source={imagePath.CompCheck} />
                            </Pressable>
                            <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>
                                Keep me logged in on this phone
                            </Text>
                        </View>
                        <Button
                            label={loading ? "Logging in..." : "Log in"}
                            backgroundColor={colors.compPrimary}
                            onPress={handleLogin}
                        />
                        <Pressable style={authStyles.loginDivider}>
                            <Image style={authStyles.bgImage} source={require("./images/Devider.png")} />
                        </Pressable>
                        <View style={authStyles.socialRow}>
                            <Pressable onPress={handleGoogleLogin} disabled={googleLoading} style={[authStyles.socialButton, { opacity: googleLoading ? 0.6 : 1 }]}>
                                <Image style={authStyles.bgImage} source={require("./images/GoogleButton.png")} />
                                {googleLoading && (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.compPrimary}
                                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                                    />
                                )}
                            </Pressable>
                            <Pressable style={authStyles.socialButton}>
                                <Image style={authStyles.bgImage} source={require("./images/GoogleButton.png")} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => { navigation.replace(routes.LOGIN) }} style={authStyles.switchLink}>
                            <Image style={authStyles.bgImage} source={require("./images/SweechToEmploye.png")} />
                        </Pressable>
                        <View style={authStyles.createAccountRow}>
                            <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.6), }}>New to SearchTalents?</Text>
                            <Text onPress={() => {
                                navigation.navigate(routes.COMPSINGUP)
                            }} style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '800' }}> Create an account</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default CompLogin