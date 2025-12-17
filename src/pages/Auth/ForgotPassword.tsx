import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import { SignupStyle } from './Signup';
import Icon from '../../utils/Icon';
import { InPutWithLabel, OtpInput } from '../../components';

const ForgotPassword = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [currentStep, setCurrentStep] = useState(1)

  const [userData, setUserData] = useState({
    username: "",
    password: "",
    passwordVisible: false,
    rememberMe: false

  })
    const [otp, setOtp] = useState<Array<string>>(Array(6).fill(''));
    const handleOtpChange = (newOtp: Array<string>) => {
    setOtp(newOtp);
  };
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
  const elemRender = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={[SignupStyle.title, { color: colors.textPrimary }]}>Forgot Password
            </Text>
            <Text style={[SignupStyle.description, { color: colors.textSecondary, marginBottom: responsiveScreenHeight(2) }]}>
              Enter your Email address. We will send an OTP for verification in the next step
            </Text>
            <InPutWithLabel
              onChangeText={function (text: string): void {
                setUserData({ ...userData, username: text })
              }}
              value={userData.username}
              label={'Email'}
              placeholder='example@gmail.com'
              isRequired
            />
            <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: .5, flex: 1 }}></View>
            <Text onPress={()=>setCurrentStep(2)} style={[SignupStyle.pressed, { color: colors.white, backgroundColor: colors.onPrimary, }]}>Continue</Text>
          </>
        )
      case 2:
        return (
          <>

            <Text style={[SignupStyle.title, { color: colors.textPrimary }]}>You've got mail
            </Text>
            <Text style={[SignupStyle.description, { color: colors.textSecondary, marginBottom: responsiveScreenHeight(2) }]}>
              We have sent the OTP verification code to your email address. Check your email and enter the code below.
            </Text>
            <OtpInput
              length={4}
              value={otp}
              disabled={false}
              onChange={handleOtpChange} />
            <View style={{ flex: 1 }}></View>
            <Text style={[SignupStyle.description, { marginBottom: responsiveScreenHeight(1), color: colors.textSecondary, textAlign: "center", fontSize: responsiveScreenFontSize(1.8), }]}>
              Don't receive email?
            </Text>
            {
              remainingSeconds <= 0 ? <Text  style={[SignupStyle.description, { marginBottom: responsiveScreenHeight(2), color: colors.primary, fontWeight: "700", textAlign: "center", fontSize: responsiveScreenFontSize(1.8), }]}>
                Resent
              </Text> : <Text style={[SignupStyle.description, { marginBottom: responsiveScreenHeight(2), color: colors.textSecondary, textAlign: "center", fontSize: responsiveScreenFontSize(1.8), }]}>
                You can resend code in  <Text style={[SignupStyle.description, { color: colors.primary, textAlign: "center", fontSize: responsiveScreenFontSize(1.8), }]}>
                  {remainingSeconds}
                </Text>s
              </Text>
            }
            <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: .5, }}></View>
            <Text onPress={() => {
              const a = otp.join("")
              // dispatch(UserVerification({ token, otp: a })).unwrap().then((res) => {
              //   if (res.success) {
              //     setCurrentStep(3)
              //     AsyncStorage.setItem("token", res.token)
              //   } else {
              //     Alert.alert(res.message)
              //   }
              // })
            }} style={[SignupStyle.pressed, { color: colors.white, backgroundColor: colors.onPrimary, }]}>Continue</Text>
          </>
        )
      case 3:
        return (
          <>
            <Text style={[SignupStyle.title, { color: colors.textPrimary }]}>Which country are you from?
            </Text>
            <Text style={[SignupStyle.description, { color: colors.textSecondary, marginBottom: responsiveScreenHeight(2) }]}>
              Please select your country of origin for a better recommendations.
            </Text>
            
          </>
        )
     
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: responsiveScreenWidth(2) }}>
      <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), alignItems: "center", gap: responsiveScreenWidth(10) }}>
        <Icon icon={{type:"Feather",name:"arrow-left"}}  onPress={() => currentStep === 1 ? navigation.goBack() : setCurrentStep(currentStep - 1)} size={responsiveScreenFontSize(3.5)} style={{ color: colors.textPrimary }} />
        <View></View>
      </View>
{elemRender()}
    </View>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({})