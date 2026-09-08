import React, { useContext, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
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

    const handleLogin = async () => {
        const email = user.email.trim();

        if (!email) {
            showAlert({
                title: "Validation",
                message: "Please enter your work email.",
            });
            return;
        }

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

            const res = await dispatch(
                ComLoginByPassword({
                    email,
                    password: user.password,
                })
            ).unwrap();

            console.log(
                "Company login:",
                JSON.stringify(res, null, 2)
            );

            // Check response success first
            if (!res.success) {
                showAlert({
                    title: "Login Failed",
                    message: res.message || "Invalid email or password.",
                });
                return;
            }

            // Login successful
            const token = res.data.token;

            if (!token) {
                showAlert({
                    title: "Error",
                    message: "Login successful but token was not received.",
                });
                return;
            }

            // Save token and role
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("role", "recruiter");

            // Check recruiter onboarding status
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
                    <Image style={{ height: "100%", width: "100%", }} source={require("../Welcome/BgGradiant.png")} />
                    <View style={{ position: "absolute", paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: responsiveWidth(5), top: 0, left: 0, height: responsiveHeight(100), width: responsiveWidth(100), }}>
                        <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                        </Pressable>
                        <View style={{ width: responsiveWidth(75), marginBottom: responsiveHeight(3), marginTop: responsiveHeight(3), aspectRatio: 238 / 120.5 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./LoginTop.png")} />
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
                        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveWidth(2), marginBottom: responsiveHeight(3) }}>
                            <Pressable style={{ width: responsiveWidth(4), aspectRatio: 1 / 1 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.CompCheck} />
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
                        <Pressable style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 16 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./Devider.png")} />
                        </Pressable>
                        <View style={{ flexDirection: "row", marginTop: responsiveHeight(2.5), gap: responsiveWidth(3), width: responsiveWidth(90) }}>
                            <Pressable style={{ flex: 1, aspectRatio: 169 / 56 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={require("./GoogleButton.png")} />
                            </Pressable>
                            <Pressable style={{ flex: 1, aspectRatio: 169 / 56 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={require("./GoogleButton.png")} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => { navigation.replace(routes.LOGIN) }} style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 66 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./SweechToEmploye.png")} />
                        </Pressable>
                        <View style={{ marginTop: responsiveHeight(2), flexDirection: "row", justifyContent: 'center' }}>
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