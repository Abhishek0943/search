import {
    ParamListBase,
    useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import imagePath from '../../assets/imagePath';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel, OtpInput } from '../../components';
import { useAppDispatch } from '../../store';
import {
    useRoute,
    RouteProp,
} from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/Button';
import { CompanyVerification, UserReSentOtp, UserVerification } from '../../reducer/userReducer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ProfileData } from '../../reducer/jobsReducer'
import { routes } from '../../constants/values';
import { PasswordStrengthIndicator } from './CompSingUp';
import {
    ComOtpVerify,
    ComResetPassword,
    ForgetPassword,
    OtpVerify,
    RecruiterForgetPassword,
    RecruiterLoginByPassword,
    RecruiterRecruiterReSentOtp,
    ResetPassword
} from '../../reducer/recruiterReducer';

const ForgotPassword = () => {
    const navigation =
        useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [hidePassword, setHidePassword] = useState(true);
    const [role, setRole] = useState<"seeker" | "recruiter">()
    useEffect(() => {
        const set = async () => {
            const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            setRole(a)
        }
        set()
    }, [])
    const route = useRoute<RouteProp<ParamListBase>>();

    const { colors } = useContext(ThemeContext);
    const RequirementRow = ({ color, text }: { color: string; text: string }) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: responsiveWidth(1.5),
                }}
            >
                <View style={{ aspectRatio: 10 / 7.2, width: responsiveWidth(3) }}>
                    <Image
                        tintColor={color}
                        style={{ height: '100%', width: '100%' }}
                        source={imagePath.Check2}
                    />
                </View>
                <Text
                    style={{
                        fontSize: responsiveFontSize(1.6),
                        fontWeight: '500',
                        color: color,
                    }}
                >
                    {text}
                </Text>
            </View>
        );
    };


    const type: 'comp' | 'jobSeeker' =
        route.params?.type === 'comp'
            ? 'comp'
            : 'jobSeeker';

    const mainColor =
        type === 'comp'
            ? colors.compPrimary
            : colors.primary;

    const secondaryColor =
        type === 'comp'
            ? colors.compPrimary2
            : colors.primary2;

    const [user, setUser] = useState<{
        email: string,
        password: string,
        confirmPassword: string,
        mobile: string
    }>({
        email: '',
        password: '',
        confirmPassword: '',
        mobile: ''
    });
    const [countryCode, setCountryCode] = useState("");
    const [otp, setOtp] = useState<Array<string>>(Array(6).fill(''));
    const handleOtpChange = (newOtp: Array<string>) => {
        setOtp(newOtp);
    };
    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };
    const [loading, setLoading] = useState(false);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(false);
    const [step, setStep] = useState(1)
    const [remainingSeconds, setRemainingSeconds] = useState(60);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dispatch = useAppDispatch()
    const startTimer = useCallback(() => {
        setRemainingSeconds(60);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);
    }, []);
    const handleSendCode = async () => {
        const email = user.email.trim();

        if (!email) {
            showAlert({
                title: "Validation",
                message: "Please enter your email address.",
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

        try {
            setLoading(true);

            if (type === "jobSeeker") {
                const res = await dispatch(
                    ForgetPassword({
                        email,
                    })
                ).unwrap();

                console.log("Job seeker forgot password:", res);

                if (res.success) {
                    setOtp(["", "", "", "", "", ""]);
                    startTimer();

                    setStep(2);
                } else {
                    showAlert({
                        title: "Validation",
                        message: res.message || "Unable to send OTP.",
                    });
                }
            } else {
                const res = await dispatch(
                    RecruiterForgetPassword({ email })
                ).unwrap();

                console.log("Company forgot password:", res);

                if (res.success) {
                    setOtp(["", "", "", "", "", ""]);
                    startTimer();

                    setStep(2);
                } else {
                    showAlert({
                        title: "Validation",
                        message: res.message || "Unable to send OTP.",
                    });
                }
            }
        } catch (error) {
            console.log("Forgot password error:", error);

            showAlert({
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join("");

        if (code.length !== 6) {
            showAlert({
                title: "Validation",
                message: "Please enter the 6-digit OTP.",
            });
            return;
        }

        try {
            setLoading(true);

            if (type === "jobSeeker") {
                const res = await dispatch(
                    OtpVerify({
                        email: user.email.trim(),
                        code,
                    })
                ).unwrap();

                console.log("Job seeker OTP verification:", res);

                if (res.success) {
                    setStep(3);
                } else {
                    showAlert({
                        title: "Invalid OTP",
                        message: res.message || "Invalid OTP.",
                    });
                }
            } else {
                const res = await dispatch(
                    ComOtpVerify({
                        email: user.email.trim(),
                        code,
                    })
                ).unwrap();

                console.log("Company OTP verification:", res);

                if (res.success) {
                    setStep(3);
                } else {
                    showAlert({
                        title: "Invalid OTP",
                        message: res.message || "Invalid OTP.",
                    });
                }
            }
        } catch (error) {
            console.log("OTP verification error:", error);

            showAlert({
                title: "Error",
                message: "Unable to verify OTP.",
            });
        } finally {
            setLoading(false);
        }
    };
    const { showAlert } = useAlert();
    const renderElem = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                        </Pressable>

                        {type === "comp" && (
                            <Image
                                style={{
                                    width: responsiveWidth(90),
                                    marginTop: responsiveHeight(3),
                                    aspectRatio: 370 / 76
                                }}
                                source={require("./Employer.png")}
                            />
                        )}
                        <Text style={{ color: secondaryColor, borderWidth: 1, lineHeight: responsiveFontSize(3.6), fontSize: responsiveFontSize(3.5), fontWeight: '700', marginTop: responsiveHeight(3) }}>Forgot your password?</Text>
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.7), fontWeight: '600', marginTop: responsiveHeight(1.5), marginBottom: responsiveHeight(1.5) }}>Tell us the email you signed up with and we
                            {'\n'}will send a 6-digit code.</Text>

                        <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(0.5) }} mainColor={mainColor} secondaryColor={secondaryColor} label='Email address' value={user.email} onChangeText={(text) => handleInputChange({ name: "email", value: text })} placeholder="manager@rozamexicano.com.au" />
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.8), fontWeight: '600', marginTop: responsiveHeight(1.5), marginBottom: responsiveHeight(4) }}>The code lasts 1 minutes.</Text>


                        <Button
                            label="Send the code"
                            backgroundColor={mainColor}
                            onPress={handleSendCode}
                        />

                        <Image
                            style={{
                                width: responsiveWidth(90),
                                marginTop: responsiveHeight(4),
                                marginBottom: responsiveHeight(4),
                                aspectRatio: 370 / 76
                            }}
                            source={
                                type === "comp"
                                    ? require("./CompSignedUpGoogleApple.png")
                                    : require("./SignedUpGoogleApple.png")
                            }
                        />
                        <Text style={{ color: secondaryColor, textAlign: 'center', borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '900', marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1.5) }}>Back to Log in</Text>
                    </>
                )
            case (2):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(1)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                        </View>
                        {type === "comp" && (
                            <Image
                                style={{
                                    width: responsiveWidth(90),
                                    marginTop: responsiveHeight(3),
                                    aspectRatio: 370 / 76
                                }}
                                source={require("./Employer.png")}
                            />
                        )}
                        <Text style={{ color: secondaryColor, borderWidth: 1, lineHeight: responsiveFontSize(3.6), fontSize: responsiveFontSize(3.5), fontWeight: '700', marginTop: responsiveHeight(3) }}>Check your email</Text>
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>We sent a 6-digit code by email.</Text>
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', }}>It expires in 10 minutes.</Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRadius: 15,
                                backgroundColor: colors.compPrimaryBg,
                                height: responsiveHeight(6),
                                paddingHorizontal: responsiveWidth(4),
                                justifyContent: 'space-between',
                                marginTop: responsiveHeight(2),
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: secondaryColor,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '800',
                                    marginRight: responsiveWidth(2),
                                }}
                            >
                                {user.email || 'abhishek'}
                            </Text>
                            <Text
                                onPress={() => {
                                    setStep(1);
                                }}
                                style={{
                                    color: mainColor,
                                    fontSize: responsiveFontSize(1.8),
                                    fontWeight: '800',
                                    marginRight: responsiveWidth(2),
                                }}
                            >
                                Change
                            </Text>
                        </View>

                        <OtpInput
                            length={6}
                            value={otp}
                            disabled={false}
                            onChange={handleOtpChange}
                            mainColor={mainColor}
                            secondaryColor={secondaryColor}

                        />
                        <View style={{ marginTop: responsiveHeight(3), flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(1) }}>
                            <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', }}>Didn't get the code?</Text>
                            {
                                remainingSeconds === 0 ?
                                    <Text onPress={() => {
                                        if (type === "jobSeeker") {
                                            dispatch(UserReSentOtp({ email: user.email })).unwrap().then((res) => {
                                                if (res.success) {
                                                    startTimer()
                                                } else {
                                                    showAlert({
                                                        title: "Validation",
                                                        message: res.message,
                                                    })
                                                }
                                            })
                                        } else {
                                            dispatch(RecruiterRecruiterReSentOtp({ email: user.email })).unwrap().then((res) => {
                                                if (res.success) {
                                                    startTimer()
                                                } else {
                                                    showAlert({
                                                        title: "Validation",
                                                        message: res.message,
                                                    })
                                                }
                                            })
                                        }

                                    }} style={{ color: mainColor, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '800', }}>Resend OTP</Text> :
                                    <Text style={{ color: mainColor, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '800', }}>Resend in {remainingSeconds}s</Text>
                            }
                        </View>
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', }}>Check your spam or junk folder before resending.</Text>
                        <Pressable style={{ width: responsiveWidth(90), marginTop: responsiveHeight(1.5), aspectRatio: 350 / 57.2, }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "cover" }} source={require("./OpenEmailApp.png")} />
                        </Pressable>
                        <Pressable style={{ width: responsiveWidth(90), marginTop: responsiveHeight(1.5), aspectRatio: 350 / 62, }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "cover" }} source={require("./NeverShareCode.png")} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Verify and Continue"
                            backgroundColor={mainColor}
                            onPress={handleVerifyOtp}
                        />
                    </>
                );

            case (3):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(1)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                        </View>
                        {type === "comp" && (
                            <Image
                                style={{
                                    width: responsiveWidth(90),
                                    marginTop: responsiveHeight(3),
                                    aspectRatio: 370 / 76
                                }}
                                source={require("./Employer.png")}
                            />
                        )}
                        <Text style={{ color: secondaryColor, borderWidth: 1, lineHeight: responsiveFontSize(3.6), fontSize: responsiveFontSize(3.5), fontWeight: '700', marginTop: responsiveHeight(3) }}>Set a new password</Text>
                        <Text style={{ color: colors.textSecondary, marginBottom: responsiveHeight(3), borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>Pick something you have not used here before.</Text>
                        <InPutWithLabel
                            inputContainerStyle={{
                                marginBottom: responsiveHeight(0.3)
                            }}
                            mainColor={mainColor}
                            secondaryColor={secondaryColor}
                            label="New Password"
                            secureText={hidePassword}
                            rightIcon={() => (
                                <TouchableOpacity onPress={() => setHidePassword(prev => !prev)}>
                                    <Image
                                        style={{
                                            width: responsiveWidth(2.8),
                                            aspectRatio: 20 / 11.5
                                        }}
                                        source={
                                            hidePassword
                                                ? imagePath.EyeOpen
                                                : imagePath.EyeOpen
                                        }
                                    />
                                </TouchableOpacity>
                            )}
                            value={user.password}
                            onChangeText={(text) =>
                                handleInputChange({
                                    name: "password",
                                    value: text
                                })
                            }
                            placeholder="Password"
                        />
                        <View style={{ marginBottom: responsiveHeight(0.5) }}>
                            <PasswordStrengthIndicator
                                password={user.password}
                                mainColor={mainColor}
                                secondaryColor={secondaryColor}
                            />
                        </View>
                        <View style={{ marginBottom: responsiveHeight(3.5), marginTop: responsiveHeight(2) }}>
                            <InPutWithLabel inputContainerStyle={{ marginTop: responsiveHeight(0.5), marginBottom: responsiveHeight(0.5) }} mainColor={mainColor} secondaryColor={secondaryColor} label='Confirm password' secureText={hideConfirmPassword} rightIcon={() => {
                                return (
                                    <TouchableOpacity onPress={() => setHideConfirmPassword(prev => !prev)}>
                                        <Image
                                            style={{
                                                width: responsiveWidth(2.8),
                                                aspectRatio: 20 / 11.5
                                            }}
                                            source={
                                                hidePassword
                                                    ? imagePath.EyeOpen
                                                    : imagePath.EyeOpen
                                            }
                                        />
                                    </TouchableOpacity>
                                )
                            }} value={user.confirmPassword} onChangeText={(text) => handleInputChange({ name: "confirmPassword", value: text })} placeholder="Password" />
                            {user.confirmPassword.length > 0 && (
                                <RequirementRow color={user.password === user.confirmPassword ? secondaryColor : colors.textSecondary} text="Both passwords match" />
                            )}
                        </View>

                        <Button
                            label={loading ? "Saving..." : "Save and log in"}
                            backgroundColor={mainColor}
                            onPress={async () => {
                                const email = user.email.trim();

                                if (!user.password) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please enter a new password.",
                                    });
                                    return;
                                }

                                if (!user.confirmPassword) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please confirm your new password.",
                                    });
                                    return;
                                }

                                if (user.password !== user.confirmPassword) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Passwords do not match.",
                                    });
                                    return;
                                }

                                if (loading) return;

                                try {
                                    setLoading(true);

                                    if (type === "jobSeeker") {
                                        const res = await dispatch(
                                            ResetPassword({
                                                email,
                                                password: user.password,
                                                password_confirmation: user.confirmPassword,
                                            })
                                        ).unwrap();

                                        console.log("Job seeker reset password:", res);

                                        if (res.success) {
                                            showAlert({
                                                title: "Success",
                                                message: "Password reset successfully.",
                                            });

                                            navigation.goBack();
                                        } else {
                                            showAlert({
                                                title: "Error",
                                                message: res.message || "Unable to reset password.",
                                            });
                                        }

                                    } else {
                                        const res = await dispatch(
                                            ComResetPassword({
                                                email,
                                                password: user.password,
                                                password_confirmation: user.confirmPassword,
                                            })
                                        ).unwrap();

                                        console.log("Company reset password:", res);

                                        if (res.success) {
                                            showAlert({
                                                title: "Success",
                                                message: "Password reset successfully.",
                                            });

                                            navigation.goBack();
                                        } else {
                                            showAlert({
                                                title: "Error",
                                                message: res.message || "Unable to reset password.",
                                            });
                                        }
                                    }

                                } catch (error: any) {
                                    console.log("Reset password error:", error);

                                    showAlert({
                                        title: "Error",
                                        message:
                                            error?.message ||
                                            "Something went wrong while resetting your password.",
                                    });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />

                        <Image
                            style={{
                                width: responsiveWidth(90),
                                marginTop: responsiveHeight(4),
                                marginBottom: responsiveHeight(4),
                                aspectRatio: 370 / 76
                            }}
                            source={
                                type === "comp"
                                    ? require("./CompSignedUpGoogleApple.png")
                                    : require("./SignedUpGoogleApple.png")
                            }
                        />

                    </>);
        }
    };

    useEffect(() => {
        const a = async () => {
            const ipResponse = await fetch('https://api64.ipify.org?format=json');
            const { ip } = await ipResponse.json();
            const response = await fetch(
                `http://ip-api.com/json/${ip}?fields=2158591`,
            );
            const data = await response.json();
            const callingCodes: Record<string, string> = {
                IN: '+91',
                PK: '+92',
                US: '+1',
                GB: '+44',
                AU: '+61',
                CA: '+1',
                JP: '+81',
            };
            setCountryCode(callingCodes[data.countryCode] || '');
        };
        a();
    }, []);

    return (
        <>
            <View
                style={{
                    backgroundColor: colors.background,
                    paddingBottom: responsiveHeight(8),
                    height: responsiveHeight(100),
                    width: responsiveWidth(100),
                    flex: 1,
                    paddingHorizontal: responsiveWidth(5),
                    paddingVertical: responsiveHeight(2),
                }}
            >
                {renderElem()}
            </View>
        </>
    );
};

export default ForgotPassword;
