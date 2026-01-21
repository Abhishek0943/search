import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import { SignupStyle } from './Signup';
import Icon from '../../utils/Icon';
import { InPutWithLabel, OtpInput } from '../../components';
import imagePath from '../../assets/imagePath';
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../store';
import { ComOtpVerify, ComResetPassword, ForgetPassword, OtpVerify, RecruiterForgetPassword, RecruiterLoginByPassword, ResetPassword } from '../../reducer/recruiterReducer';
import { UserReSentOtp } from '../../reducer/userReducer';
import { useAlert } from '../../context/AlertContext';

const ForgotPassword = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    passwordVisible: false,
    rememberMe: false

  })
  const [otp, setOtp] = useState<Array<string>>(Array(6).fill(''));
  const handleOtpChange = (newOtp: Array<string>) => {
    setOtp(newOtp);
  };
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const [role, setRole] = useState<"seeker" | "recruiter">()
  useEffect(() => {
    const set = async () => {
      const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      setRole(a)
    }
    set()
  }, [])
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
  const dispatch = useAppDispatch()
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false)
  const elemRender = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={[SignupStyle.title, { fontSize: responsiveScreenFontSize(2.7), textAlign: "left", marginTop: responsiveScreenHeight(4) }]}>Forgot Password
            </Text>
            <Text style={[SignupStyle.description, { color: colors.darkGray, marginBottom: responsiveScreenHeight(2) }]}>
              Enter your Email address. We will send an OTP for verification in the next step
            </Text>
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, username: text })
              }}
              value={userData.username}
              label={'Enter Code'}
              placeholder='example@gmail.com'
              isRequired
            />
            <Button onPress={() => {
              setLoading(true)
              if (role === "recruiter") {
                dispatch(RecruiterForgetPassword({ email: userData.username })).unwrap().then((res) => {
                  if (res.success) {
                    setCurrentStep(2)
                  }
                  else {
                   showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              } else {
                dispatch(ForgetPassword({ email: userData.username })).unwrap().then((res) => {
                  if (res.success) {
                    setCurrentStep(2)
                  }
                  else {
                    showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              }

            }} isLoading={loading} label='Submit' style={{ marginTop: responsiveScreenHeight(2) }} isActive={true} />
            <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), justifyContent: "flex-start" }}>
              <Text style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.darkGray, textAlign: "center" }]}>
                Remember Password?
              </Text>
              <Text onPress={() => navigation.goBack()} style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.primary, textAlign: "center" }]}>
                {" "} Login to your account
              </Text>
            </View>
          </>
        )
      case 2:
        return (
          <>

            <Text style={[SignupStyle.title, { fontSize: responsiveScreenFontSize(2.7), textAlign: "left", marginTop: responsiveScreenHeight(4) }]}>You've got mail
            </Text>
            <Text style={[SignupStyle.description, { color: colors.darkGray, marginBottom: responsiveScreenHeight(2) }]}>
              We have sent the OTP verification code to your email address. Check your email and enter the code below.
            </Text>
            <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Enter Code</Text>

            <OtpInput
              length={6}
              value={otp}
              disabled={false}
              onChange={handleOtpChange} />


            <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: .5, }}></View>
            <Button onPress={() => {
              setLoading(true)
              if (role === "recruiter") {
                dispatch(ComOtpVerify({  email: userData.username, code: otp.join('') })).unwrap().then((res) => {
                  if (res.success) {
                    setCurrentStep(3)
                  }
                  else {
                    showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              } else {
                dispatch(OtpVerify({ email: userData.username, code: otp.join('') })).unwrap().then((res) => {
                  if (res.success) {
                    setCurrentStep(3)
                  }
                  else {
                    showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              }

            }} isLoading={loading} label='Submit' style={{ marginTop: responsiveScreenHeight(2) }} isActive={true} />
            <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), justifyContent: "flex-start" }}>
              <Text style={[{
                fontSize: responsiveScreenFontSize(1.8),
                fontWeight: '500',
              }, { color: colors.darkGray, textAlign: "center" }]}>
                Didn’t see your email?
              </Text>
              {
                remainingSeconds <= 0 ? <Text onPress={() => dispatch(UserReSentOtp({ email: userData.username })).unwrap().then((res) => console.log(res))} style={[{
                  fontSize: responsiveScreenFontSize(1.8),
                  fontWeight: '500',
                }, { color: colors.primary, textAlign: "center" }]}>
                  {" "} Resend
                </Text> :
                  <Text style={[SignupStyle.description, { marginTop: 0, color: colors.primary, textAlign: "center", fontSize: responsiveScreenFontSize(1.8), }]}>
                    {" "} {remainingSeconds}

                  </Text>
              }

            </View>
          </>
        )
      case 3:
        return (
          <>
            <Text style={[SignupStyle.title, { fontSize: responsiveScreenFontSize(2.7), textAlign: "left", marginTop: responsiveScreenHeight(4) }]}>Reset your Password
            </Text>
            <Text style={[SignupStyle.description, { color: colors.darkGray, marginBottom: responsiveScreenHeight(2) }]}>
              Please select your country of origin for a better recommendations.
            </Text>
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, password: text })
              }}
              value={userData.password}
              label={'New Password'}
              placeholder='●●●●●●●●'
              isRequired
              secureText={!userData.passwordVisible}

              rightIcon={(color) => <Icon onPress={() => setUserData({ ...userData, passwordVisible: !userData.passwordVisible })} icon={{ type: "Feather", name: userData.passwordVisible ? 'eye' : 'eye-off' }} size={responsiveScreenFontSize(2.8)} style={{ color: colors.gray }} />}
            />
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, confirmPassword: text })
              }}
              value={userData.confirmPassword}
              label={'Confirm Password'}
              placeholder='●●●●●●●●'
              isRequired
              secureText={!userData.passwordVisible}

              rightIcon={(color) => <Icon onPress={() => setUserData({ ...userData, passwordVisible: !userData.passwordVisible })} icon={{ type: "Feather", name: userData.passwordVisible ? 'eye' : 'eye-off' }} size={responsiveScreenFontSize(2.8)} style={{ color: colors.gray }} />}
            />
            <Button onPress={() => {
              setLoading(true)
              if (role === "recruiter") {
                dispatch(ComResetPassword({ email: userData.username, password: userData.password, password_confirmation: userData.confirmPassword })).unwrap().then((res) => {
                  if (res.success) {
                    navigation.goBack()
                  }
                  else {
                    showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              } else {
                dispatch(ResetPassword({ email: userData.username, password: userData.password, password_confirmation: userData.confirmPassword })).unwrap().then((res) => {
                  if (res.success) {
                    navigation.goBack()
                  }
                  else {
                    showAlert({
                  title: "Validation",
                  message: res.message,
                })
                  }
                  setLoading(false)
                })
              }
            }} isLoading={loading} label='Submit' style={{ marginTop: responsiveScreenHeight(2) }} isActive={true} />
          </>
        )

    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: responsiveScreenWidth(5) }}>
      <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenWidth(10) }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={imagePath.backIcon} style={{ resizeMode: 'contain', transform: [{ scale: 1.1 }] }} />
        </TouchableOpacity>
        <View></View>
      </View>
      {elemRender()}
    </View>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({})


