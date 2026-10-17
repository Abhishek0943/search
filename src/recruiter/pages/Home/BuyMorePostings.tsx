import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions'
import imagePath from '../../../assets/imagePath'
import { ThemeContext } from '../../../context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '../../../store'
import Text from '../../../components/Text'
import { RecruiterPlans, RecruiterProfile, Tokien } from '../../../reducer/recruiterReducer'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { postApiCall } from '../../../api'
import { useAlert } from '../../../context/AlertContext'
import Purchases, { PurchasesPackage } from 'react-native-purchases';
type ErrorResponse = {
    message: string
    success: false
}
type SuccessResponse = {
    success: true,
    data: { id: string, job_postings_available: number, job_postings_total: number }
}
type APIResponse = SuccessResponse | ErrorResponse
function BuyMorePostings() {
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const { plan } = useAppSelector(state => state.recruiterReducer)
    const dispatch = useAppDispatch()
    const { showAlert } = useAlert();
    const pendingPackageIdRef = { current: null as number | null };
    const [isSelecting, setIsSelecting] = useState(false);
    const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const selectedPlan = plan.plans.find(p => p.id === expandedPlanId) || plan.plans[0];

    useEffect(() => {
        if (!expandedPlanId && plan.plans && plan.plans.length > 0) {
            setExpandedPlanId(plan.plans[0].id);
        }
    }, [plan.plans]);

    async function buyIosWithRevenueCat(item: any) {
        const key = item.apple_package_id
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
        if (!item) return;
        if (isSelecting) return;
        if (item.price.amount === 0) return free(item.id)

        if (Platform.OS === 'ios') {
            return buyIosWithRevenueCat(item)
        }

        return pay(item.price.currency, item.id)
    }

    async function pay(currency: string, id: string | number) {
        try {
            if (!id) return
            setIsSelecting(true);
            const json = await postApiCall<any>(`/company/packages/${id}/intent`, {
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
                        primary: colors.primary,
                        background: colors.white,
                        componentBackground: colors.gray,
                        componentBorder: colors.gray,
                        componentDivider: colors.gray,
                        primaryText: colors.textPrimary,
                        secondaryText: colors.textSecondary,
                        placeholderText: colors.textSecondary,
                        icon: colors.textPrimary,
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
            setIsLoadingProfile(true);
            dispatch(RecruiterProfile()).finally(() => setIsLoadingProfile(false));
        },
        [],
    ))

    async function free(id: string | number) {
        if (!id) return
        setIsSelecting(true);
        const json = await postApiCall<APIResponse>(`/company/packages/${id}/free`, {});
        if (json.success) {
            dispatch(RecruiterProfile())
            dispatch(RecruiterPlans())
            showAlert({
                title: "Successful",
                message: "Successfully Activate Free Plan",
            })
        }
        setIsSelecting(false);
    }

    useFocusEffect(
        useCallback(() => {
            dispatch(RecruiterPlans())
        }, [])
    )
    return (
        <NavigationBar navigationBar={false}>
            <>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Image source={imagePath.leftAngle} style={styles.backIcon} />
                    </Pressable>
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.titleContainer}>
                        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Buy more postings</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Select a package below to get started.</Text>
                    </View>
                    {isLoadingProfile && (
                        <View style={{ marginTop: responsiveHeight(5), alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                    {
                        !isLoadingProfile && (
                            <>
                                {
                                    plan?.plans?.map((item, index) => {
                                        const isExpanded = expandedPlanId === item.id;
                                        const isPopular = item.name?.toLowerCase().includes('gold') || item.name?.toLowerCase().includes('popular');

                                        return (
                                            <TouchableOpacity
                                                key={index + "BuyMorePostings"}
                                                onPress={() => setExpandedPlanId(item.id)}
                                                activeOpacity={0.8}
                                                style={{
                                                    borderWidth: isExpanded ? 1.5 : 1,
                                                    borderColor: isExpanded ? colors.primary : colors.gray,
                                                    borderRadius: 16,
                                                    padding: responsiveWidth(4),
                                                    marginBottom: responsiveHeight(1.5),
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: isExpanded ? colors.primary : colors.gray,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        marginRight: responsiveWidth(4)
                                                    }}>
                                                        {isExpanded && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.textPrimary }}>{item.name}</Text>
                                                            {isPopular && (
                                                                <View style={{ backgroundColor: colors.primary50, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                                                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.2), fontWeight: '800' }}>POPULAR</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, marginTop: 2, fontWeight: '500' }}>
                                                            {item.display?.label || `${item.duration_days || 0} days · ${item.postings || 1} posting`}
                                                        </Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.textPrimary, marginRight: 8 }}>
                                                            {item.price?.formatted || `AUD ${item.price?.amount || 0}`}
                                                        </Text>
                                                        <Image source={imagePath.DownAngle} style={{ width: 16, height: 16, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }], resizeMode: "contain", tintColor: colors.textSecondary }} />
                                                    </View>
                                                </View>

                                                {isExpanded && (
                                                    <View style={{ marginTop: responsiveHeight(2), paddingTop: responsiveHeight(2), borderTopWidth: 1, borderTopColor: colors.gray }}>
                                                        {item.sections?.[0]?.items?.map((subItem: string, index: number) => (
                                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(1) }}>
                                                                <Image source={imagePath.Check2} style={{ resizeMode: "contain", width: 16, height: 16, tintColor: colors.primary, marginRight: 8, marginTop: 2 }} />
                                                                <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, flex: 1, fontWeight: '500' }}>{subItem}</Text>
                                                            </View>
                                                        )) || (
                                                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                                    <Image source={imagePath.Check2} style={{ resizeMode: "contain", width: 16, height: 16, tintColor: colors.primary, marginRight: 8, marginTop: 2 }} />
                                                                    <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.textSecondary, flex: 1, fontWeight: '500' }}>{item.views?.label || 'Standard visibility'}</Text>
                                                                </View>
                                                            )}
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                            </>
                        )
                    }


                </ScrollView>
                {
                    user?.is_active && selectedPlan && (
                        <View style={{
                            padding: responsiveWidth(5),
                            borderTopWidth: 1,
                            borderTopColor: colors.gray,
                        }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.primary,
                                    borderRadius: 12,
                                    paddingVertical: responsiveHeight(1.8),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row'
                                }}
                                onPress={() => onSelectPlan(selectedPlan)}
                                disabled={isSelecting}
                            >
                                {isSelecting ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '700' }}>
                                        {selectedPlan.price?.amount === 0 ? 'Get Free Plan' : `Pay ${selectedPlan.price?.formatted || 'AUD 0'}`}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(1.5), fontWeight: '500' }}>
                                Secure payment by Stripe · cancel anytime
                            </Text>
                        </View>
                    )
                }
            </>

        </NavigationBar >
    );
}

export default BuyMorePostings;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: responsiveHeight(5),
    },
    header: {
        paddingHorizontal: responsiveWidth(5),
        paddingTop: responsiveHeight(2),
        paddingBottom: responsiveHeight(1),
    },
    titleContainer: {
        marginBottom: responsiveHeight(3),
    },
    pageTitle: {
        fontSize: responsiveFontSize(3.2),
        fontWeight: '800',
        marginTop: 5,
    },
    pageSubtitle: {
        fontSize: responsiveFontSize(1.8),
        marginTop: 5,
        fontWeight: '500',
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
        alignSelf: 'flex-start',
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    listContent: {
        paddingHorizontal: responsiveScreenWidth(5),
        paddingTop: responsiveScreenHeight(2),
        paddingBottom: responsiveScreenHeight(2),
    }
});



