import { View, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import RoutesType, { routes } from '../constants/values'
import { responsiveFontSize, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import imagePath from '../assets/imagePath'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text'
import { useAppSelector } from '../store'

const NavigationBar = ({ onPress, bottomPadding = false, children, statusbar = true, name, navigationBar = true }: { onPress?: () => void, navigationBar?: boolean, statusbar?: boolean, bottomPadding?: boolean, children: React.JSX.Element, name?: RoutesType["HOME"] | RoutesType["CHAT"] | RoutesType["PROFILE"] | RoutesType["APPLYJOB"] | RoutesType["BOOKMARKED"] }) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector((state) => state.userStore);
    // const [messages_count, setMessages_count] = useState(0)
    // useEffect(() => {
    //     if (user?.id) {
    //         setMessages_count(user.messages_count)
    //     }
    // }, [user])

    const insets = useSafeAreaInsets();
    const route = [
        {
            name: "Home",
            path: routes.HOME,
            icon: <Image source={name === routes.HOME ? require("./ActiveSearch.png") : imagePath.home} />
        },
        {
            name: "Bookmarked",
            path: routes.BOOKMARKED,
            icon: <Image source={name === routes.BOOKMARKED ? imagePath.activeBlog : require("./Bookmark.png")} />
        },
        {
            name: "Applications",
            path: routes.APPLYJOB,
            icon: <Image source={name === routes.APPLYJOB ? imagePath.activeApplication : require("./Applied.png")} />
        }, {
            name: "Chat",
            path: routes.CHAT,
            icon: <Image source={name === routes.CHAT ? imagePath.chat : require("./Inbox.png")} />
        }, {
            name: "Profile",
            path: routes.PROFILE,
            icon: <Image source={name === routes.PROFILE ? imagePath.activeProfile : require("./Profile.png")} />
        },
    ]
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ paddingBottom: !navigationBar ? bottomPadding ? 0 : insets.bottom : 0, flex: 1, paddingTop: statusbar ? insets.top : 0 }}>
                {children}
            </View>
            {
                navigationBar &&
                <View style={{ paddingBottom: insets.bottom, elevation: 25, borderTopColor: colors.surfaces, borderTopWidth: .5, backgroundColor: colors.background, flexDirection: "row", alignItems: "center", paddingVertical: responsiveScreenHeight(1) }}>
                    {
                        route.map((e, i) => {
                            return (
                                <TouchableOpacity key={e.path} onPress={() => name === e.path && onPress ? onPress() : navigation.navigate(e.path)} style={{ position: "relative", paddingVertical: responsiveScreenHeight(1), flex: 1, alignItems: "center", gap: responsiveScreenHeight(1), height: "100%", }}>
                                    {e.icon}
                                    {
                                        e.name === "Chat" && user && user?.messages_count > 0 &&
                                        <View style={{ position: "absolute", right: "35%", top: "10%", aspectRatio: 1, height: responsiveScreenWidth(3), justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: "red" }}>
                                            <Text style={{ color: "white", fontSize: responsiveScreenFontSize(1), fontWeight: "800" }}>{user?.messages_count}</Text>
                                        </View>
                                    }
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            }

        </View>
    )
}

export default NavigationBar