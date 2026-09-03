import { Image, TouchableOpacity, ScrollView, StyleSheet, View, ActivityIndicator, Pressable, Share, Platform, Alert, BackHandler, Animated } from 'react-native'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { Bookmark, GetJob, ReportJob, toggleBookmark } from '../../reducer/jobsReducer'
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { formatSalaryRange } from '../../utils'
import { Fonts } from '../../assets/imagePath';
import Text from '../../components/Text'
import { useAlert } from '../../context/AlertContext'
import Button from '../../components/Button';


function closingLabel(expiredAt?: string): string | null {
    if (!expiredAt) return null;
    const [day, month, year] = expiredAt.split("-").map(Number);
    const target = new Date(year, month - 1, day);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${target.getDate()} ${months[target.getMonth()]} ${target.getFullYear()}`;
    if (diffDays === 0) return null;
    return `Closes in ${diffDays} day${diffDays !== 1 ? 's' : ''} · ${formatted}`;
}

function getInitial(name?: string): string {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
}

const Jobdetail = () => {
    const { colors } = useContext(ThemeContext)
    const route = useRoute()
    const { id } = route.params as { id: number }
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { user } = useAppSelector(state => state.userStore)
    const { bookmarkedJobIds } = useAppSelector(state => state.jobsReducer)
    const [loading, setLoading] = useState(true)
    const dispatch = useAppDispatch()
    const [job, setJob] = useState<Job>()
    const [role, setRole] = useState<string | null>(null)
    const [detailsExpanded, setDetailsExpanded] = useState(true)
    const rotateAnim = useRef(new Animated.Value(1)).current // 1 = expanded (arrow up)
    useEffect(() => {
        const getRole = async () => {
            const r = await AsyncStorage.getItem("role")
            setRole(r)
        }
        getRole()
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (!navigation.canGoBack()) {
                    if (role === "recruiter") {
                        (navigation as any).replace(routes.RECRUITERHOME);
                    } else {
                        (navigation as any).replace(routes.HOME);
                    }
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation, role])
    );

    const { appliedJobIds } = useAppSelector(state => state.jobsReducer)
    const isApplied = appliedJobIds.includes(id)

    useEffect(() => {
        dispatch(GetJob({ id })).unwrap().then((res) => {
            if (res.success) {
                setJob(res.data.jobDetail)
            }
            setLoading(false)
        })
    }, [id])

    const shareJobPost = async (job: Job) => {
        try {
            const shareUrl = `${job?.jobUrl}`;
            await Share.share({
                message: `🔥 New Job Opportunity!\n\nApply here:\n${shareUrl}`,
                url: shareUrl,
                title: "Search Talent",
            });
        } catch (error) { }
    };

    const { showConfirm, showAlert } = useAlert();

    const toggleDetails = () => {
        const toValue = detailsExpanded ? 0 : 1;
        Animated.timing(rotateAnim, {
            toValue,
            duration: 250,
            useNativeDriver: true,
        }).start();
        setDetailsExpanded(!detailsExpanded);
    };

    const chevronRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const isBookmarked = job ? (bookmarkedJobIds[job.id] ?? job.is_favorited) : false;

    const handleBookmark = () => {
        if (!job) return;
        dispatch(toggleBookmark({ id: job.id, is_favorited: isBookmarked }))
        dispatch(Bookmark({ id: job.id })).unwrap().then((res) => {
            if (res.success) {
                dispatch(GetJob({ id })).unwrap().then((res) => {
                    if (res.success) {
                        setJob(res.data.jobDetail)
                    }
                })
            } else {
                showAlert({
                    title: "Validation",
                    message: res.message,
                })
                dispatch(toggleBookmark({ id: job.id, is_favorited: isBookmarked }))
            }
        })
    };

    // Build salary display string
    const salaryDisplay = useMemo(() => {
        if (!job || !job.salary || job.is_hide_salary) return null;
        const amount = `${job.salary_currency || ''}${formatSalaryRange(job.salary)}`;
        const period = job.salary_period ? ` / ${job.salary_period}` : '';
        const type = job.jobType ? ` · ${job.jobType}` : '';
        return `${amount}${period}${type}`;
    }, [job]);

    // Closing label


    // Collect tags
    const tags = useMemo(() => {
        if (!job) return [];
        const t: string[] = [];
        if (job.jobType) t.push(job.jobType);
        if (job.functionalArea) t.push(job.functionalArea);
        return t;
    }, [job]);

    // Build job details grid items

    const dynamicStyles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        headerBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: responsiveScreenWidth(5),
            paddingVertical: responsiveScreenHeight(1.5),
        },
        headerIconBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingBottom: responsiveScreenHeight(12),
        },
        // ── Company Info ──
        companySection: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: responsiveScreenWidth(3),
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(1),
        },
        avatarCircle: {
            width: responsiveScreenWidth(11),
            height: responsiveScreenWidth(11),
            borderRadius: responsiveScreenWidth(5.5),
            backgroundColor: '#E8F0FE',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
        },
        avatarInitial: {
            fontSize: responsiveScreenFontSize(2.2),
            fontWeight: '700',
            color: colors.primary,
        },
        companyName: {
            fontSize: responsiveScreenFontSize(1.7),
            fontWeight: '600',
            color: colors.textPrimary,
        },
        companyLocation: {
            fontSize: responsiveScreenFontSize(1.5),
            color: colors.textSecondary,
            marginTop: 2,
        },
        // ── Title & Salary ──
        titleSection: {
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(2),
        },
        jobTitle: {
            fontSize: responsiveScreenFontSize(2.8),
            fontWeight: '800',
            color: colors.textPrimary,
            lineHeight: responsiveScreenFontSize(3.6),
        },
        salaryLine: {
            fontSize: responsiveScreenFontSize(1.8),
            fontWeight: '600',
            color: colors.primary,
            marginTop: responsiveScreenHeight(0.8),
            textTransform: 'capitalize',
        },
        // ── Tags ──
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: responsiveScreenWidth(2),
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(1.5),
        },
        tag: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#E8F0FE',
            paddingVertical: responsiveScreenHeight(0.6),
            paddingHorizontal: responsiveScreenWidth(3),
            borderRadius: 20,
            gap: 4,
        },
        tagCheckmark: {
            fontSize: responsiveScreenFontSize(1.4),
            color: colors.primary,
            fontWeight: '700',
        },
        tagText: {
            fontSize: responsiveScreenFontSize(1.5),
            color: colors.primary,
            fontWeight: '600',
            textTransform: 'capitalize',
        },
        // ── Closing ──
        closingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(1.5),
        },
        closingIcon: {
            fontSize: responsiveScreenFontSize(1.6),
        },
        closingText: {
            fontSize: responsiveScreenFontSize(1.5),
            color: '#0E8A5A',
            fontWeight: '600',
        },
        expiredBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(1.5),
        },
        expiredText: {
            fontSize: responsiveScreenFontSize(1.5),
            color: '#FF383C',
            fontWeight: '600',
        },
        // ── Job Details Card ──
        detailsCard: {
            marginHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(2.5),
            borderWidth: 1,
            borderColor: '#E4E9F0',
            borderRadius: 14,
            overflow: 'hidden',
        },
        detailsHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: responsiveScreenWidth(4),
            paddingVertical: responsiveScreenHeight(1.8),
        },
        detailsHeaderText: {
            fontSize: responsiveScreenFontSize(2),
            fontWeight: '700',
            color: colors.textPrimary,
        },
        detailsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: responsiveScreenWidth(4),
            borderTopWidth: 1,
            borderColor: colors.gray,
            paddingBottom: responsiveScreenHeight(2),
        },
        detailGridItem: {
            width: '50%',
            marginBottom: responsiveScreenHeight(1.5),
        },
        detailLabel: {
            fontSize: responsiveScreenFontSize(1.4),
            color: colors.textSecondary,
            marginBottom: 3,
        },
        detailValue: {
            fontSize: responsiveScreenFontSize(1.7),
            fontWeight: '700',
            color: colors.textPrimary,
            textTransform: 'capitalize',
        },
        // ── Content Sections ──
        sectionContainer: {
            paddingHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(2.5),
        },
        sectionTitle: {
            fontSize: responsiveScreenFontSize(2),
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: responsiveScreenHeight(1),
            textTransform: 'capitalize',
        },
        // ── Divider ──
        divider: {
            height: 1,
            backgroundColor: '#E4E9F0',
            marginHorizontal: responsiveScreenWidth(5),
            marginTop: responsiveScreenHeight(2.5),
        },
        // ── Bottom Bar ──
        bottomBar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: responsiveScreenWidth(5),
            paddingVertical: responsiveScreenHeight(1.5),
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: '#E4E9F0',
            gap: responsiveScreenWidth(3),
        },
        bookmarkBtn: {

            borderRadius: 12,
            borderWidth: 1.5,
            height: "100%",
            aspectRatio: 1,
            paddingBlock: responsiveHeight(2),
            borderColor: colors.gray,
            justifyContent: 'center',
            alignItems: 'center',
        },
        applyBtn: {
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 25,
            paddingVertical: responsiveScreenHeight(1.8),
            justifyContent: 'center',
            alignItems: 'center',
        },
        applyBtnDisabled: {
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 25,
            paddingVertical: responsiveScreenHeight(1.8),
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.5,
        },
        applyBtnExpired: {
            flex: 1,
            backgroundColor: '#FFE5E6',
            borderRadius: 25,
            borderWidth: 1,
            borderColor: '#FF383C',
            paddingVertical: responsiveScreenHeight(1.8),
            justifyContent: 'center',
            alignItems: 'center',
        },
        applyBtnText: {
            color: colors.white,
            fontSize: responsiveScreenFontSize(1.9),
            fontWeight: '700',
        },
        applyBtnTextExpired: {
            color: '#FF383C',
            fontSize: responsiveScreenFontSize(1.9),
            fontWeight: '700',
        },
        // ── Loading / Empty ──
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: responsiveScreenHeight(40),
        },
        emptyContainer: {
            marginTop: responsiveScreenHeight(20),
            alignItems: 'center',
        },
        emptyText: {
            fontSize: responsiveScreenFontSize(2),
            color: colors.textSecondary,
        },
        goBackBtn: {
            marginTop: responsiveScreenHeight(2),
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
        },
        goBackBtnText: {
            color: colors.white,
        },
        chevronIcon: {
            width: 20,
            height: 20,
            resizeMode: 'contain',
        },
        reportBtn: {
            marginTop: responsiveScreenHeight(1),
            alignSelf: 'center',
            paddingVertical: responsiveScreenHeight(1),
            paddingHorizontal: responsiveScreenWidth(6),
        },
        reportText: {
            fontSize: responsiveScreenFontSize(1.5),
            color: '#FF383C',
            fontWeight: '600',
        },
    }), [colors]);


    const renderContent = () => {
        if (loading) {
            return (
                <View style={dynamicStyles.loadingContainer}>
                    <ActivityIndicator size={responsiveScreenFontSize(3)} color={colors.primary} />
                </View>
            );
        }

        if (!job) {
            return (
                <View style={dynamicStyles.emptyContainer}>
                    <Text style={dynamicStyles.emptyText}>Job details not available.</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                if (role === "recruiter") {
                                    (navigation as any).replace(routes.RECRUITERHOME);
                                } else {
                                    (navigation as any).replace(routes.HOME);
                                }
                            }
                        }}
                        style={dynamicStyles.goBackBtn}
                    >
                        <Text style={dynamicStyles.goBackBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <>
                <View style={dynamicStyles.companySection}>
                    <View style={dynamicStyles.avatarCircle}>
                        {job.company_info?.image ? (
                            <Image source={{ uri: job.company_info.image }} style={dynamicStyles.avatarImage} />
                        ) : (
                            <Text style={dynamicStyles.avatarInitial}>{getInitial(job.company_info?.name)}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.primary2, fontWeight: "600", fontSize: responsiveFontSize(1.9) }}>{job.company_info?.name}</Text>
                        {job.jobLocation ? (
                            <Text style={{ color: colors.textSecondary, fontWeight: "500", fontSize: responsiveFontSize(1.9) }}>{job.jobLocation}</Text>
                        ) : null}
                    </View>
                </View>

                <View style={dynamicStyles.titleSection}>
                    <Text style={{ color: colors.textPrimary, fontWeight: "800", fontSize: responsiveFontSize(2.8) }}>{job.title}</Text>
                    {salaryDisplay ? (
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.primary }}>{salaryDisplay}</Text>
                    ) : null}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveScreenWidth(2), paddingHorizontal: responsiveScreenWidth(5), marginTop: responsiveHeight(1) }}>
                    {(tags || []).slice(0, 2).map((tag: string, idx: number) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: responsiveScreenWidth(2.5), paddingVertical: responsiveScreenHeight(0.4), borderRadius: 8, gap: 4 }}>
                            <Image source={imagePath.Check2} tintColor={colors.primary} style={{ resizeMode: "contain", width: responsiveWidth(3), height: responsiveWidth(3) }} />
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.primary, fontWeight: '500' }}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <View style={{ marginHorizontal: responsiveScreenWidth(5), alignItems: "center", gap: responsiveWidth(1.5) }}>
                    <View style={{ alignSelf: "flex-start", paddingVertical: responsiveHeight(.5), borderRadius: 8, backgroundColor: "#FDF3DE", marginTop: responsiveHeight(1), flexDirection: "row", alignItems: "center", gap: responsiveWidth(2), paddingHorizontal: responsiveScreenWidth(3) }}>
                        <View style={{ width: responsiveWidth(3), aspectRatio: 1, justifyContent: "center", alignItems: "center" }}>
                            <Image source={imagePath.Clock} style={{ width: "100%", height: "100%" }} />
                        </View>
                        <Text style={{ color: "#96650A", fontSize: responsiveFontSize(1.6), fontWeight: "600" }}>{closingLabel(job?.expiredAt)}</Text>
                    </View>
                </View>
                <View style={dynamicStyles.detailsCard}>
                    <TouchableOpacity
                        style={dynamicStyles.detailsHeader}
                        onPress={toggleDetails}
                        activeOpacity={0.7}
                    >
                        <Text style={dynamicStyles.detailsHeaderText}>Job details</Text>
                        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                            <Image source={imagePath.DownAngle} style={dynamicStyles.chevronIcon} tintColor={colors.textPrimary} />
                        </Animated.View>
                    </TouchableOpacity>

                    {detailsExpanded && (
                        <View style={dynamicStyles.detailsGrid}>
                            {/* {detailGridItems.map((item, idx) => (
                                    <View key={idx} style={dynamicStyles.detailGridItem}>
                                        <Text style={dynamicStyles.detailLabel}>{item.label}</Text>
                                        <Text style={dynamicStyles.detailValue}>{item.value}</Text>
                                    </View>
                                ))} */}
                        </View>
                    )}
                </View>
                {job.job_description && job.job_description.map((section: any, idx: number) => {
                    if (!section.data) return null;
                    return (
                        <View key={idx} style={dynamicStyles.sectionContainer}>
                            <Text style={dynamicStyles.sectionTitle}>{section.title}</Text>
                            {typeof section.data === "string" && (
                                <AutoHeightWebView html={section.data} margin={0} />
                            )}
                            {typeof section.data === "object" && Array.isArray(section.data) && (
                                <AutoHeightWebView
                                    html={`<ul>${section.data.map((i: any) => `<li style="text-transform: capitalize;">${i?.skill || ""}</li>`).join("")}</ul>`}
                                    margin={0}
                                />
                            )}
                        </View>
                    );
                })}

                {job.company_info?.description && (
                    <View style={dynamicStyles.sectionContainer}>
                        <Text style={dynamicStyles.sectionTitle}>About {job.company_info.name}</Text>
                        <AutoHeightWebView html={job.company_info.description} margin={0} />
                    </View>
                )}
            </>
        );
    };

    return (
        <NavigationBar navigationBar={false} name={routes.HOME}>
            <View style={dynamicStyles.container}>
                <View style={dynamicStyles.headerBar}>
                    <TouchableOpacity
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                if (role === "recruiter") {
                                    (navigation as any).replace(routes.RECRUITERHOME);
                                } else {
                                    (navigation as any).replace(routes.HOME);
                                }
                            }
                        }}
                    >
                        <Image source={imagePath.leftAngle} style={{ resizeMode: 'contain', }} />
                    </TouchableOpacity>
                    {job && !loading && (
                        <TouchableOpacity
                            style={{ width: responsiveScreenFontSize(2.2), height: responsiveScreenFontSize(2.2), }}
                            onPress={() => shareJobPost(job)}
                        >
                            <Image source={imagePath.Shear} style={{ width: "100%", height: "100%", resizeMode: 'contain' }} />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={dynamicStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {renderContent()}
                </ScrollView>

                {job && !loading && (
                    <View style={dynamicStyles.bottomBar}>
                        {user?.id && (
                            <TouchableOpacity
                                style={dynamicStyles.bookmarkBtn}
                                onPress={handleBookmark}
                            >
                                <Image
                                    source={isBookmarked ? imagePath.Bookmarked : imagePath.Bookmark}
                                    style={{ width: "100%", height: "100%", resizeMode: 'contain' }}
                                />
                            </TouchableOpacity>
                        )}

                        {job.expired ? (
                            <View style={dynamicStyles.applyBtnExpired}>
                                <Text style={dynamicStyles.applyBtnTextExpired}>Expired</Text>
                            </View>
                        ) : job.is_applied || isApplied ? (
                            <View style={dynamicStyles.applyBtnDisabled}>
                                <Text style={dynamicStyles.applyBtnText}>Applied</Text>
                            </View>
                        ) : (
                            <View style={{ flex: 1 }}>
                                <Button label="Apply now" style={{ aspectRatio: 286 / 52, width: "100%" }} onPress={() => {
                                    user?.id
                                        ? navigation.navigate(routes.APPLY, { id: job.id })
                                        : navigation.navigate(routes.LOGIN);
                                }} />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </NavigationBar>
    )
}


export function AutoHeightWebView({ html, margin = 10 }: { html: string, margin?: number }) {
    const [height, setHeight] = useState(50);
    const { colors } = useContext(ThemeContext);
    const wrapped = useMemo(() => {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
    @font-face {
      font-family: '${Fonts.GilroyRegular}';
      ${Platform.OS === 'ios'
                ? `src: local('Gilroy-Regular.ttf'), url('Gilroy-Regular.ttf') format('truetype');`
                : `src: url('file:///android_asset/fonts/${Fonts.GilroyRegular}.ttf') format('truetype');`}
      font-weight: 400;
    }
    @font-face {
      font-family: '${Fonts.GilroyMedium}';
      /* FIXED: Changed // to proper CSS comment syntax */
      /* src: url('${Platform.OS === 'ios' ? `file://${RNFS.MainBundlePath}/Gilroy-Medium.ttf` : 'file:///android_asset/fonts/Gilroy-Medium.ttf'}') format('truetype'); */
      ${Platform.OS === 'ios'
                ? `src: local('Gilroy-Medium.ttf'), url('Gilroy-Medium.ttf') format('truetype');`
                : `src: url('file:///android_asset/fonts/Gilroy-Medium.ttf') format('truetype');`}
      font-weight: 500;
    }   
    @font-face {
      font-family: '${Fonts.GilroyBold}';
      ${Platform.OS === 'ios'
                ? `src: local('Gilroy-Bold.ttf'), url('Gilroy-Bold.ttf') format('truetype');`
                : `src: url('file:///android_asset/fonts/${Fonts.GilroyBold}.ttf') format('truetype');`}
      font-weight: 700;
    }
    :root {
      --text: ${colors.textSecondary};
      --primary: ${colors.primary};
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0 ${margin}px;
      padding: 0;
      font-family: '${Fonts.GilroyRegular}', 'Gilroy-Regular.ttf';
      line-height: 1.6;
      color: var(--text);
      padding-bottom:10px;
      background: transparent;
      word-break: break-word;
    }

    h1 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 5.6vw; margin: 12px 0 6px; }
    h2 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 5.2vw; margin: 12px 0 6px; }
    h3 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 4.8vw; margin: 12px 0 6px; }
    h4 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 4.4vw; margin: 10px 0 4px; }
    h5 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 4.2vw; margin: 8px 0 4px; }
    h6 { font-family: '${Fonts.GilroyBold}', sans-serif;color:black; font-weight: 700; font-size: 4.0vw; margin: 8px 0 4px; }

    p, span, div, li {
    //   font-family: '${Fonts.GilroyRegular}';
      font-family: '${Fonts.GilroyRegular}', sans-serif;
    // font-family: 'Gilroy-Regular';
      font-size:  ${4.2}vw;
      color: var(--text);
    }

    strong, b {
      font-family: '${Fonts.GilroyBold}', sans-serif;
      font-weight: 700;
    }

    a { color: var(--primary); text-decoration: none; }
    img { max-width: 100%; height: auto; border-radius: 10px; margin: 8px 0; }

    ul, ol { padding-left: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td, th { border: 1px solid rgba(0,0,0,0.15); padding: 8px; }
  </style>
</head>

<body>
  ${html}
</body>

<script>
  function updateHeight() {
    //var h =  document.body.scrollHeight;
    var h = Math.ceil(document.body.getBoundingClientRect().height);
    window.ReactNativeWebView.postMessage(String(h));
  }
  window.onload = function(){ setTimeout(updateHeight, 50); };
  setInterval(updateHeight, 300);
</script>
</html>
`   }, [html, margin, colors.textSecondary, colors.primary])
    const source = useMemo(() => ({ html: wrapped }), [wrapped]);
    return (
        <WebView
            source={source}
            onMessage={(e) => setHeight(Number(e.nativeEvent.data) || 50)}
            style={{ width: "100%", height, backgroundColor: "transparent" }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
        />
    );
}

export default Jobdetail