import React, { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { NavigationBar } from '../../components';
import {
    responsiveFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Bookmark, GetBookmarkJobs, toggleBookmark } from '../../reducer/jobsReducer';
import Text from '../../components/Text';
import imagePath from '../../assets/imagePath';
import { formatSalaryRange } from '../../utils';
import { routes } from '../../constants/values';

const AVATAR_COLORS = ['#2563EB', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0891B2'];

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
};

const getClosingText = (expiredAt?: string | null): { text: string; color: string } | null => {
    if (!expiredAt) return null;
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Closed', color: '#9CA3AF' };
    if (diffDays === 0) return { text: 'Closes today', color: '#DC2626' };
    if (diffDays === 1) return { text: 'Closes tomorrow', color: '#DC2626' };
    return { text: `Closes in ${diffDays} days`, color: '#D97706' };
};

const Bookmarked = () => {
    const { colors } = useContext(ThemeContext);
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const dispatch = useAppDispatch();
    const { bookmarkedJobIds } = useAppSelector(state => state.jobsReducer);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const loadBookmarks = async () => {
        try {
            const res: any = await dispatch(GetBookmarkJobs()).unwrap();
            console.log('ressssssssssssss', res)
            if (res?.success) {
                setJobs(res.data?.jobs || res.data || []);
            }
        } catch { }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadBookmarks();
        }, [])
    );

    const closingSoonCount = jobs.filter(j => {
        if (!j.expiredAt) return false;
        const diff = Math.ceil((new Date(j.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    }).length;

    const handleToggleBookmark = async (job: any) => {
        const isBookmarked = bookmarkedJobIds[job.id] ?? job.is_favorited;
        dispatch(toggleBookmark({ id: job.id, is_favorited: isBookmarked }));
        try {
            await dispatch(Bookmark({ id: job.id })).unwrap();
            if (isBookmarked) {
                setJobs(prev => prev.filter(j => j.id !== job.id));
            }
        } catch {
            dispatch(toggleBookmark({ id: job.id, is_favorited: !isBookmarked }));
        }
    };
    return (
        <NavigationBar name={routes.BOOKMARKED}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: responsiveScreenWidth(5),
                    paddingBottom: responsiveScreenHeight(4),
                }}
            >
                <View style={{ marginTop: responsiveScreenHeight(2), marginBottom: responsiveScreenHeight(2) }}>
                    <Text style={{
                        fontSize: responsiveFontSize(3),
                        fontWeight: '800',
                        color: colors.textPrimary,
                    }}>
                        Saved jobs
                    </Text>
                    {!loading && (
                        <Text style={{
                            fontSize: responsiveFontSize(1.7),
                            color: colors.textSecondary,
                            marginTop: 4,
                            fontWeight: '500',
                        }}>
                            {jobs.length} saved{closingSoonCount > 0 ? ` · ${closingSoonCount} closing soon` : ''}
                        </Text>
                    )}
                </View>

                {loading ? (
                    <View style={{ marginTop: responsiveScreenHeight(20), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : jobs.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: responsiveScreenHeight(15) }}>
                        <Image
                            source={imagePath.Bookmark}
                            style={{ width: responsiveWidth(16), height: responsiveWidth(16), resizeMode: 'contain', opacity: 0.3, marginBottom: responsiveScreenHeight(2) }}
                        />
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.textPrimary }}>No saved jobs yet</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.7), color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
                            Tap the bookmark on any job to save it here.
                        </Text>
                        <Pressable
                            onPress={() => navigation.navigate(routes.HOME)}
                            style={{
                                marginTop: responsiveScreenHeight(3),
                                backgroundColor: colors.primary,
                                borderRadius: 14,
                                paddingVertical: responsiveScreenHeight(1.5),
                                paddingHorizontal: responsiveScreenWidth(8),
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: responsiveFontSize(1.8) }}>Browse jobs</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {jobs.map((job: any, index: number) => {
                            const companyName = job?.company_info?.name || '';
                            const initials = getInitials(companyName);
                            const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            const isBookmarked = bookmarkedJobIds[job.id] ?? job.is_favorited;
                            const closing = getClosingText(job?.expiredAt);

                            return (
                                <Pressable
                                    key={job.id || index}
                                    onPress={() => navigation.navigate(routes.JOBDETAIL, { id: job.id })}
                                    style={{
                                        backgroundColor: colors.white,
                                        borderRadius: 20,
                                        padding: responsiveScreenWidth(4),
                                        marginBottom: responsiveScreenHeight(1.2),
                                        borderWidth: 1,
                                        borderColor: colors.gray,
                                    }}
                                >
                                    {/* Company row */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveScreenHeight(1) }}>
                                        {job?.company_info?.image ? (
                                            <View style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.gray, marginRight: responsiveScreenWidth(3) }}>
                                                <Image source={{ uri: job.company_info.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                            </View>
                                        ) : (
                                            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: avatarBg, alignItems: 'center', justifyContent: 'center', marginRight: responsiveScreenWidth(3) }}>
                                                <Text style={{ color: '#fff', fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>{initials}</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text numberOfLines={1} style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.primary2 }}>{companyName}</Text>
                                            {job?.jobLocation && (
                                                <Text numberOfLines={1} style={{ fontSize: responsiveFontSize(1.5), color: colors.textSecondary, marginTop: 2 }}>{job.jobLocation}</Text>
                                            )}
                                        </View>
                                        {/* Bookmark toggle */}
                                        <TouchableOpacity
                                            onPress={() => handleToggleBookmark(job)}
                                            style={{ width: responsiveWidth(5.5), aspectRatio: 1 }}
                                        >
                                            <Image
                                                source={isBookmarked ? imagePath.Bookmarked : imagePath.Bookmark}
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Job title */}
                                    <Text numberOfLines={1} style={{
                                        fontSize: responsiveFontSize(2.2),
                                        fontWeight: '800',
                                        color: colors.textPrimary,
                                        marginBottom: responsiveScreenHeight(0.6),
                                    }}>
                                        {job?.title}
                                    </Text>

                                    {/* Salary + closing */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {!job?.is_hide_salary && job?.salary && job?.salary_period && (
                                            <Text style={{ fontSize: responsiveFontSize(1.9), fontWeight: '700', color: colors.primary }}>
                                                {job.salary_currency}{formatSalaryRange(job.salary)} / {job.salary_period}
                                                {job?.jobType ? ' · ' + job.jobType : ''}
                                            </Text>
                                        )}
                                        {closing && (
                                            <Text style={{
                                                fontSize: responsiveFontSize(1.9),
                                                fontWeight: '700',
                                                color: closing.color,
                                                marginLeft: 'auto',
                                            }}>
                                                {closing.text}
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}

                        {/* Info banner */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            backgroundColor: '#FEF3C7',
                            borderRadius: 16,
                            padding: responsiveScreenWidth(4),
                            gap: responsiveScreenWidth(3),
                            marginTop: responsiveScreenHeight(1),
                        }}>
                            <Text style={{ fontSize: responsiveFontSize(2.2) }}>⚠️</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#92400E' }}>
                                    Saved jobs still close
                                </Text>
                                <Text style={{ fontSize: responsiveFontSize(1.5), color: '#92400E', marginTop: 3, fontWeight: '500' }}>
                                    We will remind you the day before each one ends.
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </NavigationBar>
    );
};

export default Bookmarked;
