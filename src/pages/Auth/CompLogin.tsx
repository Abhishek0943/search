import React, { useContext, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import imagePath from '../../assets/imagePath'
import InputWithLabel from '../../components/InPutWithLabel'
import Text from '../../components/Text'
import { ThemeContext } from '../../context/ThemeProvider'
import { routes } from '../../constants/values'
import Button from '../../components/Button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const CompLogin = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [hidePassword, setHidePassword] = useState(false);
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
    const insets = useSafeAreaInsets();
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1, height: responsiveHeight(100) }}>
                <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), flex: 1, }}>
                    <Image style={{ height: "100%", width: "100%", }} source={require("../Welcome/BgGradiant.png")} />
                    <View style={{ position: "absolute", paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: responsiveWidth(5), top: 0, left: 0, height: responsiveHeight(100), width: responsiveWidth(100), }}>
                        <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                        </Pressable>
                        <View style={{ width: responsiveWidth(75), marginBottom: responsiveHeight(3), marginTop: responsiveHeight(3), aspectRatio: 238 / 120.5 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./LoginTop.png")} />
                        </View>
                        <InputWithLabel label='Work Email' value={user.email} onChangeText={(text) => handleInputChange({ name: "email", value: text })} placeholder="Email" />
                        <InputWithLabel sideOption={() => {
                            return (
                                <Text onPress={() => {
                                    navigation.navigate(routes.FORGOTPASSWORD, { type: 'comp' })
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
                        }} value={user.password} onChangeText={(text) => handleInputChange({ name: "password", value: text })} placeholder="Password" />
                        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveWidth(2), marginBottom: responsiveHeight(3) }}>
                            <Pressable style={{ width: responsiveWidth(4), aspectRatio: 1 / 1 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.CompCheck} />
                            </Pressable>
                            <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>
                                Keep me logged in on this phone
                            </Text>
                        </View>
                        <Button
                            label="Log in"
                            backgroundColor={colors.compPrimary}
                            onPress={() => {
                                //   dispatch(LoginByPassword({ email: user.email, password: user.password })).unwrap().then(() => {
                                //     console.log("login successfully")
                                //   }).catch((error) => {
                                //     console.log("login failed", error)
                                //   })
                            }}
                        />
                        <Pressable style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 16 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./Devider.png")} />
                        </Pressable>
                        <View style={{ flexDirection: "row", marginTop: responsiveHeight(2.5), gap: responsiveWidth(3), width: responsiveWidth(90) }}>
                            <Pressable style={{ flex: 1, aspectRatio: 169 / 56 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={require("./GoogleButton.png")} />
                            </Pressable>
                            <Pressable style={{ flex: 1, aspectRatio: 169 / 56 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={require("./GoogleButton.png")} />
                            </Pressable>
                        </View>
                        <Pressable style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 66 }}>
                            <Image style={{ height: "100%", width: "100%", }} source={require("./SweechToEmploye.png")} />
                        </Pressable>
                        <View style={{ marginTop: responsiveHeight(2), flexDirection: "row", justifyContent: 'center' }}>
                            <Text style={{ color: colors.primary2, fontSize: responsiveFontSize(1.6), }}>New to SearchTalents?</Text>
                            <Text onPress={() => {
                                navigation.navigate(routes.COMPSINGUP)
                            }} style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '800' }}> Create an account</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default CompLogin