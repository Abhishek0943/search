import React, { useContext } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../../assets/imagePath'
import { ThemeContext } from '../../../context/ThemeProvider'

function RecruiterHome() {
    const { colors } = useContext(ThemeContext)

    return (
        <NavigationBar name={routes.HOME}>

            <ScrollView style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", width: "100%", flex: 1, paddingHorizontal: responsiveScreenWidth(5), alignItems: "center", gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1, height: responsiveScreenHeight(5), }}>
                        <Image source={imagePath.logo} style={{ height: "100%", width: responsiveScreenWidth(37), resizeMode: "contain", }} />
                    </View>
                    <View style={{ height: responsiveScreenHeight(4), }}>
                        <Image source={imagePath.button} style={{ height: "100%", resizeMode: "contain", }} />
                    </View>
                    <View style={{ height: responsiveScreenHeight(3), }}>
                        <Image source={imagePath.notification} style={{ height: "100%", resizeMode: "contain", }} />
                    </View>
                </View>
                <View style={{ width: "90%", marginHorizontal: "auto", marginTop: responsiveScreenHeight(2), aspectRatio: 2.58 }}>
                    <Image source={imagePath.recruterBanner} style={{ width: "100%", height: "100%", }} />
                </View>
                <View style={{ width: "90%", flexDirection: "row", gap: responsiveScreenWidth(2), marginHorizontal: "auto", marginTop: responsiveScreenHeight(2), }}>
                    <View style={{ flex: 1, gap: responsiveScreenHeight(.6), backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderRadius: 15 }}>
                        <View style={{ height: responsiveScreenHeight(3), }}>
                            <Image source={imagePath.clock2} style={{ height: "100%", resizeMode: "contain", }} />
                        </View>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Opens Jobs</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.darkGrayNatural, fontWeight: "600" }}>02</Text>
                    </View>
                    <View style={{ flex: 1, gap: responsiveScreenHeight(.6), backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderRadius: 15 }}>
                        <View style={{ height: responsiveScreenHeight(3), }}>
                            <Image source={imagePath.activeProfile} style={{ height: "100%", resizeMode: "contain", }} />
                        </View>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Followers</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.darkGrayNatural, fontWeight: "600" }}>02</Text>
                    </View>
                    <View style={{ flex: 1, gap: responsiveScreenHeight(.6), backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderRadius: 15 }}>
                        <View style={{ height: responsiveScreenHeight(3), }}>
                            <Image source={imagePath.activeProfile} style={{ height: "100%", resizeMode: "contain", }} />
                        </View>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Messages</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.darkGrayNatural, fontWeight: "600" }}>02</Text>
                    </View>
                </View>
                <View style={{ width: "90%",marginHorizontal: "auto", marginTop: responsiveScreenHeight(1.5), }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(3.2), fontWeight: "700" }}>Choose your plan</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.hardGray, fontWeight: "600" }}>Change or cancel anytime.</Text>
                </View>
            </ScrollView>
        </NavigationBar>
    )
}

export default RecruiterHome