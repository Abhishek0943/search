import { View,  Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeProvider';
import RoutesType, { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';
import Text from '../../components/Text';
import { useAppSelector } from '../../store';

const NavigationBar = ({ children,statusbar=true, name, navigationBar=true }: {navigationBar?:boolean,statusbar?:boolean, children: React.JSX.Element, name?: RoutesType["RECRUITERHOME"] | RoutesType["ADDJOB"] | RoutesType["ACCOUNT"]|RoutesType["ACTIVECANDIDATE"]}) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector((state) => state.userStore);

    const insets = useSafeAreaInsets();
    const route = [
        {
            name: "My Job",
            path: routes.RECRUITERHOME,
            icon: <Image source={name === routes.RECRUITERHOME ? imagePath.myJob : imagePath.home} />
        },
        
        //  {
        //     name: "Chat",
        //     path: routes.CHAT,
        //     icon: <Image source={name === routes.CHAT ? imagePath.activeCompany : imagePath.company} />
        // }, 
         {
            name: "Add Job",
            path: routes.ADDJOB,
            icon: <Image source={name === routes.ADDJOB ? imagePath.activeAddJob : imagePath.addJob} />
        }, 
        {
            name: "Chat",
            path: routes.CHAT,
            icon: <Image source={name === routes.CHAT ? imagePath.chat : imagePath.chat2} />
        },
        {
            name: "Account",
            path: routes.ACCOUNT,
            icon: <Image source={name === routes.ACCOUNT ? imagePath.activeProfile : imagePath.profile} />
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

                            <Pressable key={e.path} onPress={() =>e.path && navigation.navigate(e.path)} style={{ paddingVertical: responsiveScreenHeight(1), flex: 1, alignItems: "center", height: "100%", }}>
                                {e.icon}
                                   {
                                                                        e.name === "Chat" && user?.messages_count > 0 &&
                                                                        <View style={{ position: "absolute", right: "35%", top: "10%", aspectRatio: 1, height: responsiveScreenWidth(3), justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: "red" }}>
                                                                            <Text style={{ color: "white", fontSize: responsiveScreenFontSize(1), fontWeight: "800" }}>{user?.messages_count}</Text>
                                                                        </View>
                                                                    }
                                <Text style={{ color: e.path === name ? colors.black : colors.darkGray, fontWeight: e.path === name ? "900" : "400", }}>{e.name}</Text>
                            </Pressable>

                        )
                    })
                }
            </View>
            }

        </View>
    )
}

export default NavigationBar