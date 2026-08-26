
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
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import imagePath from '../../assets/imagePath';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel, CustomTextInput, OtpInput } from '../../components';
import { useAppDispatch } from '../../store';
import {
    RecruiterRecruiterReSentOtp,
    RecruiterRegister,
} from '../../reducer/recruiterReducer';
import { useAlert } from '../../context/AlertContext';
import Button from '../../components/Button';
import { CompanyVerification, UserRegister, UserReSentOtp, UserVerification } from '../../reducer/userReducer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ProfileData } from '../../reducer/jobsReducer'
import { routes } from '../../constants/values';
import { SafeAreaView } from 'react-native-safe-area-context';
const CompSingUp = () => {
    const { colors } = useContext(ThemeContext);
    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ComponentSingUp
                        type={'comp'}
                        mainColor={colors.compPrimary}
                        secondaryColor={colors.compPrimary2}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>

        </>
    );
};

export default CompSingUp;

type PasswordStrength = 'none' | 'weak' | 'good' | 'strong';
const getPasswordStrength = (
    password: string,
    mainColor: string,
): {
    strength: PasswordStrength;
    label: string;
    color: string;
    bars: number;
    hasMinLength: boolean;
    hasNumberOrSymbol: boolean;
} => {
    const hasMinLength = password.length >= 8;
    const hasNumberOrSymbol = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password,
    );
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (password.length === 0) {
        return {
            strength: 'none',
            label: '',
            color: '#DEDEDE',
            bars: 0,
            hasMinLength,
            hasNumberOrSymbol,
        };
    }

    let score = 0;
    if (hasMinLength) score++;
    if (hasNumberOrSymbol) score++;
    if (hasUpperCase && hasLowerCase) score++;

    if (score <= 1) {
        return {
            strength: 'weak',
            label: 'Weak',
            color: '#E74C3C',
            bars: 1,
            hasMinLength,
            hasNumberOrSymbol,
        };
    } else if (score === 2) {
        return {
            strength: 'good',
            label: 'Good',
            color: '#F39C12',
            bars: 2,
            hasMinLength,
            hasNumberOrSymbol,
        };
    } else {
        return {
            strength: 'strong',
            label: 'Strong',
            color: mainColor,
            bars: 3,
            hasMinLength,
            hasNumberOrSymbol,
        };
    }
};

export const PasswordStrengthIndicator = ({
    password,
    mainColor,
    secondaryColor,
}: {
    password: string;
    mainColor: string;
    secondaryColor: string;
}) => {
    const { colors } = useContext(ThemeContext);
    const info = useMemo(
        () => getPasswordStrength(password, secondaryColor),
        [password, secondaryColor],
    );
    if (password.length === 0) return null;
    return (
        <View style={{ marginTop: responsiveHeight(0.8) }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: responsiveHeight(1),
                }}
            >
                {[0, 1, 2].map(i => (
                    <View
                        key={i}
                        style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 2,
                            backgroundColor: i < info.bars ? info.color : colors.gray,
                            marginRight: i < 2 ? responsiveWidth(1.5) : 0,
                        }}
                    />
                ))}
                <Text
                    style={{
                        marginLeft: responsiveWidth(2),
                        fontSize: responsiveFontSize(1.6),
                        fontWeight: '700',
                        color: mainColor,
                    }}
                >
                    {info.label}
                </Text>
            </View>

            <View style={{ gap: responsiveHeight(0.4) }}>
                <RequirementRow
                    color={info.hasMinLength ? secondaryColor : colors.textSecondary}
                    text="At least 8 characters"
                />
                <RequirementRow
                    color={info.hasNumberOrSymbol ? secondaryColor : colors.textSecondary}
                    text="One number or symbol"
                />
            </View>
        </View>
    );
};

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

export const ComponentSingUp = ({
    mainColor,
    secondaryColor,
    type = 'jobSeeker',
    emailText = 'A business address speeds up verification later.',
}: {
    mainColor: string;
    secondaryColor: string;
    type: 'comp' | 'jobSeeker';
    emailText?: string;
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { colors } = useContext(ThemeContext);
    const [hidePassword, setHidePassword] = useState(false);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(false);
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
    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };
    const [otp, setOtp] = useState<Array<string>>(Array(6).fill(''));
    const handleOtpChange = (newOtp: Array<string>) => {
        setOtp(newOtp);
    };
    const [step, setStep] = useState(1)
    const [remainingSeconds, setRemainingSeconds] = useState(60);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dispatch = useAppDispatch()
    const startTimer = useCallback(() => {
        setRemainingSeconds(60);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);
    const { showAlert } = useAlert();
    const renderElem = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View style={{}}>
                                <Text style={{ color: mainColor, borderWidth: 1, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 1 of 2
                                </Text>
                                <Text style={{ color: secondaryColor, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Your account
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor: i <= step ? mainColor : colors.gray,
                                    }}
                                />
                            ))}

                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), position: "relative", right: responsiveWidth(5), aspectRatio: 350 / 1 }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
                        </Pressable>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>Three short steps. Then you're in.</Text>
                            <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(.5) }} mainColor={mainColor} secondaryColor={secondaryColor} label={type === "comp" ? 'Work Email' : 'Email address'} value={user.email} onChangeText={(text) => handleInputChange({ name: "email", value: text })} placeholder="Email" />
                            <Text style={{ marginBottom: responsiveHeight(1), color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', }}>{emailText}</Text>
                            <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(0.3) }} mainColor={mainColor} secondaryColor={secondaryColor} label='Create a password' secureText={hidePassword} rightIcon={() => {
                                return (
                                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                                        <Image style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.5 }} source={imagePath.EyeOpen} />
                                    </TouchableOpacity>
                                )
                            }} value={user.password} onChangeText={(text) => handleInputChange({ name: "password", value: text })} placeholder="Password" />
                            <PasswordStrengthIndicator password={user.password} mainColor={mainColor} secondaryColor={secondaryColor} />
                            <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(0.3) }} mainColor={mainColor} secondaryColor={secondaryColor} label='Confirm password' secureText={hideConfirmPassword} rightIcon={() => {
                                return (
                                    <TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                                        <Image style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.5 }} source={imagePath.EyeOpen} />
                                    </TouchableOpacity>
                                )
                            }} value={user.confirmPassword} onChangeText={(text) => handleInputChange({ name: "confirmPassword", value: text })} placeholder="Password" />
                            {user.confirmPassword.length > 0 && (
                                <RequirementRow color={user.password === user.confirmPassword ? secondaryColor : colors.textSecondary} text="Both passwords match" />
                            )}
                            <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), marginTop: responsiveHeight(1) }}>
                                <Text style={{ color: secondaryColor || colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>Mobile number</Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 15, borderColor: colors.surfaces, borderStyle: 'dashed', height: responsiveHeight(6), paddingHorizontal: responsiveWidth(4), marginBottom: responsiveHeight(1) }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2), fontWeight: '600', marginRight: responsiveWidth(2) }}>{countryCode || "+61"}</Text>
                                <View style={{ width: 1, height: '60%', backgroundColor: colors.surfaces, marginRight: responsiveWidth(2) }} />
                                <CustomTextInput
                                    style={{ flex: 1, fontSize: responsiveFontSize(2), fontWeight: '400', color: colors.textPrimary, paddingVertical: 0 }}
                                    value={user.mobile}
                                    onChangeText={(text: string) => handleInputChange({ name: "mobile", value: text })}
                                    placeholder="For urgent shift alerts only"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={{ flex: 1 }}>

                            </View>
                        </ScrollView>

                        <Pressable style={{ width: responsiveWidth(100), marginVertical: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
                        </Pressable>
                        <Button
                            label="Send Verification Code"
                            backgroundColor={mainColor}
                            onPress={() => {
                                if (type === "jobSeeker") {
                                    dispatch(UserRegister({ email: user.email, password: user.password, password_confirmation: user.confirmPassword, terms_of_use: true })).unwrap().then((res) => {
                                        if (res.success) {
                                            startTimer();
                                            setStep(2)
                                        } else {
                                            showAlert({
                                                title: "Validation",
                                                message: res.message,
                                            })
                                        }
                                    })

                                } else {
                                    dispatch(RecruiterRegister({ email: user.email, password: user.password, password_confirmation: user.confirmPassword, })).unwrap().then((res) => {
                                        if (res.success) {
                                            startTimer();
                                            setStep(2)
                                        } else {
                                            showAlert({
                                                title: "Validation",
                                                message: res.message,
                                            })
                                        }
                                    })

                                }
                            }}
                        />
                    </>
                )
            case (2):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(1)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View style={{}}>
                                <Text style={{ color: mainColor, borderWidth: 1, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 2 of 2
                                </Text>
                                <Text style={{ color: secondaryColor, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Verify your email
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor: i <= step ? mainColor : colors.gray,
                                    }}
                                />
                            ))}

                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), position: "relative", right: responsiveWidth(5), aspectRatio: 350 / 1 }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
                        </Pressable>
                        <ScrollView showsVerticalScrollIndicator={false}>


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
                                            if (type = "jobSeeker") {
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
                        </ScrollView>

                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Verify and Continue"
                            backgroundColor={mainColor}
                            onPress={() => {
                                const a = otp.join("")
                                if (type === "jobSeeker") {
                                    dispatch(UserVerification({ email: user.email, code: a }))
                                        .unwrap()
                                        .then(async (res) => {
                                            if (res.success) {
                                                showAlert({
                                                    title: "Success",
                                                    message: "Your account registered successfully",
                                                });
                                                await AsyncStorage.setItem('token', res.data.token)
                                                dispatch(ProfileData()).unwrap().then((res) => {
                                                    if (res.success) {
                                                        if (res.data.login_step === 1) {
                                                            navigation.reset({
                                                                index: 0,
                                                                routes: [{ name: routes.USERSTEPS }]
                                                            });

                                                        }
                                                    }
                                                });
                                            } else {
                                                showAlert({
                                                    title: "Error",
                                                    message: res.message,
                                                });
                                            }
                                        });
                                } else {
                                    dispatch(CompanyVerification({ email: user.email, code: a }))
                                        .unwrap()
                                        .then(async (res) => {
                                            if (res.success) {
                                                showAlert({
                                                    title: "Success",
                                                    message: "Your account registered successfully",
                                                });
                                                await AsyncStorage.setItem('token', res.data.token)
                                            } else {
                                                showAlert({
                                                    title: "Error",
                                                    message: res.message,
                                                });
                                            }
                                        });
                                }
                            }}
                        />
                    </>
                );
        }
    };
    useEffect(() => {
        const a = async () => {
            const ipResponse = await fetch('https://api64.ipify.org?format=json');
            const { ip } = await ipResponse.json();

            console.log('IP:', ip);

            // Get country information
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
                    height: responsiveHeight(100),
                    width: responsiveWidth(100),
                    flex: 1,
                    paddingBottom: responsiveHeight(2),
                    paddingVertical: responsiveHeight(1),
                    paddingHorizontal: responsiveWidth(5),
                }}
            >
                {renderElem()}
            </View>
        </>
    );
};
