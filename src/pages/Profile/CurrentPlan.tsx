import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NavigationBar from '../../recruiter/components/NavigationBar';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';
import { CompanyActivePackages } from '../../reducer/recruiterReducer';

const CurrentPlan = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.userStore);
    const [activePackageData, setActivePackageData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchActivePackages = async () => {
            try {
                setLoading(true);
                const res: any = await dispatch(CompanyActivePackages()).unwrap();
                if (res && (res.success || res.status)) {
                    const pkgs = res.data?.packages || res.data || res;
                    setActivePackageData(Array.isArray(pkgs) ? pkgs : (pkgs ? [pkgs] : []));
                }
            } catch (error) {
                console.log('Error fetching active packages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivePackages();
    }, [dispatch]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = String(dateStr).split(' ')[0].split('-');
        if (parts.length === 3) {
            const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${parseInt(parts[0], 10)} ${months[date.getMonth()]} ${parts[2]}`;
        }
        return String(dateStr).split(' ')[0];
    };

    const totalJobPostings = activePackageData.reduce((acc, curr) => acc + (curr?.job_quota || 0), 0);
    // Assuming '1' used for visual if no 'used_quota' is provided by backend
    const totalUsedPostings = 1;

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
                        <Text style={styles.pageTitle}>Current plans</Text>
                        <Text style={styles.pageSubtitle}>What you have and what is left.</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#1858A6" style={{ marginVertical: responsiveHeight(4) }} />
                    ) : (
                        <>
                            {activePackageData.map((pkg, index) => {
                                const planName = pkg?.package_title;
                                const isActive = pkg?.status === 'active' || true;
                                const price = pkg?.package_price;

                                const boughtDate = pkg?.start_date ? formatDate(pkg.start_date) : '14 Aug 2026';
                                const daysSinceBought = 32;

                                const jobPostings = pkg?.job_quota ?? pkg?.job_postings_left ?? pkg?.remaining_postings ?? user?.job_postings_left ?? 2;
                                const usedPostings = index === 0 ? 1 : 0; // Visual demo based on image (Gold: 1 used, Diamond: 0 used)

                                const expiryDate = pkg?.end_date
                                const daysLeft = pkg?.days_remaining;
                                return (
                                    <View key={index} style={styles.planCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.titleRow}>
                                                <Text style={styles.planTitle}>{planName}</Text>
                                                {isActive && (
                                                    <View style={styles.activeBadge}>
                                                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.priceText}>AUD {price}</Text>
                                        </View>
                                        <Text style={styles.boughtText}>
                                            Bought {boughtDate} · {daysSinceBought} days
                                        </Text>

                                        <View style={styles.progressSection}>
                                            <View style={styles.progressHeader}>
                                                <Text style={styles.progressTitle}>Job postings</Text>
                                                <Text style={styles.progressText}>{usedPostings} of {jobPostings} used</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${jobPostings > 0 ? Math.min((usedPostings / jobPostings) * 100, 100) : 0}%` }]} />
                                            </View>
                                            <Text style={styles.expiresText}>Expires {expiryDate} · {daysLeft} days left</Text>
                                        </View>

                                        {/* <View style={styles.benefitsSection}>
                                        <View style={styles.benefitsHeader}>
                                            <Text style={styles.benefitsTitle}>Benefits</Text>
                                            <Image source={imagePath.DownAngle} style={[styles.chevronIcon, { transform: [{ rotate: '180deg' }] }]} />
                                        </View>
                                        <View style={styles.benefitsList}>
                                            {benefits.map((feature, idx) => (
                                                <View key={idx} style={styles.benefitItem}>
                                                    <Image source={imagePath.Check2} style={styles.checkIcon} />
                                                    <Text style={styles.benefitText}>{feature}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View> */}
                                    </View>
                                );
                            })}

                            {activePackageData.length > 0 && (
                                <Text style={styles.totalPostingsText}>
                                    {totalUsedPostings} of {totalJobPostings} postings left across {activePackageData.length === 1 ? 'this plan' : 'both plans'}.
                                </Text>
                            )}

                            <View style={styles.warningCard}>
                                <View style={styles.warningIconContainer}>
                                    <Text style={styles.warningIconText}>!</Text>
                                </View>
                                <View style={styles.warningTextContainer}>
                                    <Text style={styles.warningTitle}>Live jobs close when a plan expires</Text>
                                    <Text style={styles.warningSubtitle}>Renew before 15 Sep to keep them running.</Text>
                                </View>
                            </View>

                            <View style={styles.actionContainer}>
                                <Button
                                    label="Buy more postings"
                                    onPress={() => navigation.navigate(routes.RECRUITERHOME)}
                                    style={styles.buyButton}
                                />
                                <Pressable onPress={() => navigation.navigate(routes.PAYMENTHISTORY)} style={styles.historyBtn}>
                                    <Text style={styles.historyBtnText}>See payment history</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </ScrollView>
            </>

        </NavigationBar >
    );
};

export default CurrentPlan;

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
    backButton: {
        padding: 5,
        marginLeft: -5,
        alignSelf: 'flex-start',
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#0B2347',
    },
    titleContainer: {
        marginBottom: responsiveHeight(3),
    },
    pageTitle: {
        fontSize: responsiveFontSize(3.2),
        fontWeight: '800',
        color: '#0B2347',
        marginTop: 5,
    },
    pageSubtitle: {
        fontSize: responsiveFontSize(1.8),
        color: '#8A94A6',
        marginTop: 5,
        fontWeight: '500',
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#1858A6',
        padding: responsiveWidth(4.5),
        marginBottom: responsiveHeight(2.5),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planTitle: {
        fontSize: responsiveFontSize(2.4),
        fontWeight: '800',
        color: '#0B2347',
    },
    activeBadge: {
        backgroundColor: '#E6F0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginLeft: 10,
    },
    activeBadgeText: {
        color: '#1858A6',
        fontSize: responsiveFontSize(1.2),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    priceText: {
        fontSize: responsiveFontSize(2.1),
        fontWeight: '800',
        color: '#0B2347',
    },
    boughtText: {
        fontSize: responsiveFontSize(1.5),
        color: '#8A94A6',
        marginTop: 4,
        fontWeight: '500',
    },
    progressSection: {
        marginTop: responsiveHeight(2.5),
        paddingBottom: responsiveHeight(2.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: responsiveFontSize(1.7),
        fontWeight: '700',
        color: '#0B2347',
    },
    progressText: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '700',
        color: '#4B5563',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1858A6',
        borderRadius: 4,
    },
    expiresText: {
        fontSize: responsiveFontSize(1.5),
        color: '#8A94A6',
        fontWeight: '500',
    },
    benefitsSection: {
        marginTop: responsiveHeight(2),
    },
    benefitsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(1.5),
    },
    benefitsTitle: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '800',
        color: '#0B2347',
    },
    chevronIcon: {
        width: 14,
        height: 14,
        tintColor: '#1858A6',
    },
    benefitsList: {
        gap: responsiveHeight(1.2),
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: '#1858A6',
        marginRight: 10,
    },
    benefitText: {
        fontSize: responsiveFontSize(1.6),
        color: '#4B5563',
        fontWeight: '500',
    },
    totalPostingsText: {
        fontSize: responsiveFontSize(1.7),
        fontWeight: '800',
        color: '#059669', // Green
        marginBottom: responsiveHeight(3),
    },
    warningCard: {
        backgroundColor: '#FFF8EB',
        borderRadius: 12,
        padding: responsiveWidth(4),
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: responsiveHeight(3),
    },
    warningIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D97706',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    warningIconText: {
        color: '#D97706',
        fontWeight: '800',
        fontSize: 14,
    },
    warningTextContainer: {
        flex: 1,
    },
    warningTitle: {
        fontSize: responsiveFontSize(1.7),
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    warningSubtitle: {
        fontSize: responsiveFontSize(1.5),
        color: '#6B7280',
        fontWeight: '500',
    },
    actionContainer: {
        alignItems: 'center',
        paddingBottom: responsiveHeight(2),
    },
    buyButton: {
        backgroundColor: '#1858A6',
        width: '100%',
        borderRadius: 12,
        paddingVertical: responsiveHeight(1.8),
        marginBottom: responsiveHeight(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyButtonText: {
        fontWeight: '700',
        fontSize: responsiveFontSize(1.8),
        color: '#FFFFFF'
    },
    historyBtn: {
        paddingVertical: 10,
    },
    historyBtnText: {
        fontSize: responsiveFontSize(1.7),
        fontWeight: '800',
        color: '#1858A6',
    },
});
