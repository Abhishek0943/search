import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { routes } from '../../constants/values'

const Welcome2 = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    return (

        <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), flex: 1, }}>
            <Image style={{ height: "100%", width: "100%", }} source={require("./BgGradiant.png")} />
            <View style={{ position: "absolute", paddingVertical: responsiveHeight(5), paddingHorizontal: responsiveWidth(5), top: 0, left: 0, height: responsiveHeight(100), width: responsiveWidth(100), }}>
                <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                    <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                </Pressable>
                <View style={{ width: responsiveWidth(75), marginTop: responsiveHeight(3), aspectRatio: 594 / 257 }}>
                    <Image style={{ height: "100%", width: "100%", }} source={require("./TextGroup.png")} />
                </View>
                <Pressable onPress={() => navigation.navigate(routes.LOGIN)} style={{ width: "100%", marginTop: responsiveHeight(4), aspectRatio: 175 / 102 }}>
                    <Image style={{ height: "100%", width: "100%", }} source={require("./WorkCard.png")} />
                </Pressable>
                <Pressable onPress={() => navigation.navigate(routes.COMPLOGIN)} style={{ width: "100%", marginTop: responsiveHeight(3), aspectRatio: 175 / 102 }}>
                    <Image style={{ height: "100%", width: "100%", }} source={require("./CompanyCard.png")} />
                </Pressable>
                <View style={{ width: "100%", marginTop: responsiveHeight(3), aspectRatio: 175 / 29 }}>
                    <Image style={{ height: "100%", width: "100%", }} source={require("./ExploreCard.png")} />
                </View>
            </View>
        </View>
    )
}

export default Welcome2

const styles = StyleSheet.create({})