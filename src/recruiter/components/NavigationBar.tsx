import { View, Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeProvider';
import RoutesType, { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';
import Text from '../../components/Text';
import { useAppSelector } from '../../store';

const NavigationBar = ({ children, statusbar = true, name, navigationBar = true }: { navigationBar?: boolean, statusbar?: boolean, children: React.JSX.Element, name?: RoutesType["RECRUITERHOME"] | RoutesType["OPENJOBS"] | RoutesType["ADDJOB"] | RoutesType["CHAT"] | RoutesType["ACCOUNT"] }) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector((state) => state.userStore);

    const insets = useSafeAreaInsets();
    const route = [
        {
            name: "My Job",
            path: routes.RECRUITERHOME,
            icon: <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={name === routes.RECRUITERHOME ? require("./ActiveHome.png") : require("./Home.png")} />
        },

        {
            name: "Insights",
            path: routes.OPENJOBS,
            icon: <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={name === routes.OPENJOBS ? require("./ActiveJob.png") : require("./Job.png")} />
        },
        {
            name: "Add Job",
            path: routes.ADDJOB,
            icon: <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={name === routes.ADDJOB ? imagePath.activeAddJob : imagePath.addJob} />
        },
        {
            name: "Chat",
            path: routes.CHAT,
            icon: <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={name === routes.CHAT ? require("./ActiveInbox.png") : require("./Inbox.png")} />
        },
        {
            name: "Account",
            path: routes.ACCOUNT,
            icon: <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={name === routes.ACCOUNT ? require("./ActiveProfile.png") : require("./Profile.png")} />
        },
    ]
    return (
        <View style={{ flex: 1, backgroundColor: colors.white, }}>
            <View style={{ paddingBottom: !navigationBar ? insets.bottom : 0, flex: 1, paddingTop: statusbar ? insets.top : 0 }}>
                {children}
            </View>
            {
                navigationBar &&
                <View style={{ paddingBottom: insets.bottom, elevation: 25, borderTopColor: colors.surfaces, borderTopWidth: .5, backgroundColor: colors.background, flexDirection: "row", alignItems: "center", paddingVertical: responsiveScreenHeight(1) }}>
                    {
                        route.map((e, i) => {
                            return (
                                <Pressable key={e.path} onPress={() => e.path && navigation.navigate(e.path)} style={{ paddingVertical: responsiveScreenHeight(1), flex: 1, alignItems: "center", height: "100%", }}>
                                    <View style={{ width: responsiveWidth(8), aspectRatio: 29 / 36 }}>
                                        {e.icon}
                                    </View>
                                    {
                                        e.name === "Chat" && user?.messages_count > 0 &&
                                        <View style={{ position: "absolute", right: "35%", top: "10%", aspectRatio: 1, height: responsiveScreenWidth(3), justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: "red" }}>
                                            <Text style={{ color: "white", fontSize: responsiveScreenFontSize(1), fontWeight: "800" }}>{user?.messages_count}</Text>
                                        </View>
                                    }
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