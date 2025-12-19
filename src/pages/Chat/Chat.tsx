import { Image, TouchableOpacity, StyleSheet, Text, View,} from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { NavigationBar, UserImage } from '../../components'
import { routes } from '../../constants/values'
import Icon from '../../utils/Icon'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { useAppSelector } from '../../store'
const Chat = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { user } = useAppSelector(state => state.userStore)

    return (
        <>
            <NavigationBar name={routes.CHAT}>
                <View style={{ flex: 1, }}>
                    <View style={{borderBottomColor: colors.surfaces,borderBottomWidth: 1, flexDirection: "row", marginBottom: responsiveScreenHeight(1), justifyContent: "space-between", paddingHorizontal: responsiveScreenWidth(3) }}>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Chat</Text>
                        <View style={{ backgroundColor: "#F2F2F2", borderRadius: 10, padding: responsiveScreenWidth(1.5) }}>
                            <Icon style={{ color: colors.darkGray }} size={responsiveScreenFontSize(2)} icon={{ type: "Ionicons", name: "search" }} />
                        </View>
                    </View>
                    {
                        !user || !user?.id ? <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                            <Image source={imagePath.image1} />
                            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", textAlign: "center", width: responsiveScreenWidth(80) }}>You’re not logged in. Please log in to access this feature</Text>
                            <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(2) }}>
                                <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Register</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                                    <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </View> : <View style={{ paddingVertical: responsiveScreenHeight(2),  paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, flex: 1, }}>
                            {/* <View style={{ elevation: 1, backgroundColor: colors.white, padding: responsiveScreenWidth(3), borderRadius: 15, flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2) }}>
                                <UserImage size={6} />
                                <View>
                                    <Text style={{ fontWeight: "600", fontSize: responsiveScreenFontSize(2.1) }}>Jenny Wilson</Text>
                                    <Text style={{ fontWeight: "400", color: colors.darkGray, fontSize: responsiveScreenFontSize(2) }}>hii asdhfi asd f</Text>
                                </View>
                            </View> */}
                        </View>
                    }


                </View>
            </NavigationBar>
        </>
    );
}

export default Chat

const styles = StyleSheet.create({})