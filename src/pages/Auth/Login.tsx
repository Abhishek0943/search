import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeProvider';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../../utils/Icon';
import { SignupStyle } from './Signup';
import { InPutWithLabel } from '../../components';
import { OrSeparator, SocialButton } from '../Welcome/WelcomeTwo';
import { routes } from '../../constants/values';
import { useAppDispatch } from '../../store';
import { LoginByPassword, setUser } from '../../reducer/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/Button';
import { RecruiterLoginByPassword } from '../../reducer/recruiterReducer';
import { useAlert } from '../../context/AlertContext';
import Text from '../../components/Text';
import { googleLogin } from '../../utils/socialLogin';
import { postApiCall } from '../../api';
import imagePath from '../../assets/imagePath';
import RNRestart from 'react-native-restart';
import { getFCMToken } from '../../utils/notificationService';

const Login = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const dispatch = useAppDispatch()
  const { showAlert } = useAlert();
  const [userData, setUserData] = useState({
    // email: "a1@yopmail.com",
    // password: "12121212",
    // username: "a1@yopmail.com",
    password: "",
    username: "",
    passwordVisible: false,
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"seeker" | "recruiter">()
  useEffect(() => {
    const set = async () => {
      const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      setRole(a)
    }
    set()
  }, [])
  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(5) }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(10), }}>
            <Icon onPress={() => navigation.goBack()} icon={{ type: "Feather", name: "chevron-left" }} size={responsiveScreenFontSize(2.5)} style={{ backgroundColor: colors.gray, borderRadius: 10, color: colors.hardGray, padding: responsiveScreenWidth(1.2) }} />
          </View>
          {
            role === "recruiter" ? <Text onPress={() => navigation.navigate(routes.WELCOMETWO)} style={{ color: colors.primary, fontWeight: "700", fontSize: responsiveScreenFontSize(1.6), textTransform: "capitalize" }}>Switch to Seeker</Text> : <Text onPress={() => navigation.navigate(routes.WELCOMETWO)} style={{ color: colors.primary, fontWeight: "700", fontSize: responsiveScreenFontSize(1.6), textTransform: "capitalize" }}>Switch to recruiter</Text>
          }
        </View>
        <Text style={[SignupStyle.title, { marginBottom: responsiveScreenHeight(3), color: colors.textPrimary }]}>
          Login
        </Text>
        {
          role !== "recruiter" && Platform.OS === "android" && (
            <>
              <SocialButton onPress={async () => {
                try {
                  const a = await googleLogin()
                  if (!a?.data?.user) {
                    // User cancelled the Google sign-in or no user data returned
                    return;
                  }
                  const FCM = await getFCMToken()
                  const b = await postApiCall("/auth/jobseekers/social-login", {
                    device_token: FCM,
                    device_type: Platform.OS,
                    type: "google", auth_id: a.data.user.id, first_name: a.data.user.givenName,
                    last_name: a.data.user.familyName, email: a.data.user.email
                  })
                  if (b?.data?.token) {
                    await AsyncStorage.setItem("token", b.data.token)
                    RNRestart.restart();
                  } else {
                    showAlert({
                      title: "Login Failed",
                      message: b?.message || "Something went wrong. Please try again.",
                    })
                  }
                } catch (error: any) {
                  // Google sign-in throws a specific code when user cancels
                  if (error?.code === '-5' || error?.code === 'SIGN_IN_CANCELLED' || error?.message?.includes('cancel')) {
                    return;
                  }
                  showAlert({
                    title: "Google Sign-In Failed",
                    message: error?.message || "Something went wrong. Please try again.",
                  })
                }
              }} key={"Google"} logo={imagePath.googleLogo} children="Sign in with Google" />
              <OrSeparator text="or sign in with" />

            </>
          )
        }
        <InPutWithLabel
          onChangeText={function (text: string): void {
            setUserData({ ...userData, username: text })
          }}
          keyboardType='email-address'
          value={userData.username}
          label={'Email'}
          placeholder='Type your Email'
          isRequired
        />
        <InPutWithLabel
          onChangeText={function (text: string): void {
            setUserData({ ...userData, password: text })
          }}
          value={userData.password}
          label={'Password'}
          placeholder='●●●●●●●●'
          isRequired
          secureText={!userData.passwordVisible}
          inputAlternate={() => <Text onPress={() => navigation.navigate(routes.FORGOTPASSWORD)} style={[{
            fontSize: responsiveScreenFontSize(1.8),
            fontWeight: '500',
          }, { color: colors.primary, textAlign: "center" }]}>
            Forgot Password
          </Text>}
          rightIcon={(color) => <Icon onPress={() => setUserData({ ...userData, passwordVisible: !userData.passwordVisible })} icon={{ type: "Feather", name: userData.passwordVisible ? 'eye' : 'eye-off' }} size={responsiveScreenFontSize(2.8)} style={{ color: colors.gray }} />}
        />
        {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1.5), }}>
            <Icon onPress={() => setUserData({ ...userData, rememberMe: !userData.rememberMe })} icon={{ name: !userData.rememberMe ? 'checkbox' : 'checkbox-outline', type: "Ionicons" }} size={responsiveScreenFontSize(2.8)} style={{ color: userData.rememberMe ? colors.textPrimary : colors.primary }} />
            <Text style={[{
              fontSize: responsiveScreenFontSize(1.8),
              fontWeight: '500',
            }, { color: colors.textPrimary, }]}>
              Keep me signed in
            </Text>
          </View>
        </View> */}
        <Button onPress={async () => {
          setLoading(true)
          const FCM = await getFCMToken()
          if (role === "recruiter") {
            dispatch(RecruiterLoginByPassword({
              device_token: FCM,
              device_type: Platform.OS, email: userData.username, password: userData.password
            })).unwrap().then((res) => {
              if (res.success) {
                AsyncStorage.setItem("token", res.data.token)
                RNRestart.restart();
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
            dispatch(LoginByPassword({
              device_token: FCM,
              device_type: Platform.OS, email: userData.username, password: userData.password
            })).unwrap().then((res) => {
              if (res.success) {
                AsyncStorage.setItem("token", res.data.token)
                RNRestart.restart();
              }
              else {
                showAlert({
                  title: "Validation",
                  message: res.message,
                })
              }
              setLoading(false)
            }).catch((err) => { })
          }

        }} isLoading={loading} label='Login' style={{ marginTop: responsiveScreenHeight(2) }} isActive={true} />
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: responsiveScreenWidth(2),
  }
})
export default Login