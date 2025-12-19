import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useContext } from 'react'
import RoutesType, { routes } from '../constants/values'
import { responsiveScreenHeight } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import imagePath from '../assets/imagePath'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NavigationBar = ({ children,statusbar=true, name, navigationBar=true }: {navigationBar?:boolean,statusbar?:boolean, children: React.JSX.Element, name?: RoutesType["HOME"] | RoutesType["CHAT"] | RoutesType["PROFILE"]|RoutesType["APPLYJOB"]}) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();

    const insets = useSafeAreaInsets();
    const route = [
        {
            name: "Home",
            path: routes.HOME,
            icon: <Image source={name === routes.HOME ? imagePath.activeHome : imagePath.home} />
        },
        {
            name: "Applications",
            path: routes.APPLYJOB,
            icon: <Image source={name === routes.APPLYJOB ? imagePath.activeApplication : imagePath.application} />
        }, {
            name: "Chat",
            path: routes.CHAT,
            icon: <Image source={name === routes.CHAT ? imagePath.chat : imagePath.chat2} />
        }, {
            name: "Profile",
            path: routes.PROFILE,
            icon: <Image source={name === routes.PROFILE ? imagePath.activeProfile : imagePath.profile} />
        },
    ]
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{paddingBottom:!navigationBar?insets.bottom:0, flex: 1, paddingTop:statusbar? insets.top:0 }}>
                {children}
            </View>
            {
                navigationBar&& 
            <View style={{ paddingBottom:insets.bottom, elevation: 25, borderTopColor: colors.surfaces, borderTopWidth: .5, backgroundColor: colors.background, flexDirection: "row", alignItems: "center", paddingVertical: responsiveScreenHeight(1) }}>
                {
                    route.map((e, i) => {
                        return (

                            <TouchableOpacity key={e.path} onPress={() => navigation.navigate(e.path)} style={{ paddingVertical: responsiveScreenHeight(1), flex: 1, alignItems: "center", height: "100%", }}>
                                {e.icon}
                                <Text style={{ color: e.path === name ? colors.black : colors.darkGray, fontWeight: e.path === name ? "900" : "400", }}>{e.name}</Text>
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