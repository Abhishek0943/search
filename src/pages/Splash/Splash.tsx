import { View, Image, Alert, } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { routes } from '../../constants/values'
import { responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TokenLogin } from '../../reducer/userReducer'
import { ThemeContext } from '../../context/ThemeProvider'
import { EnvContext } from '../../context/EnvProvider'
import { ProfileData } from '../../reducer/jobsReducer'
import { RecruiterProfile } from '../../reducer/recruiterReducer'
const Splash = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const dispatch = useAppDispatch()
  const { isAuth, user } = useAppSelector(state => state.userStore);
  const { colors } = useContext(ThemeContext)
  const { env } = useContext(EnvContext);
  useEffect(() => {
    const login = async () => {
      const token = await AsyncStorage.getItem("token")
      const role = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      if (!token) {
        navigation.navigate(routes.WELCOME)
      }
      else {
        if (role === "recruiter") {
          dispatch(RecruiterProfile()).unwrap().then((res) => {
            if (res.success) {
              navigation.navigate(routes.HOME)
            } else {
              navigation.navigate(routes.WELCOME)
            }
          })
        } else {
          dispatch(ProfileData()).unwrap().then((res) => {
            if (res.success) {
              navigation.navigate(routes.HOME)
            } else {
              navigation.navigate(routes.WELCOME)
            }
          })
        }
      }

    }
    login()
  }, [])
  useEffect(() => {
    if (isAuth && user) {
      navigation.navigate(routes.HOME)
    }
  }, [isAuth, user])

  return (
    <>
      {
        env === "dev" && <View style={{ opacity: .1, borderWidth: 1, position: "absolute", top: 0, height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), left: 0, zIndex: 100, }}>
          <Image source={require('./dev.jpg')} style={{ objectFit: "contain", height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), margin: "auto" }} />
        </View>
      }
      <View style={{ backgroundColor: colors.background, flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image source={require('../../assets/images/logo.png')} style={{ objectFit: "contain", height: "100%", width: responsiveScreenWidth(75), margin: "auto" }} />
      </View>
    </>

  )
}


export default Splash