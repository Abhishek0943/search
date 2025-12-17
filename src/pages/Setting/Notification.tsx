import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CheckBox, PageHeaderOne } from '../../components'
import { fonts, lightColors, routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getApiCall, postApiCall } from '../../api'
import { showError } from '../../utils/helperFunctions'
const colors = lightColors
const Notification = () => {
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const [data, setdata] = useState({})
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        getApiCall("settings").then((res) => {
            if (res.success) {
                console.log("res", res)
                setdata(res.data)
            }
        })
    }, [])
    if (!data.id) {
        return (
            <></>
        )
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgMain }}>
            {
                loading && <View style={{ position: "absolute", height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), backgroundColor: "rgba(0, 0, 0, .2)", zIndex: 100, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={responsiveScreenFontSize(3)} />
                </View>
            }
            <PageHeaderOne heading={"Notification"} rightIcon={" "} />
            <TouchableOpacity style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>
                <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Articles and Posts</Text>
                <CheckBox value={data?.article_post !== 0 ? true : false} fun={() => {
                    setLoading(true)
                    postApiCall("settings", { article_post: !data.article_post }).then((res) => {
                        if (res.success) {
                            setdata(res.data)
                        }
                        setLoading(false)
                    })
                }} />

            </TouchableOpacity>
            <TouchableOpacity style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>
                <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Comment</Text>
                <CheckBox value={data?.comment !== 0 ? true : false} fun={() => {
                    setLoading(true)

                    postApiCall("settings", { comment: !data.comment }).then((res) => {
                        if (res.success) {
                            setdata(res.data)
                        }
                        setLoading(false)

                    })
                }} />

            </TouchableOpacity>
            <TouchableOpacity style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>
                <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Following</Text>
                <CheckBox value={data?.following !== 0 ? true : false} fun={() => {
                    setLoading(true)

                    postApiCall("settings", { following: !data.following }).then((res) => {
                        if (res.success) {
                            setdata(res.data)
                            
                        }
                        setLoading(false)

                    })
                }} />

            </TouchableOpacity>
            <TouchableOpacity style={{ width: responsiveScreenWidth(95), paddingVertical: responsiveScreenHeight(2), margin: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center" }}>
                <Text style={{ flex: 1, fontSize: responsiveScreenFontSize(2), fontFamily: fonts.poppinsM, textAlign: "left", color: colors.maintext, marginTop: responsiveScreenHeight(.4) }}>Like</Text>
                <CheckBox value={data?.like !== 0 ? true : false} fun={() => {
                    setLoading(true)

                    postApiCall("settings", { like: !data.like }).then((res) => {
                        if (res.success) {
                            setdata(res.data)
                        }
                        setLoading(false)

                    })
                }} />

            </TouchableOpacity>

            <View style={{ flex: 1 }}></View>
        </SafeAreaView>
    )
}

export default Notification