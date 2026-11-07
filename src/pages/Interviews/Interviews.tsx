import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Pressable,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { Header } from '../Company/Company';
import { useAppDispatch } from '../../store';
import { GetJobseekerInterviews } from '../../reducer/jobsReducer';
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs';
import { openBrowser } from '../Resume/Resume';
import imagePath from '../../assets/imagePath';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: '#EFF6FF', text: '#2563EB', label: 'Scheduled' },
    confirmed: { bg: '#ECFDF5', text: '#059669', label: 'Confirmed' },
    completed: { bg: '#F3F4F6', text: '#4B5563', label: 'Completed' },
    cancelled: { bg: '#FEF2F2', text: '#DC2626', label: 'Cancelled' },
    rejected: { bg: '#FEF2F2', text: '#DC2626', label: 'Rejected' },
    pending: { bg: '#FFFBEB', text: '#D97706', label: 'Pending' },
    rescheduled: { bg: '#F5F3FF', text: '#7C3AED', label: 'Rescheduled' },
};

const Interviews = () => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();

    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInterviews = useCallback(async () => {
        try {
            const res: any = await dispatch(GetJobseekerInterviews()).unwrap();
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.data?.interviews)
                    ? res.data.interviews
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : Array.isArray(res?.interviews)
                            ? res.interviews
                            : [];

            setInterviews(list);
        } catch (e) {
            console.log('Error fetching interviews:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInterviews();
    };

    const getStatusStyle = (statusRaw?: string) => {
        const key = (statusRaw || 'scheduled').toLowerCase();
        return STATUS_CONFIG[key] || { bg: '#EFF6FF', text: '#2563EB', label: statusRaw || 'Scheduled' };
    };

    const formatDateTime = (item: any) => {
        const rawDate = item?.interview_date || item?.date || item?.scheduled_at || item?.start_time || item?.created_at;
        const rawTime = item?.interview_time || item?.time;

        if (!rawDate) return rawTime || 'Date to be announced';

        try {
            const dateObj = new Date(rawDate);
            if (isNaN(dateObj.getTime())) {
                return rawTime ? `${rawDate} at ${rawTime}` : String(rawDate);
            }
            const dateStr = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            const timeStr = rawTime
                ? rawTime
                : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            return `${dateStr} · ${timeStr}`;
        } catch {
            return String(rawDate);
        }
    };

    const handleOpenLink = async (url?: string) => {
        if (!url) return;
        try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                openBrowser(url, colors.primary, false);
            } else {
                Linking.openURL(url);
            }
        } catch (e) {
            console.log('Could not open interview URL:', e);
        }
    };

    const renderInterviewCard = ({ item, index }: { item: any; index: number }) => {
        const jobTitle = item?.job_title || item?.job?.title || item?.title || item?.position || 'Job Interview';
        const companyName = item?.company_name || item?.company?.name || item?.company?.company_name || item?.employer_name || '';
        const companyImage = item?.company_logo || item?.company?.logo || item?.company?.image || item?.image;
        const statusCfg = getStatusStyle(item?.status);
        const dateTimeStr = formatDateTime(item);
        const interviewLink = item?.interview_url || item?.meeting_link || item?.link || item?.join_url || item?.zoom_link;
        const locationStr = item?.location || item?.address || item?.venue;
        const typeStr = item?.interview_type || item?.type || item?.mode || (interviewLink ? 'Video Call' : (locationStr ? 'In-Person' : 'Online'));
        const notes = item?.notes || item?.instructions || item?.description || item?.comment;
        const interviewer = item?.interviewer || item?.interviewer_name || item?.contact_person;

        const initials = (companyName || jobTitle)
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return (
            <View
                key={item?.id || index}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.white || '#FFFFFF',
                        borderColor: colors.gray || '#E5E7EB',
                    },
                ]}
            >
                {/* Top Row: Avatar + Title + Status */}
                <View style={styles.topRow}>
                    <View
                        style={[
                            styles.avatarBox,
                            {
                                backgroundColor: colors.primary50 || '#EFF6FF',
                                borderColor: colors.surfaces || '#E5E7EB',
                            },
                        ]}
                    >
                        {companyImage ? (
                            <Image
                                source={{ uri: companyImage }}
                                style={styles.avatarImg}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {initials || 'IN'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.headerInfo}>
                        <Text
                            style={[styles.jobTitle, { color: colors.textPrimary }]}
                            numberOfLines={1}
                        >
                            {jobTitle}
                        </Text>
                        {!!companyName && (
                            <Text
                                style={[styles.companyName, { color: colors.primary2 || colors.textSecondary }]}
                                numberOfLines={1}
                            >
                                {companyName}
                            </Text>
                        )}
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.text }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={[styles.detailsSection, { borderTopColor: colors.gray || '#F3F4F6' }]}>
                    {/* Date & Time */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                            {dateTimeStr}
                        </Text>
                    </View>

                    {/* Mode / Type */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>💼</Text>
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {typeStr}
                        </Text>
                    </View>

                    {/* Location if In-Person */}
                    {!!locationStr && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>📍</Text>
                            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={2}>
                                {locationStr}
                            </Text>
                        </View>
                    )}

                    {/* Interviewer */}
                    {!!interviewer && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>👤</Text>
                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                Interviewer: {interviewer}
                            </Text>
                        </View>
                    )}

                    {/* Notes */}
                    {!!notes && (
                        <View style={[styles.notesBox, { backgroundColor: colors.background || '#F8FAFC' }]}>
                            <Text style={[styles.notesLabel, { color: colors.textPrimary }]}>Notes:</Text>
                            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                                {notes}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action: Join Meeting / View Link Button */}
                {!!interviewLink && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenLink(interviewLink)}
                        style={[styles.joinBtn, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.joinBtnText}>Join Interview / Open Link</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <NavigationBar navigationBar={false}>
            <View style={styles.container}>
                <Header
                    title="My Interviews"
                    subtitle="Track and manage all your scheduled interviews."
                />

                {loading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Loading interviews...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={interviews}
                        keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
                        renderItem={renderInterviewCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                            />
                        }
                        ListEmptyComponent={() => (
                            <EmptyComp
                                heading="No interviews scheduled"
                                text="When an employer invites you to an interview, details will appear here."
                            />
                        )}
                    />
                )}
            </View>
        </NavigationBar>
    );
};

export default Interviews;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: responsiveHeight(15),
    },
    loadingText: {
        marginTop: responsiveHeight(1.5),
        fontSize: responsiveFontSize(1.7),
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingTop: responsiveHeight(1.5),
        paddingBottom: responsiveHeight(5),
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: responsiveWidth(4),
        marginBottom: responsiveHeight(1.8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarBox: {
        width: responsiveWidth(12),
        height: responsiveWidth(12),
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginRight: responsiveWidth(3),
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: responsiveFontSize(2),
        fontWeight: '800',
    },
    headerInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: responsiveFontSize(2),
        fontWeight: '700',
    },
    companyName: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: responsiveWidth(2.5),
        paddingVertical: responsiveHeight(0.4),
        borderRadius: 12,
        marginLeft: responsiveWidth(2),
    },
    statusText: {
        fontSize: responsiveFontSize(1.4),
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    detailsSection: {
        marginTop: responsiveHeight(1.5),
        paddingTop: responsiveHeight(1.2),
        borderTopWidth: 1,
        gap: responsiveHeight(0.8),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(2),
    },
    detailIcon: {
        fontSize: responsiveFontSize(1.8),
    },
    detailText: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '600',
        flex: 1,
    },
    notesBox: {
        borderRadius: 8,
        padding: responsiveWidth(3),
        marginTop: responsiveHeight(0.5),
    },
    notesLabel: {
        fontSize: responsiveFontSize(1.5),
        fontWeight: '700',
        marginBottom: 2,
    },
    notesText: {
        fontSize: responsiveFontSize(1.5),
        lineHeight: responsiveFontSize(2.1),
    },
    joinBtn: {
        marginTop: responsiveHeight(1.8),
        paddingVertical: responsiveHeight(1.4),
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinBtnText: {
        color: '#FFFFFF',
        fontSize: responsiveFontSize(1.7),
        fontWeight: '700',
    },
});

