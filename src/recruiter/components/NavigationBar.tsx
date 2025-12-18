import { View, Text, Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenHeight } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeProvider';
import RoutesType, { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';

const NavigationBar = ({ children,statusbar=true, name, navigationBar=true }: {navigationBar?:boolean,statusbar?:boolean, children: React.JSX.Element, name?: RoutesType["HOME"] | RoutesType["ADDJOB"] | RoutesType["PROFILE"]|RoutesType["ACTIVECANDIDATE"]}) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();

    const insets = useSafeAreaInsets();
    const route = [
        {
            name: "My Job",
            path: routes.HOME,
            icon: <Image source={name === routes.HOME ? imagePath.myJob : imagePath.home} />
        },
        {
            name: "Candidate",
            path: routes.ACTIVECANDIDATE,
            icon: <Image source={name === routes.ACTIVECANDIDATE ? imagePath.activeCandidate : imagePath.candidate} />
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

                            <Pressable key={e.path} onPress={() => navigation.navigate(e.path)} style={{ paddingVertical: responsiveScreenHeight(1), flex: 1, alignItems: "center", height: "100%", }}>
                                {e.icon}
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