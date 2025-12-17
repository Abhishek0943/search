import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { NavigationBar, UserImage } from '../../components'
import { routes } from '../../constants/values'
import Icon from '../../utils/Icon'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'

const Chat = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    return (
        <>
            <NavigationBar name={routes.CHAT}>
                <View style={{ flex: 1, }}>
                    <View style={{ flexDirection: "row", marginBottom: responsiveScreenHeight(1), justifyContent: "space-between", paddingHorizontal: responsiveScreenWidth(3) }}>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Chat</Text>
                        <View style={{ backgroundColor: "#F2F2F2", borderRadius: 10, padding: responsiveScreenWidth(1.5) }}>
                            <Icon style={{ color: colors.darkGray }} size={responsiveScreenFontSize(2)} icon={{ type: "Ionicons", name: "search" }} />
                        </View>
                    </View>
                    <View style={{ borderTopColor: colors.surfaces,paddingVertical:responsiveScreenHeight(2), borderTopWidth: 1,paddingHorizontal:responsiveScreenWidth(3), backgroundColor: colors.white, flex: 1, }}>
                        <View style={{elevation:1, backgroundColor:colors.white,padding:responsiveScreenWidth(3),borderRadius:15, flexDirection:"row", alignItems:"center", gap:responsiveScreenWidth(2) }}>
                            <UserImage size={6} />
                            <View>
                                <Text style={{fontWeight:"600", fontSize:responsiveScreenFontSize(2.1)}}>Jenny Wilson</Text>
                                <Text style={{fontWeight:"400",color:colors.darkGray, fontSize:responsiveScreenFontSize(2)}}>hii asdhfi asd f</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </NavigationBar>
        </>
    );
}

export default Chat

const styles = StyleSheet.create({})