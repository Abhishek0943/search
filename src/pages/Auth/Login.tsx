import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeProvider';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../../utils/Icon';
import { SignupStyle } from './Signup';
import { InPutWithLabel } from '../../components';
import { OrSeparator, SOCIAL_PROVIDERS, SocialButton } from '../Welcome/WelcomeTwo';
import { routes } from '../../constants/values';
import { useAppDispatch } from '../../store';
import { LoginByPassword } from '../../reducer/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/Button';
import { RecruiterLoginByPassword } from '../../reducer/recruiterReducer';
const Login = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const dispatch = useAppDispatch()
  const [userData, setUserData] = useState({
    username: "",
    password: "",
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
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(5) }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(10), }}>
        <Icon onPress={() => navigation.goBack()} icon={{ type: "Feather", name: "chevron-left" }} size={responsiveScreenFontSize(2.5)} style={{ backgroundColor: colors.gray, borderRadius: 10, color: colors.hardGray, padding: responsiveScreenWidth(1.2) }} />
      </View>
      <Text style={[SignupStyle.title, { marginBottom: responsiveScreenHeight(3), color: colors.textPrimary }]}>
        Login
      </Text>
      {SOCIAL_PROVIDERS.map(({ name, logo }) => (
        <SocialButton key={name} logo={logo} children="Sign in with Google" />
      ))}
      <OrSeparator text="or sign in with" />
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1.5), }}>
          <Icon onPress={() => setUserData({ ...userData, rememberMe: !userData.rememberMe })} icon={{ name: !userData.rememberMe ? 'checkbox' : 'checkbox-outline', type: "Ionicons" }} size={responsiveScreenFontSize(2.8)} style={{ color: userData.rememberMe ? colors.textPrimary : colors.primary }} />
          <Text style={[{
            fontSize: responsiveScreenFontSize(1.8),
            fontWeight: '500',
          }, { color: colors.textPrimary, }]}>
            Keep me signed in
          </Text>
        </View>

      </View>
      <Button onPress={() => {
        setLoading(true)
        if (role === "recruiter") {
          dispatch(RecruiterLoginByPassword({ email: userData.username, password: userData.password })).unwrap().then((res) => {
            if (res.success) {
              AsyncStorage.setItem("token", res.data.token)
            }
            else {
              Alert.alert(res.message)
            }
            setLoading(false)
          })
        } else {
          dispatch(LoginByPassword({ email: "hunter510@yopmail.com", password: "Hunter@123" })).unwrap().then((res) => {
            if (res.success) {
              AsyncStorage.setItem("token", res.data.token)
            }
            else {
              Alert.alert(res.message)
            }
            setLoading(false)
          }).catch((err)=>console.log(err))
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
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: responsiveScreenWidth(2),
  }
})
export default Login