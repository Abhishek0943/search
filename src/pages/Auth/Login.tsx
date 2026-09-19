import React, { useContext, useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveScreenHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import imagePath from '../../assets/imagePath'
import InputWithLabel from '../../components/InPutWithLabel'
import Text from '../../components/Text'
import { ThemeContext } from '../../context/ThemeProvider'
import { useAppDispatch } from '../../store'
import { LoginByPassword } from '../../reducer/userReducer'
import { routes } from '../../constants/values'
import Button from '../../components/Button'
import { useAlert } from '../../context/AlertContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ProfileData } from '../../reducer/jobsReducer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { googleLogin } from '../../utils/socialLogin'
import { postApiCall } from '../../api'
import { getFCMToken } from '../../utils/notificationService'
import authStyles from './styles'
const Login = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [hidePassword, setHidePassword] = useState(false);
  const dispatch = useAppDispatch()
  const [user, setUser] = useState<{
    email: string,
    password: string
  }>({
    email: '',
    password: '',
  });
  const { colors } = useContext(ThemeContext);
  const handleInputChange = (data: { name: string; value: string }) => {
    setUser(prev => ({ ...prev, [data.name]: data.value }));
  };
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
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
      const res: any = await postApiCall('/auth/jobseekers/social-login', {
        device_token: FCM,
        device_type: Platform.OS,
        type: 'google',
        auth_id: userData.id,
        first_name: userData.givenName || userData.name?.split(' ')[0] || '',
        last_name: userData.familyName || userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email,
      });
      if (res?.success || res?.data?.token) {
        await AsyncStorage.setItem('token', res.data.token);
        dispatch(ProfileData()).unwrap().then((profileRes) => {
          if (profileRes.success) {
            if (profileRes.data.login_step === 1) {
              navigation.reset({ index: 0, routes: [{ name: routes.USERSTEPS }] });
            } else {
              navigation.reset({ index: 0, routes: [{ name: routes.HOME }] });
            }
          }
        });
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
              <Image style={authStyles.bgImage} source={require("./images/UserLoginTop.png")} />
            </View>
            <InputWithLabel label='Email address' value={user.email} onChangeText={(text) => handleInputChange({ name: "email", value: text })} placeholder="Email" mainColor={''} secondaryColor={''} />
            <InputWithLabel sideOption={() => {
              return (
                <Text onPress={() => {
                  navigation.navigate(routes.FORGOTPASSWORD, { type: 'jobSeeker' })
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
                <Image style={authStyles.bgImage} source={imagePath.Check} />
              </Pressable>
              <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>
                Keep me logged in on this phone
              </Text>
            </View>

            <Button
              label="Log in"
              backgroundColor={colors.primary}
              onPress={() => {
                dispatch(LoginByPassword({ email: user.email, password: user.password })).unwrap().then(async (res) => {
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
                        else {
                          navigation.reset({
                            index: 0,
                            routes: [{ name: routes.HOME }]
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
                }).catch((error) => {
                  console.log("login failed", error)
                })
              }}
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
                    color="#1A5FA8"
                    style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                  />
                )}
              </Pressable>
              <Pressable style={authStyles.socialButton}>
                <Image style={authStyles.bgImage} source={require("./images/GoogleButton.png")} />
              </Pressable>
            </View>
            <Pressable onPress={() => { navigation.replace(routes.COMPLOGIN) }} style={authStyles.switchLink}>
              <Image style={authStyles.bgImage} source={require("./images/SweechToEmployer.png")} />
            </Pressable>
            <View style={authStyles.createAccountRow}>
              <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.6), }}>New to SearchTalents?</Text>
              <Text onPress={() => navigation.navigate(routes.SIGNUP)} style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '800' }}> Create an account</Text>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  )
}

export default Login