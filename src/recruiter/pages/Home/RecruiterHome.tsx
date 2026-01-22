import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, BackHandler, FlatList, Image, Pressable, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { API_URL, routes } from '../../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../../assets/imagePath'
import { ThemeContext } from '../../../context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '../../../store'
import Text from '../../../components/Text'
import { RecruiterPlans, RecruiterProfile } from '../../../reducer/recruiterReducer'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { postApiCall } from '../../../api'
import { useAlert } from '../../../context/AlertContext'
import { ProfileData } from '../../../reducer/jobsReducer'
function RecruiterHome() {
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const dispatch = useAppDispatch()
    const [plans, setPlans] = useState([])
    const { showAlert } = useAlert();

    async function pay(currency, id) {
        try {
            if (!id) return
            const json = await postApiCall(`/company/packages/${id}/intent`, {
                currency,
            });
            const clientSecret = json?.data?.client_secret;
            if (!clientSecret) {
                return;
            }
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'JobReady Placements',
                applePay: {
                    merchantCountryCode: 'AU',
                },
                googlePay: {
                    merchantCountryCode: 'AU',
                    testEnv: true,
                },
                style: 'alwaysLight',
                appearance: {
                    colors: {
                        primary: colors.primary,        // main button
                        background: '#FFFFFF',     // sheet bg
                        componentBackground: '#F2F2F7',
                        componentBorder: '#D1D1D6',
                        componentDivider: '#E5E5EA',
                        primaryText: '#111111',
                        secondaryText: '#6B7280',
                        placeholderText: '#9CA3AF',
                        icon: '#111111',
                        error: '#FF3B30',
                    },
                    shapes: {
                        borderRadius: 12,
                        borderWidth: 1,
                    },
                    primaryButton: {
                        shapes: { borderRadius: 12 },
                    },
                },
            });
            if (initError) {
                return;
            }
            const { error: payError, } = await presentPaymentSheet();
            if (payError) {
                return;
            }
            dispatch(RecruiterProfile())
            dispatch(RecruiterPlans()).unwrap().then((res) => {
                if (res.success) {
                    setPlans(res.data)
                }
            })
            showAlert({
                title: "Successful",
                message: "Successfully Activate Plan",
            })
        } catch (error) {
        }

    }
    useFocusEffect(useCallback(
        () => {
            dispatch(RecruiterProfile())
        },
        [],
    )
    )

    async function free(id) {
        try {
            if (!id) return
            const json = await postApiCall(`/company/packages/${id}/free`, {});
            if (json.success) {
                dispatch(RecruiterProfile())
                dispatch(RecruiterPlans()).unwrap().then((res) => {
                    if (res.success) {
                        setPlans(res.data)
                    }
                })
                showAlert({
                    title: "Successful",
                    message: "Successfully Activate Free Plan",
                })
            }
        } catch (error) {
        }

    }

    useFocusEffect(
        useCallback(() => {
            dispatch(RecruiterPlans()).unwrap().then((res) => {
                if (res.success) {
                    setPlans(res.data)
                }
            })
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => true
            )
            return () => backHandler.remove()
        }, [])
    )

    const flatListRef = useRef<FlatList>(null);
    return (
        <NavigationBar name={routes.RECRUITERHOME}>
            <>
                <Image source={require("./Ellipse44.png")} style={{ position: "absolute", width: responsiveScreenWidth(100), height: responsiveScreenHeight(100), top: -100, }} />

                <View style={{ width: "90%", flex: 1, marginTop: responsiveScreenHeight(2), alignSelf: "center", borderRadius: 10, }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                        ref={flatListRef}
                        ListHeaderComponent={() => {
                            return (
                                <>
                                    <View style={styles.headerRow}>
                                        <View style={styles.logoWrap}>
                                            <Image source={imagePath.logo} style={styles.logoImg} />
                                        </View>

                                        <TouchableOpacity onPress={() => navigation.navigate(routes.COMPANY, { company: true })} style={styles.btnWrap}>
                                            <Image source={imagePath.button} style={styles.btnImg} />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => navigation.navigate(routes.NOTIFICATION, { company: true })} style={styles.notifWrap}>
                                            <Image source={imagePath.notification} style={styles.notifImg} />
                                        </TouchableOpacity>
                                    </View>
                                    <Pressable

                                        onPress={() => {
                                            flatListRef.current?.scrollToOffset({
                                                offset: responsiveScreenHeight(40), 
                                                animated: true,
                                            });
                                        }}
                                    >
                                        <View style={styles.bannerWrap}>
                                            <Image source={imagePath.recruterBanner} style={styles.bannerImg} />
                                        </View>
                                    </Pressable>
                                    <View style={styles.statsRow}>

                                        <TouchableOpacity onPress={() => navigation.navigate(routes.OPENJOBS)} style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                                            <>

                                                <View style={styles.statIconWrap}>
                                                    <Image source={imagePath.clock2} style={styles.statIcon} />
                                                </View>
                                                <Text style={styles.statTitle}>Opens Jobs</Text>
                                                <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>{user?.jobs_count ?? 0}</Text>
                                            </>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                                            <View style={styles.statIconWrap}>
                                                <Image source={imagePath.activeProfile} style={styles.statIcon} />
                                            </View>
                                            <Text style={styles.statTitle}>Followers</Text>
                                            <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>{user?.followers_count ?? 0}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => navigation.navigate(routes.CHAT, { followers: true })} style={[styles.statCard, { backgroundColor: colors.lightGrayNatural, }]}>
                                            <View style={styles.statIconWrap}>
                                                <Image source={imagePath.chat} style={styles.statIcon} />
                                            </View>
                                            <Text style={styles.statTitle}>Messages</Text>
                                            <Text style={[styles.statValue, { color: colors.darkGrayNatural, }]}>{user?.messages_count ?? 0}</Text>

                                        </TouchableOpacity>

                                    </View>
                                    <View style={styles.planWrap}>
                                        <Text style={styles.planTitle}>Choose your plan</Text>
                                        <Text style={[styles.planSubTitle, { color: colors.hardGray, marginTop: responsiveScreenHeight(.8) }]}>Change or cancel anytime.</Text>
                                    </View>
                                </>
                            )
                        }}

                        contentContainerStyle={{ gap: responsiveScreenHeight(2) }} data={plans?.plans} renderItem={({ item, index }) => (
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
                                        onPress={() => {

                                            if (item.price.amount === 0) {
                                                free(item.id)
                                            } else {

                                                pay(item.price.currency, item.id)
                                            }
                                        }
                                        }
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
            </>

        </NavigationBar>
    )
}

export default RecruiterHome

const styles = StyleSheet.create({
    container: {},

    headerRow: {
        flexDirection: "row",
        width: "100%",
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
        width: "100%",
        alignSelf: "center",
        marginTop: responsiveScreenHeight(2),
        aspectRatio: 2.58,
    },
    bannerImg: { width: "100%", height: "100%" },

    statsRow: {
        width: "100%",
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
        width: "100%",
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