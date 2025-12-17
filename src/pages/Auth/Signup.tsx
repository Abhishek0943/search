import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  responsiveHeight,
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { InPutWithLabel, OtpInput, } from '../../components';
import { ThemeContext } from '../../context/ThemeProvider';
import Icon from '../../utils/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store';
import { CompleteSteps, GetCountries, GetTopics, UserRegister, UserReSentOtp, UserVerification } from '../../reducer/userReducer';
import { HOST, routes } from '../../constants/values';
import { Footer } from '../Welcome/Welcome';
import { OrSeparator, SOCIAL_PROVIDERS, SocialButton } from '../Welcome/WelcomeTwo';
import Button from '../../components/Button';
import { RecruiterRegister } from '../../reducer/recruiterReducer';
const SIGNUP_DATA_KEY = 'signupUserData';
const SIGNUP_STEP_KEY = 'signupCurrentStep';
const Signup = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const { colors } = useContext(ThemeContext)
  const [searchCountry, setSearchCountry] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const { countries, user, } = useAppSelector(state => state.userStore)
  const topic = useAppSelector(state => state.userStore.topic)
  const dispatch = useAppDispatch()
  const [userData, setUserData] = useState<{
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    ACN: string,
    ABN: string,
    confirmPassword: string;
    passwordVisible: boolean;
    isRemember: boolean;
  }>({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    ACN: "",
    ABN: "",
    confirmPassword: "",
    passwordVisible: false,
    isRemember: false,
  })
  const [token, setToken] = useState("")
  const [otp, setOtp] = useState<Array<string>>(Array(6).fill(''));
  const handleOtpChange = (newOtp: Array<string>) => {
    setOtp(newOtp);
  };
  useEffect(() => {
    if (user) {
      setCurrentStep(Number(user.step))
    }
  }, [user])
  useEffect(() => {
    if (countries.length === 0) {
      dispatch(GetCountries());
    }
  }, [dispatch, countries.length]);
  useEffect(() => {
    if (topic.length === 0) {
      dispatch(GetTopics());
    }
  }, [dispatch, topic.length]);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const startTimer = useCallback(() => {
    setRemainingSeconds(10);
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
  useFocusEffect(
    useCallback(() => {
      if (currentStep === 2) {
        startTimer();
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [currentStep, startTimer])
  );
  const [role, setRole] = useState<"seeker" | "recruiter">()
  useEffect(() => {
    const set = async () => {
      const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      setRole(a)
    }
    set()
  }, [])
  const [loading, setLoading] = useState(false)
  const handleRegister =
    () => {
      if (!userData.confirmPassword || !userData.password || !userData.firstName || !userData.email) return Alert.alert("all felids are required")
      if (userData.firstName.length < 3 || userData.firstName.length > 10) return Alert.alert("User name length will with in the 3 - 10 characters")
      if (userData.password.length < 8) return Alert.alert("Password length will be 8 or more then 8")
      if (userData.password !== userData.confirmPassword) return Alert.alert("Password and confirm password is not match ")
      setLoading(true)
      if (role === "recruiter") {
        dispatch(RecruiterRegister({ acn_number: userData.ACN, abn_number: userData.ABN, first_name: userData.firstName, last_name: userData.lastName, email: userData.email, password: userData.password, password_confirmation: userData.confirmPassword, terms_of_use: userData.isRemember })).unwrap().then((res) => {
          setLoading(false)
          if (res.success) {
            startTimer();
            setCurrentStep(2)
          } else {
            Alert.alert(res.message)
          }
        })
      }
      else {

        dispatch(UserRegister({ first_name: userData.firstName, last_name: userData.lastName, email: userData.email, password: userData.password, password_confirmation: userData.confirmPassword, terms_of_use: userData.isRemember })).unwrap().then((res) => {
          setLoading(false)
          if (res.success) {
            startTimer();
            setCurrentStep(2)
          } else {
            Alert.alert(res.message)
          }
        })
      }

    }
  const handleComplete =
    () => {
      if (!userData.firstName || !userData.email || !userData.password) return Alert.alert("all felids are required")
      if (userData.firstName.length < 3) return Alert.alert(" name length will be more 3 characters")
      if (user)
        // dispatch(CompleteSteps({ id: user._id, step: currentStep, dob: userData.dob, gender: userData.gender, name: userData.firstName, })).unwrap().then((res) => {
        //   if (res.success) {
        setCurrentStep(currentStep + 1)
      //   } else {
      //     Alert.alert(res.message)
      //   }
      // })
    }
  const elemRender = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(10), }}>
              <Icon onPress={() => navigation.goBack()} icon={{ type: "Feather", name: "chevron-left" }} size={responsiveScreenFontSize(2.5)} style={{ backgroundColor: colors.gray, borderRadius: 10, color: colors.hardGray, padding: responsiveScreenWidth(1.2) }} />
            </View>
            <Text style={[SignupStyle.title, { marginBottom: responsiveScreenHeight(3), color: colors.textPrimary }]}>
              Signup
            </Text>
            {SOCIAL_PROVIDERS.map(({ name, logo }) => (
              <SocialButton key={name} logo={logo} children="Sign in with Google" />
            ))}
            <OrSeparator text="or sign in with" />

            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, firstName: text })
              }}
              value={userData.firstName}
              label={'First name'}
              placeholder='First name'
              isRequired
            />
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, lastName: text })
              }}
              value={userData.lastName}
              label={'Last name'}
              placeholder='Last name'
              isRequired
            />
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, email: text })
              }}
              value={userData.email}
              label={'Email Address'}
              placeholder='Email'
              isRequired
            />
            {
              role === "recruiter" && <>
                <InPutWithLabel
                  onChangeText={function (text: string): void {
                    setUserData({ ...userData, ABN: text })
                  }}
                  value={userData.ABN}
                  label={'ABN Number'}
                  placeholder='Type your abn number'
                  isRequired
                />
                <InPutWithLabel
                  onChangeText={function (text: string): void {
                    setUserData({ ...userData, ACN: text })
                  }}
                  value={userData.ACN}
                  label={'ACN Number'}
                  placeholder='Type your acn number'
                  isRequired
                />
              </>
            }
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, password: text })
              }}
              value={userData.password}
              label={'Password'}
              placeholder='Password'
              isRequired
              secureText={!userData.passwordVisible}
              rightIcon={(color) => <Icon icon={{ type: "Feather", name: userData.passwordVisible ? 'eye' : 'eye-off' }} onPress={() => setUserData({ ...userData, passwordVisible: !userData.passwordVisible })} size={responsiveScreenFontSize(2.8)} style={{ color: colors.gray }} />}
            />
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, confirmPassword: text })
              }}
              value={userData.confirmPassword}
              label={'Confirm Password'}
              placeholder='Confirm Password'
              isRequired
              secureText={!userData.passwordVisible}
              rightIcon={(color) => <Icon onPress={() => setUserData({ ...userData, passwordVisible: !userData.passwordVisible })} icon={{ type: "Feather", name: userData.passwordVisible ? 'eye' : 'eye-off' }} size={responsiveScreenFontSize(2.8)} style={{ color: colors.gray }} />}
            />
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: responsiveScreenWidth(1.5), }}>
              <Icon onPress={() => setUserData({ ...userData, isRemember: !userData.isRemember })} icon={{ name: userData.isRemember ? 'checkbox' : 'checkbox-outline', type: "Ionicons" }} size={responsiveScreenFontSize(2.8)} style={{ marginTop: responsiveScreenHeight(.2), color: !userData.isRemember ? colors.textPrimary : colors.primary }} />
              <Text style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.textPrimary, }]}>
                By creating an account, i accept Search Talents terms of user and privacy policy
              </Text>
            </View>
            <View style={{ flex: 1 }}></View>
            <Button onPress={handleRegister} isLoading={loading} label='Signup' style={{ marginTop: responsiveScreenHeight(2) }} isActive={true} />
            <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), justifyContent: "center" }}>
              <Text onPress={() => navigation.navigate(routes.FORGOTPASSWORD)} style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.textPrimary, textAlign: "center" }]}>
                Don’t have an Account?
              </Text>
              <Text onPress={() => navigation.navigate(routes.SIGNUP)} style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.primary, textAlign: "center" }]}>
                {" "} Sign up here
              </Text>
            </View>
          </>
        )
      case 2:
        return (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(10), }}>
              <Icon onPress={() => setCurrentStep(currentStep - 1)} icon={{ type: "Feather", name: "chevron-left" }} size={responsiveScreenFontSize(2.5)} style={{ backgroundColor: colors.gray, borderRadius: 10, color: colors.hardGray, padding: responsiveScreenWidth(1.2) }} />
            </View>
            <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.7), textAlign: "left", marginTop: responsiveScreenHeight(4), color: colors.textPrimary }]}>Please verify your email address
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary, marginBottom: responsiveScreenHeight(2) }]}>
              We've sent an email to be {userData.email}, please enter the code below.
            </Text>
            <Text style={[styles.description, { color: colors.textPrimary, fontWeight: "700" }]}>
              Enter Code
            </Text>
            <OtpInput
              length={6}
              value={otp}
              disabled={false}
              onChange={handleOtpChange} />

            <Button isLoading={loading} onPress={() => {
              const a = otp.join("")
              setLoading(true)
              dispatch(UserVerification({ email: userData.email, code: a })).unwrap().then((res) => {
                console.log("UserVerification", res)
                setLoading(false)
                // if (res.success) {
                //   setCurrentStep(3)
                //   AsyncStorage.setItem("token", res.token)
                // } else {
                //   Alert.alert(res.message)
                // }
              })
            }} label='Verify' style={{ marginTop: responsiveScreenHeight(3) }} isActive={true} />
            <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), justifyContent: "center" }}>
              <Text onPress={() => navigation.navigate(routes.FORGOTPASSWORD)} style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.textPrimary, textAlign: "center" }]}>
                Don't receive email?
              </Text>
              {
                remainingSeconds <= 0 ? <Text onPress={() => dispatch(UserReSentOtp({ email: userData.email })).unwrap().then((res) => console.log(res))} style={[{
                  fontSize: responsiveScreenFontSize(1.8),
                  fontWeight: '500',
                }, { color: colors.primary, textAlign: "center" }]}>
                  {" "} Resent
                </Text> :
                  <Text style={[{
                    fontSize: responsiveScreenFontSize(1.8),
                    fontWeight: '500',
                  }, { color: colors.primary, textAlign: "center" }]}>
                    {" "}Resend in  {remainingSeconds}s
                  </Text>
              }
            </View>

          </>
        )


    }
  }
  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(5) }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={0}>
          <ScrollView
            // stickyHeaderHiddenOnScroll={true}
            // stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>


            {
              elemRender()
            }
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: responsiveHeight(1),
    fontSize: responsiveScreenFontSize(3.6),
    fontWeight: '600',
    textAlign: "center"
  },
  description: {
    marginTop: responsiveHeight(1),
    maxWidth: responsiveScreenWidth(90),
    fontSize: responsiveScreenFontSize(2.2),
    fontWeight: '400',
  },
  pressed: {
    textAlign: "center",
    paddingVertical: responsiveScreenHeight(2),
    paddingHorizontal: responsiveScreenWidth(6),
    borderRadius: 100,
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: "500",
    flex: 1,
    maxHeight: responsiveScreenHeight(6),
    minHeight: responsiveScreenHeight(6),
    marginVertical: responsiveScreenHeight(2)
  },
})
export const SignupStyle = styles
export default Signup;
