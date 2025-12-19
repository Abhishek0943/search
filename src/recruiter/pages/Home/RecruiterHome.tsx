import React, { useContext, useEffect, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../../assets/imagePath'
import { ThemeContext } from '../../../context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '../../../store'
import Text from '../../../components/Text'
import { RecruiterPlans } from '../../../reducer/recruiterReducer'
function RecruiterHome() {
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const dispatch = useAppDispatch()
    const [plans, setPlans] = useState([])
    useEffect(() => {
        dispatch(RecruiterPlans()).unwrap().then((res) => {
            if (res.success) {
                setPlans(res.data)
            }
        })
    }, [])
    return (
        <NavigationBar name={routes.HOME}>

            <Image source={require("./Ellipse44.png")} style={{ position: "absolute", width: responsiveScreenWidth(100), height: responsiveScreenHeight(100), top: -100, }} />
            <ScrollView style={[styles.container,]} >
                <View style={styles.headerRow}>
                    <View style={styles.logoWrap}>
                        <Image source={imagePath.logo} style={styles.logoImg} />
                    </View>

                    <View style={styles.btnWrap}>
                        <Image source={imagePath.button} style={styles.btnImg} />
                    </View>

                    <View style={styles.notifWrap}>
                        <Image source={imagePath.notification} style={styles.notifImg} />
                    </View>
                </View>

                {/* Banner */}
                <View style={styles.bannerWrap}>
                    <Image source={imagePath.recruterBanner} style={styles.bannerImg} />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>

                    <View style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                        <View style={styles.statIconWrap}>
                            <Image source={imagePath.clock2} style={styles.statIcon} />
                        </View>
                        <Text style={styles.statTitle}>Opens Jobs</Text>
                        <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>{user.jobs_count}</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                        <View style={styles.statIconWrap}>
                            <Image source={imagePath.activeProfile} style={styles.statIcon} />
                        </View>
                        <Text style={styles.statTitle}>Followers</Text>
                        <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>02</Text>

                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                        <View style={styles.statIconWrap}>
                            <Image source={imagePath.chat} style={styles.statIcon} />
                        </View>
                        <Text style={styles.statTitle}>Messages</Text>
                        <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>02</Text>

                    </View>

                </View>
                <View style={styles.planWrap}>
                    <Text style={styles.planTitle}>Choose your plan</Text>
                    <Text style={[styles.planSubTitle, { color: colors.hardGray, marginTop: responsiveScreenHeight(.8) }]}>Change or cancel anytime.</Text>
                </View>
                <View style={{ width: "90%", flex: 1, marginTop: responsiveScreenHeight(2), alignSelf: "center", borderRadius: 10, }}>
                    <FlatList contentContainerStyle={{ flex: 1, gap: responsiveScreenHeight(2) }} data={plans?.plans} renderItem={({ item, index }) => (
                        <View style={{ overflow: "hidden", backgroundColor: index === 0 ? "#E5E4E2" : index === 1 ? "#FFD700" : "#AABDE4", borderRadius: 20 }}>
                            <Text style={{ color: colors.textPrimary, fontWeight: "800", fontSize: responsiveScreenFontSize(2.5), textAlign: "center", paddingVertical: responsiveScreenHeight(1) }}> {item.name}</Text>
                            <View style={{ justifyContent: "center", alignItems: "center", gap: responsiveScreenWidth(2), backgroundColor: "#09111E", }}>
                                <Text style={{ color: colors.white, marginTop: responsiveScreenHeight(2), fontSize: responsiveScreenFontSize(2.4), fontWeight: "600" }}>{item.display.label}</Text>
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(2.4), fontWeight: "600" }}>{item.price.formatted}</Text>
                                <Text style={{ color: colors.mediumGrayNatural, fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>{item.views.label}</Text>
                                {
                                    item.sections.map((sectionItem: any, index: number) => (
                                        <>
                                            {
                                                index !== 0 ? <Text style={{ color: colors.mediumGrayNatural, fontSize: responsiveScreenFontSize(2), width: "94%", marginTop: responsiveScreenHeight(1), fontWeight: "600" }}>{sectionItem.title}</Text> : null
                                            }


                                            {sectionItem.items.map((subItem: any, subIndex: number) => (
                                                <View key={subIndex} style={{ width: "94%", flexDirection: "row", alignItems: "flex-start", gap: responsiveScreenWidth(2) }}>
                                                    <View style={{ width: responsiveScreenHeight(3) }}>

                                                        <Image source={imagePath.check} style={{ height: responsiveScreenHeight(3), resizeMode: "contain" }} />
                                                    </View>
                                                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.9), fontWeight: "700", flex: 1, }}>{subItem}</Text>
                                                </View>
                                            ))}


                                        </>
                                    ))

                                }
                                <Pressable
                                    style={{
                                        width: '92%',
                                        justifyContent: 'center',
                                        marginTop: responsiveScreenHeight(2),
                                        borderRadius: 12,
                                        gap: responsiveScreenWidth(1),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.white,
                                        paddingHorizontal: responsiveScreenWidth(3),
                                        paddingVertical: responsiveScreenHeight(1.5),
                                        marginBottom: responsiveScreenHeight(2),

                                    }}
                                >
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.9), fontWeight: '700' }}>
                                        Select Plan
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )} />
                </View>
            </ScrollView>
        </NavigationBar>
    )
}

export default RecruiterHome

const styles = StyleSheet.create({
    container: {},

    headerRow: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: responsiveScreenWidth(5),
        alignItems: "center",
        gap: responsiveScreenWidth(3),
    },

    logoWrap: { flex: 1, height: responsiveScreenHeight(5) },
    logoImg: {
        height: "100%",
        width: responsiveScreenWidth(37),
        resizeMode: "contain",
    },

    btnWrap: { height: responsiveScreenHeight(4) },
    btnImg: { height: "100%", resizeMode: "contain" },

    notifWrap: { height: responsiveScreenHeight(3), aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: "white" },
    notifImg: { height: "100%", resizeMode: "contain" },

    bannerWrap: {
        width: "90%",
        alignSelf: "center",
        marginTop: responsiveScreenHeight(2),
        aspectRatio: 2.58,
    },
    bannerImg: { width: "100%", height: "100%" },

    statsRow: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        gap: responsiveScreenWidth(2),
        marginTop: responsiveScreenHeight(2),
    },

    statCard: {
        flex: 1,
        gap: responsiveScreenHeight(0.6),

        paddingHorizontal: responsiveScreenWidth(2),
        paddingVertical: responsiveScreenHeight(1),
        borderRadius: 15,
    },

    statIconWrap: { height: responsiveScreenHeight(3) },
    statIcon: { height: "100%", resizeMode: "contain" },

    statTitle: {
        fontSize: responsiveScreenFontSize(2),
        fontWeight: "800",
    },
    statValue: {
        fontSize: responsiveScreenFontSize(2),
        fontWeight: "800",

    },

    planWrap: {
        width: "90%",
        alignSelf: "center",
        marginTop: responsiveScreenHeight(1.5),
    },
    planTitle: {
        fontSize: responsiveScreenFontSize(3.2),
        fontWeight: "900",
    },
    planSubTitle: {
        fontSize: responsiveScreenFontSize(1.6),
        fontWeight: "600",
    },
});