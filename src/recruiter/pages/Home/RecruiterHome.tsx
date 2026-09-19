import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { API_URL, routes } from '../../../constants/values'
import { responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
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
    const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
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
            if (existing) {
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

    // Derived values for the UI
    const companyInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';
    const companyName = user?.name || 'Company Name';
    const companyLocation = user?.location || 'Location Not Set';
    const liveJobs = user?.jobs_count ?? 0;

    return (
        <NavigationBar name={routes.RECRUITERHOME}>
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ref={flatListRef}
                    ListEmptyComponent={() => {
                        if (!user?.is_active) return null;
                        return (
                            <View style={{ flex: 1, marginTop: responsiveScreenHeight(15) }}>
                                <ActivityIndicator size={responsiveScreenFontSize(3)} />
                            </View>
                        );
                    }}
                    ListHeaderComponent={() => {
                        return (
                            <View style={styles.headerContainer}>
                                <View style={styles.headerRow}>
                                    <View style={styles.companyInfoRow}>
                                        <View style={styles.avatarWrap}>
                                            <Text style={[styles.avatarText,]}>{companyInitial}</Text>
                                        </View>
                                        <View style={styles.companyTextWrap}>
                                            <Text style={[styles.companyNameText, { color: colors.textPrimary }]}>{companyName}</Text>
                                            <Text style={[styles.companyLocationText, { color: colors.textSecondary }]}>{companyLocation}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => navigation.navigate(routes.NOTIFICATION, { company: true })} style={styles.notifBtn}>
                                        <Image source={imagePath.NotificationIcon} style={styles.notifIcon} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.welcomeWrap}>
                                    <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Let’s get you hiring</Text>
                                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Your venue is set up. One post and you're live.</Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.ctaCard, { backgroundColor: colors.primary }]}
                                    onPress={() => navigation.navigate(routes.ADDJOB)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.ctaIconRow}>
                                        <View style={styles.ctaPlusWrap}>
                                            <Image source={require("./AddIcon.png")} style={{ height: "100%", width: "100%", resizeMode: "contain" }} />
                                        </View>
                                        <View style={styles.ctaPlusWrap}>
                                            <Image source={require("./GoButton.png")} style={{ height: "100%", width: "100%", resizeMode: "contain" }} />

                                        </View>
                                    </View>
                                    <View >
                                        <Text style={[styles.ctaTitle, { color: colors.white }]}>Post your first job</Text>
                                        <Text style={[styles.ctaSubtitle, { color: colors.lightGray2 }]}>About 4 minutes · plans from AUD 0</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.statsRow}>
                                    <View style={[styles.statCard, { borderColor: colors.gray }]}>
                                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{liveJobs}</Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Live jobs</Text>
                                    </View>
                                    <View style={[styles.statCard, { borderColor: colors.gray }]}>
                                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>0</Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Applications</Text>
                                    </View>
                                    <View style={[styles.statCard, { borderColor: colors.gray }]}>
                                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>0</Text>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shortlisted</Text>
                                    </View>
                                </View>

                                {/* Plans Header */}
                                {user && user.is_active ? (
                                    <View >
                                        <View style={styles.planHeaderRow}>
                                            <Text style={[styles.planHeaderTitle, { color: colors.textPrimary }]}>Choose a plan</Text>
                                            <TouchableOpacity>
                                                <Text style={[styles.compareAllText, { color: colors.primary }]}>Compare all</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={[styles.planHeaderSubtitle, { color: colors.textSecondary }]}>You need a plan before a job goes live.</Text>
                                    </View>
                                ) : (
                                    <View style={{ height: responsiveScreenHeight(45), justifyContent: "center", alignItems: "center" }}>
                                        <Image source={require("./inActive.png")} style={{ marginVertical: responsiveScreenHeight(2) }} />
                                        <TouchableOpacity onPress={() => navigation.navigate(routes.CONTACT)}>
                                            {/* <Image source={require("./popupbutton.png")} /> */}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                    ListFooterComponent={() => {
                        if (!user?.is_active) return null;
                        return (
                            <View style={styles.footerWrap}>
                                <Image source={require("./RecruiterHome.png")} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                            </View>
                        );
                    }}
                    data={user ? (user.is_active ? plan?.plans : []) : []}
                    keyExtractor={(item) => item.id?.toString() || item.name}
                    renderItem={({ item }) => {
                        const isExpanded = expandedPlanId === item.id;
                        const isPopular = item.name?.toLowerCase().includes('gold') || item.name?.toLowerCase().includes('popular');
                        return (
                            <TouchableOpacity
                                style={[styles.planCard, { borderColor: colors.gray }]}
                                activeOpacity={0.8}
                                onPress={() => setExpandedPlanId(isExpanded ? null : item.id)}
                            >
                                <View style={styles.planCardHeaderRow}>
                                    <View style={styles.planCardTitleWrap}>
                                        <Text style={[styles.planCardTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                                        {isPopular && (
                                            <View style={styles.popularBadge}>
                                                <Text style={styles.popularBadgeText}>POPULAR</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.planCardPrice, { color: colors.textPrimary }]}>{item.price?.formatted || `AUD ${item.price?.amount || 0}`}</Text>
                                </View>

                                <View style={styles.planCardSubRow}>
                                    <Text style={[styles.planCardSubtitle, { color: colors.textPrimary }]}>{item.display?.label || `${item.duration_days || 0} days · ${item.postings || 1} posting`}</Text>
                                    <Image
                                        source={imagePath.DownAngle}
                                        style={[styles.chevronIcon, isExpanded && styles.chevronIconRotated]}
                                    />
                                </View>

                                <View style={styles.planFeatureRow}>
                                    <Image source={imagePath.Check2} style={[styles.checkIcon, { tintColor: colors.primary }]} />
                                    <Text style={[styles.planFeatureText, { color: colors.textSecondary }]}>{item.views?.label || 'Standard visibility'}</Text>
                                </View>

                                {isExpanded && (
                                    <View style={styles.expandedContent}>
                                        {item.sections?.map((sectionItem: any, index: number) => (
                                            <View key={index} style={styles.sectionWrap}>
                                                {index !== 0 && (
                                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{sectionItem.title}</Text>
                                                )}
                                                {sectionItem.items?.map((subItem: any, subIndex: number) => (
                                                    <View key={subIndex} style={styles.planFeatureRowExpanded}>
                                                        <Image source={imagePath.Check2} style={[styles.checkIcon, { tintColor: colors.primary }]} />
                                                        <Text style={[styles.planFeatureTextExpanded, { color: colors.textSecondary }]}>{subItem}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            onPress={() => onSelectPlan(item)}
                                            disabled={isSelecting}
                                            style={styles.selectPlanBtn}
                                        >
                                            {isSelecting && pendingPackageIdRef.current === item.id ? (
                                                <ActivityIndicator size={responsiveScreenFontSize(2)} color={colors.white} />
                                            ) : (
                                                <Text style={styles.selectPlanBtnText}>Get {item?.name} · {item?.price?.formatted}</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </NavigationBar>
    );
}

export default RecruiterHome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFC', // Very light background to match screenshot
    },
    listContent: {
        paddingHorizontal: responsiveScreenWidth(5),
        paddingTop: responsiveScreenHeight(2),
        paddingBottom: responsiveScreenHeight(5),
    },
    headerContainer: {
        marginBottom: responsiveScreenHeight(2),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveScreenHeight(3),
    },
    companyInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrap: {
        width: responsiveScreenHeight(5.5),
        height: responsiveScreenHeight(5.5),
        borderRadius: responsiveScreenHeight(3),
        backgroundColor: '#E8F5EE', // Light green background for avatar
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: responsiveScreenWidth(3),
    },
    avatarText: {
        color: '#0B4F42', // Dark green text
        fontSize: responsiveScreenFontSize(2.5),
        fontWeight: '700',
    },
    companyTextWrap: {
        justifyContent: 'center',
    },
    companyNameText: {
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: '800',
        marginBottom: responsiveScreenHeight(0.2),
    },
    companyLocationText: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },
    notifBtn: {
        width: responsiveScreenHeight(5.5),
        height: responsiveScreenHeight(5.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifIcon: {
        width: '50%',
        height: '50%',
        resizeMode: 'contain',
    },
    welcomeWrap: {
        marginBottom: responsiveScreenHeight(3),
    },
    welcomeTitle: {
        fontSize: responsiveScreenFontSize(3.5),
        fontWeight: '800',
        marginBottom: responsiveScreenHeight(0.5),
    },
    welcomeSubtitle: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },
    ctaCard: {
        borderRadius: 20,
        padding: responsiveScreenWidth(5),
        marginBottom: responsiveScreenHeight(3),
    },
    ctaIconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: responsiveScreenHeight(2),
    },
    ctaPlusWrap: {
        width: responsiveScreenHeight(6),
        aspectRatio: 1
    },
    ctaPlusText: {
        color: '#FFF',
        fontSize: responsiveScreenFontSize(4),
        fontWeight: '300',
        lineHeight: responsiveScreenFontSize(4.5),
    },
    ctaArrowWrap: {
        width: responsiveScreenHeight(5),
        height: responsiveScreenHeight(5),
        borderRadius: responsiveScreenHeight(2.5),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaArrowImg: {
        width: '40%',
        height: '40%',
        resizeMode: 'contain',
        tintColor: '#1A5FA8',
    },

    ctaTitle: {
        fontSize: responsiveScreenFontSize(2.5),
        fontWeight: '800',
        marginBottom: responsiveScreenHeight(0.5),
    },
    ctaSubtitle: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: responsiveScreenHeight(2),
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: responsiveScreenHeight(2),
        marginHorizontal: responsiveScreenWidth(1),
        alignItems: 'center',
        borderWidth: 1,
    },
    statNumber: {
        fontSize: responsiveScreenFontSize(3.5),
        fontWeight: '800',
        marginBottom: responsiveScreenHeight(0.5),
    },
    statLabel: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },

    planHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: responsiveScreenHeight(0.5),
    },
    planHeaderTitle: {
        fontSize: responsiveScreenFontSize(2.4),
        fontWeight: '800',
    },
    compareAllText: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '700',
    },
    planHeaderSubtitle: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },
    planCard: {
        borderRadius: 16,
        padding: responsiveScreenWidth(4),
        marginBottom: responsiveScreenHeight(1.5),
        borderWidth: 1,
    },
    planCardPopular: {
        borderColor: '#1A5FA8',
        borderWidth: 1.5,
    },
    planCardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveScreenHeight(0.5),
    },
    planCardTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planCardTitle: {
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: '800',
    },

    popularBadge: {
        backgroundColor: '#E8F5EE',
        paddingHorizontal: responsiveScreenWidth(2),
        paddingVertical: responsiveScreenHeight(0.3),
        borderRadius: 6,
        marginLeft: responsiveScreenWidth(2),
    },
    popularBadgeText: {
        color: '#0E8A5A',
        fontSize: responsiveScreenFontSize(1.2),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    planCardPrice: {
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: '800',
    },
    planCardSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveScreenHeight(1),
    },
    planCardSubtitle: {
        fontSize: responsiveScreenFontSize(1.6),
        color: '#7B8CA3',
        fontWeight: '500',
    },
    chevronIcon: {
        width: responsiveScreenHeight(2),
        height: responsiveScreenHeight(2),
        resizeMode: 'contain',
        tintColor: '#7B8CA3',
    },
    chevronIconRotated: {
        transform: [{ rotate: '180deg' }],
    },
    planFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: responsiveScreenHeight(0.5),
    },
    checkIcon: {
        width: responsiveScreenHeight(1.8),
        height: responsiveScreenHeight(1.8),
        resizeMode: 'contain',
        marginTop: responsiveHeight(.25),
        marginRight: responsiveScreenWidth(2),
    },
    planFeatureText: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
    },
    expandedContent: {
        marginTop: responsiveScreenHeight(2),
        paddingTop: responsiveScreenHeight(2),
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
    },
    sectionWrap: {
        marginBottom: responsiveScreenHeight(1.5),
    },
    sectionTitle: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '700',
        marginBottom: responsiveScreenHeight(1),
    },
    planFeatureRowExpanded: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: responsiveScreenHeight(1),
    },
    planFeatureTextExpanded: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '500',
        flex: 1,
    },
    selectPlanBtn: {
        backgroundColor: '#1A5FA8',
        borderRadius: 12,
        paddingVertical: responsiveScreenHeight(1.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: responsiveScreenHeight(1),
    },
    selectPlanBtnText: {
        color: '#FFF',
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '700',
    },
    footerWrap: {
        marginTop: responsiveScreenHeight(2),
        marginBottom: responsiveScreenHeight(2),
        width: responsiveWidth(80),
        aspectRatio: 332 / 147
    },
    footerTitle: {
        fontSize: responsiveScreenFontSize(2.4),
        fontWeight: '800',
        color: '#1A5FA8',
        marginBottom: responsiveScreenHeight(3),
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: responsiveScreenHeight(2.5),
        position: 'relative',
    },
    stepNumberWrap: {
        width: responsiveScreenHeight(3.5),
        height: responsiveScreenHeight(3.5),
        borderRadius: responsiveScreenHeight(1.75),
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: responsiveScreenWidth(4),
        zIndex: 2,
    },
    stepNumberText: {
        color: '#0E8A5A',
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '800',
    },
    stepText: {
        flex: 1,
        fontSize: responsiveScreenFontSize(1.8),
        color: '#494949',
        fontWeight: '500',
        marginTop: responsiveScreenHeight(0.5),
    },
    stepLine: {
        position: 'absolute',
        left: responsiveScreenHeight(1.75) - 1, // center of the circle
        top: responsiveScreenHeight(3.5), // bottom of the circle
        width: 2,
        height: responsiveScreenHeight(4.5), // approximate distance to next circle
        backgroundColor: '#E8F5EE',
        zIndex: 1,
    }
});