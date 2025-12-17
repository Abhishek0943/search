import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import imagePath from '../../constants/imagePath'
import { PageHeaderOne } from '../../components'
import { fonts, lightColors, routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
const colors = lightColors

const Security = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <PageHeaderOne heading={"Password and Security"} rightIcon={" "} />
      <Pressable onPress={() => { navigation.navigate(routes.CHANGEEMAIL) }} style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>
        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Change Email</Text>
        <View style={{ height: responsiveScreenWidth(5), aspectRatio: 1 }}>
          <Image source={imagePath.rightAngle} style={{ height: "100%", width: "100%", tintColor: colors.maintext, resizeMode: "contain" }} />
        </View>
      </Pressable>
      <Pressable onPress={() => { navigation.navigate(routes.CHANGEPASSWORD) }} style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>


        <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Change Password</Text>
        <View style={{ height: responsiveScreenWidth(5), aspectRatio: 1 }}>
          <Image source={imagePath.rightAngle} style={{ height: "100%", width: "100%", tintColor: colors.maintext, resizeMode: "contain" }} />
        </View>

      </Pressable>

      <View style={{ flex: 1 }}></View>
    </SafeAreaView>
  )
}

export default Security