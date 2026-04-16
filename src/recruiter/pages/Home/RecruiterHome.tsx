import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { API_URL, routes } from '../../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../../assets/imagePath'
import { ThemeContext } from '../../../context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '../../../store'
import Text from '../../../components/Text'
import { RecruiterPlans, RecruiterProfile, Tokien } from '../../../reducer/recruiterReducer'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { postApiCall } from '../../../api'
import { useAlert } from '../../../context/AlertContext'
import { ProfileData } from '../../../reducer/jobsReducer'
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
const iosApiKey = 'appl_dqiZtBzrbZSAYRmwUwEQdHnpuNO';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFCMToken, onDisplayNotification } from '../../../utils/notificationService'
const androidApiKey = 'test_dhcgdmeEwfOkaCafwBLIkiUeUcf';
function RecruiterHome() {
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const { plan } = useAppSelector(state => state.recruiterReducer)
    const dispatch = useAppDispatch()
    const { showAlert } = useAlert();
    const pendingPackageIdRef = { current: null as number | null };
    const [isSelecting, setIsSelecting] = useState(false);
    async function buyIosWithRevenueCat(item: any) {
        const key = item?.apple_package_id
        if (!key) {
            return Alert.alert('Error', 'Plan not available')
        }
        setIsSelecting(true);
        try {
            async function loadPackages() {
                const offerings = await Purchases.getOfferings();
                const current = offerings.current;
                if (!current) return {};
                const map: Record<string, PurchasesPackage> = {};
                for (const p of current.availablePackages) {
                    map[p.product.identifier] = p;
                }
                return map;
            }
            const rcPackages = await loadPackages();
            const pkg = rcPackages[key]

            if (!pkg) {
                Alert.alert('Error', 'Plan not available')
                return
            }
            pendingPackageIdRef.current = item.id
            try {
                await Purchases.purchasePackage(pkg)
                showAlert({
                    title: 'Successful',
                    message: 'Successfully Purchased Plan. If your plan is not updated, please restart the app. and make sure your app notification is enabled.',
                })
            } catch (e: any) {
                console.log('RC purchase error', e?.message ?? e)
            }
        } finally {
            setIsSelecting(false);
        }
    }
    async function onSelectPlan(item: any) {
        if (isSelecting) return;
        if (item.price.amount === 0) return free(item.id)


        if (Platform.OS === 'ios') {
            return buyIosWithRevenueCat(item)
        }


        return pay(item.price.currency, item.id)
    }
    async function pay(currency, id) {
        try {
            if (!id) return
            setIsSelecting(true);
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
            dispatch(RecruiterPlans())
            showAlert({
                title: "Successful",
                message: "Successfully Activate Plan",
            })
        } catch (error) {
        } finally {
            setIsSelecting(false);
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
            setIsSelecting(true);
            const json = await postApiCall(`/company/packages/${id}/free`, {});
            if (json.success) {
                dispatch(RecruiterProfile())
                dispatch(RecruiterPlans())
                showAlert({
                    title: "Successful",
                    message: "Successfully Activate Free Plan",
                })
            }
        } catch (error) {
        } finally {
            setIsSelecting(false);
        }

    }
    useEffect(() => {
        if (!user?.id) return;
        let unsubscribe: undefined | (() => void);
        const start = async () => {
            try {
                if (Platform.OS === "ios") {
                    const authStatus = await messaging().requestPermission();
                }
                unsubscribe = messaging().onMessage(async remoteMessage => {
                    // const { title, body } = remoteMessage.notification || {}
                    // const imageUrl = remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.imageUrl || remoteMessage.data?.image;
                    // if (title && body) {
                    //     onDisplayNotification(title, body, imageUrl as string)
                    // }
                    if (remoteMessage.data.type === "purchase") {
                        dispatch(RecruiterProfile())
                        dispatch(RecruiterPlans())
                        showAlert({
                            title: 'Successful',
                            message: 'Successfully Activate Plan',
                        })
                    }
                });
            } catch (e) {
            }
        };
        const registerTokenIfNeeded = async () => {
            if (!user?.id) return;
            await AsyncStorage.removeItem("FCM");
            const existing = await AsyncStorage.getItem("FCM");
            console.log("FCM cached:", existing);
            if (existing) {
                console.log("FCM cached:", existing);
                return;
            }
            const fcm = await getFCMToken();
            if (!fcm) return;

            const role = (await AsyncStorage.getItem("role")) as "seeker" | "recruiter" | null;

            await AsyncStorage.setItem("FCM", fcm);

            dispatch(
                Tokien({
                    device_token: fcm,
                    device_type: Platform.OS,
                    auth_type: role === "recruiter" ? "company" : "user",
                    auth_id: user.id,
                })
            );
        };
        registerTokenIfNeeded()
        start();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.id]);
    useFocusEffect(
        useCallback(() => {
            dispatch(RecruiterPlans())
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
                    {/* {
                        plan?.plans?.length > 0 ? <> */}
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                        ref={flatListRef}
                        ListEmptyComponent={() => {
                            if (!user?.is_active) {
                                return null
                            }
                            return (
                                <View style={{ flex: 1, marginTop: responsiveScreenHeight(15) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View>

                            )
                        }}
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
                                    {
                                        user.is_active ?
                                            <View style={styles.planWrap}>
                                                <Text style={styles.planTitle}>Choose your plan</Text>
                                                <Text style={[styles.planSubTitle, { color: colors.hardGray, marginTop: responsiveScreenHeight(.8) }]}>Change or cancel anytime.</Text>
                                            </View> : <>
                                                <Image source={require("./inActive.png")} style={{ marginVertical: responsiveScreenHeight(2) }} />
                                                <TouchableOpacity style={{}} onPress={() => navigation.navigate(routes.CONTACT)}>

                                                    <Image source={require("./popupbutton.png")} style={{}} />
                                                </TouchableOpacity>

                                            </>
                                    }
                                </>
                            )
                        }}

                        contentContainerStyle={{ gap: responsiveScreenHeight(2) }}
                        data={user.is_active ? plan?.plans : []}
                        renderItem={({ item, index }) => (
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
                                        onPress={() => onSelectPlan(item)}
                                        disabled={isSelecting}
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
                                            opacity: isSelecting ? 0.7 : 1

                                        }}
                                    >
                                        {
                                            isSelecting ? <ActivityIndicator size={responsiveScreenFontSize(2)} color={colors.textPrimary} /> :
                                                <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.9), fontWeight: '700' }}>
                                                    Select Plan
                                                </Text>
                                        }
                                    </Pressable>
                                </View>
                            </View>
                        )} />
                    {/* </> :
                            <>
                                <View style={{ flex: 1, marginTop: responsiveScreenHeight(15) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View>
                            </>
                    } */}

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