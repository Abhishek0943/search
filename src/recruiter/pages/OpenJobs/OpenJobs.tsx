import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { ThemeContext } from '../../../context/ThemeProvider'
import { responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { useAppDispatch } from '../../../store'
import { deleteJob, GetJobByStatus } from '../../../reducer/jobsReducer'
import imagePath from '../../../assets/imagePath'
import { formatSalaryRange } from '../../../utils'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../../constants/values'
import Text from '../../../components/Text'
import { useAlert } from '../../../context/AlertContext'
import { RecruiterProfile } from '../../../reducer/recruiterReducer'

// ─── Status badge color config ───────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    active: { color: '#3B82F6', label: 'LIVE' },
    live: { color: '#3B82F6', label: 'LIVE' },
    draft: { color: '#F59E0B', label: 'DRAFT' },
    closed: { color: '#374151', label: 'CLOSED' },
    expired: { color: '#374151', label: 'CLOSED' },
}

// ─── Application progress bar component ──────────────────────
const ApplicationProgressBar = ({ count }: { count: number }) => {
    const barColors = ['#3B82F6', '#2563EB', '#F59E0B', '#D4D4D4']
    const segments = Math.min(count, 4)
    return (
        <View style={styles.progressContainer}>
            {barColors.map((color, i) => (
                <View
                    key={i}
                    style={[
                        styles.progressSegment,
                        {
                            backgroundColor: i < segments ? color : '#E5E7EB',
                            flex: i < segments ? (i === 2 ? 2 : 1) : 0.5,
                        },
                    ]}
                />
            ))}
        </View>
    )
}

// ─── Tab definitions ─────────────────────────────────────────
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Live' },
    { key: 'draft', label: 'Draft' },
    { key: 'expired', label: 'Closed' },
]

export default function OpenJobs() {
    const { colors } = useContext(ThemeContext)
    const [page, setPage] = useState('all')
    const dispatch = useAppDispatch()
    const [job, setJob] = useState<any>({})
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const [loading, setLoading] = useState(true)
    const { showConfirm } = useAlert()

    useFocusEffect(
        useCallback(() => {
            setJob({ ...job, jobs: [] })
            setLoading(true)
            dispatch(GetJobByStatus())
                .unwrap()
                .then((res) => {
                    console.log(res, 'dfjsdfjshdkf')
                    if (res.success && 'data' in res) {
                        setJob(res?.data)
                    }
                    setLoading(false)
                })
        }, [page])
    )

    const getTabCount = (key: string) => {
        if (key === 'all') return job?.all_jobs_count || job?.active_jobs_count || 0
        if (key === 'active') return job?.active_jobs_count || 0
        if (key === 'draft') return job?.draft_jobs_count || 0
        if (key === 'expired') return job?.expired_jobs_count || 0
        return 0
    }

    const getStatusConfig = (item: any) => {
        const status = item?.status?.toLowerCase() || page
        return STATUS_CONFIG[status] || STATUS_CONFIG.active
    }

    const getSubtitle = (item: any) => {
        const parts: string[] = []
        if (item?.jobType) parts.push(item.jobType)
        if (item?.salary) parts.push(`${item.salary_currency || ''}${formatSalaryRange(item.salary)}/${item?.salary_period?.salary_period || 'hr'}`)
        if (item?.posted_at) parts.push(getTimeAgo(item.posted_at))
        else if (item?.jobLocation) parts.push(item.jobLocation)
        return parts.join(' · ')
    }

    const handleDelete = async (item: any) => {
        const ok = await showConfirm({
            title: 'Delete',
            message: 'Are you sure you want to delete this Job?',
            okText: 'Delete',
            cancelText: 'Cancel',
        })
        if (ok) {
            dispatch(deleteJob({ id: item.id }))
                .unwrap()
                .then((res) => {
                    res.success &&
                        dispatch(GetJobByStatus({ status: page }))
                            .unwrap()
                            .then((res) => {
                                if (res.success && 'data' in res) {
                                    setJob(res?.data)
                                }
                                dispatch(RecruiterProfile())
                            })
                })
        }
    }

    return (
        <NavigationBar navigationBar={false}>
            <View style={styles.pageContainer}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: responsiveScreenHeight(4) }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ─── Header ─────────────────────────────── */}
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Image style={{ height: '100%', width: '100%' }} source={imagePath.leftAngle} />
                        </Pressable>
                    </View>
                    <View style={styles.headerTitleRow}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Jobs</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate(routes.ADDJOB)}
                            style={[styles.postJobButton, { backgroundColor: colors.primary }]}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.postJobPlus}>+</Text>
                            <Text style={styles.postJobText}>Post a job</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ─── Tabs ───────────────────────────────── */}
                    <View style={styles.tabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                            {TABS.map((tab) => {
                                const isActive = page === tab.key
                                const count = getTabCount(tab.key)
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        activeOpacity={0.7}
                                        onPress={() => setPage(tab.key)}
                                        style={[
                                            styles.tab,
                                            isActive
                                                ? { backgroundColor: colors.primary }
                                                : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1 },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabLabel,
                                                { color: isActive ? '#FFFFFF' : '#6B7280' },
                                            ]}
                                        >
                                            {tab.label}{count > 0 ? ` ${count}` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {loading ? (
                        <ActivityIndicator
                            size={responsiveScreenFontSize(3)}
                            color={colors.primary}
                            style={{ marginTop: responsiveScreenHeight(30) }}
                        />
                    ) : (
                        <FlatList
                            scrollEnabled={false}
                            ListEmptyComponent={() => <EmptyComp />}
                            data={job?.jobs}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => {
                                const statusCfg = getStatusConfig(item)
                                const subtitle = getSubtitle(item)

                                return (
                                    <Pressable
                                        onPress={() => navigation.navigate(routes.ADDJOB, { ...item })}
                                        style={({ pressed }) => [
                                            styles.card,
                                            pressed && { opacity: 0.95 },
                                        ]}
                                    >
                                        <View style={styles.cardTopRow}>
                                            <View style={styles.cardInfo}>
                                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.cardSubtitle} numberOfLines={1}>
                                                    sdfads {subtitle}
                                                </Text>
                                            </View>
                                            <View style={styles.statusBadge}>
                                                <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                                                <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
                                                    dfasfdasfdasdf {statusCfg.label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* {item.candidates_count > 0 && ( */}
                                        <View style={styles.candidateSection}>
                                            <View style={styles.candidateTopRow}>
                                                <Text style={styles.candidateCount}>
                                                    {item.candidates_count} application{item.candidates_count !== 1 ? 's' : ''}
                                                </Text>
                                                <Pressable
                                                    onPress={() => navigation.navigate(routes.ACTIVECANDIDATE, { jobId: item?.id })}
                                                    hitSlop={8}
                                                >
                                                    <Image source={imagePath.rightAngle} style={styles.chevronIcon} />
                                                </Pressable>
                                            </View>
                                            <ApplicationProgressBar count={item.candidates_count} />
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate(routes.ACTIVECANDIDATE, { jobId: item?.id })}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.viewCandidates, { color: colors.primary }]}>
                                                    View candidates
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* )} */}
                                        {/*  */}
                                        {/* No candidates — show chevron for navigation */}
                                        {(!item.candidates_count || item.candidates_count === 0) && (
                                            <View style={styles.noAppRow}>
                                                <Text style={styles.cardSubtitle}>
                                                    {item?.status === 'draft' ? 'Not published yet' : ''}
                                                </Text>
                                                <Image source={imagePath.rightAngle} style={styles.chevronIcon} />
                                            </View>
                                        )}

                                        {/* Swipe actions (hidden — long press to show) */}
                                        <View style={styles.cardActions}>
                                            <Pressable
                                                onPress={() => navigation.navigate(routes.ADDJOB, { ...item })}
                                                hitSlop={8}
                                                style={styles.actionBtn}
                                            >
                                                <Image source={imagePath.edit} style={styles.actionIcon} />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(item)}
                                                hitSlop={8}
                                                style={styles.actionBtn}
                                            >
                                                <Image source={imagePath.delete} style={styles.actionIcon} />
                                            </Pressable>
                                        </View>
                                    </Pressable>
                                )
                            }}
                        />
                    )}
                </ScrollView>
            </View>
        </NavigationBar>
    )
}

// ─── Helper: relative time ───────────────────────────────────
const getTimeAgo = (isoDate: string) => {
    const now = new Date()
    const date = new Date(isoDate)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(isoDate)
}

const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    })
}

// ─── Empty component ─────────────────────────────────────────
export const EmptyComp = ({
    bottom,
    heading = 'No results found',
    text = 'Content will appear once it becomes available',
}: {
    bottom?: () => React.JSX.Element
    heading?: string
    text?: string
}) => {
    const { colors } = useContext(ThemeContext)
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyHeading}>{heading}</Text>
            <Text style={[styles.emptyText, { color: colors.darkGrayNatural }]}>{text}</Text>
            {bottom && bottom()}
        </View>
    )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header
    headerRow: {
        paddingHorizontal: responsiveScreenWidth(5),
        paddingTop: responsiveScreenHeight(1),
    },
    backButton: {
        width: responsiveScreenWidth(2.8),
        aspectRatio: 1 / 2,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: responsiveScreenWidth(5),
        marginTop: responsiveScreenHeight(1.5),
        marginBottom: responsiveScreenHeight(2),
    },
    headerTitle: {
        fontSize: responsiveScreenFontSize(3.4),
        fontWeight: '800',
    },
    postJobButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: responsiveScreenWidth(4),
        paddingVertical: responsiveScreenHeight(1.2),
        borderRadius: 24,
        gap: responsiveScreenWidth(1),
    },
    postJobPlus: {
        color: '#FFFFFF',
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: '700',
        marginTop: -1,
    },
    postJobText: {
        color: '#FFFFFF',
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '600',
    },

    // Tabs
    tabsContainer: {
        marginBottom: responsiveScreenHeight(2),
    },
    tabsScroll: {
        paddingHorizontal: responsiveScreenWidth(5),
        gap: responsiveScreenWidth(2.5),
    },
    tab: {
        paddingHorizontal: responsiveScreenWidth(5),
        paddingVertical: responsiveScreenHeight(1),
        borderRadius: 20,
    },
    tabLabel: {
        fontSize: responsiveScreenFontSize(1.7),
        fontWeight: '600',
    },

    // Cards list
    listContent: {
        paddingHorizontal: responsiveScreenWidth(5),
        gap: responsiveScreenHeight(1.5),
    },

    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: responsiveScreenWidth(4.5),
        paddingVertical: responsiveScreenHeight(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardInfo: {
        flex: 1,
        marginRight: responsiveScreenWidth(3),
    },
    cardTitle: {
        fontSize: responsiveScreenFontSize(2),
        fontWeight: '700',
        marginBottom: responsiveScreenHeight(0.4),
    },
    cardSubtitle: {
        fontSize: responsiveScreenFontSize(1.6),
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // Status badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveScreenWidth(1.2),
        marginTop: responsiveScreenHeight(0.3),
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: responsiveScreenFontSize(1.5),
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Candidates section
    candidateSection: {
        marginTop: responsiveScreenHeight(1.5),
        paddingTop: responsiveScreenHeight(1.5),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    candidateTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveScreenHeight(1),
    },
    candidateCount: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '700',
        color: '#1F2937',
    },
    viewCandidates: {
        fontSize: responsiveScreenFontSize(1.6),
        fontWeight: '600',
        marginTop: responsiveScreenHeight(1),
    },

    // Progress bar
    progressContainer: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        gap: 3,
    },
    progressSegment: {
        height: '100%',
        borderRadius: 4,
    },

    // Chevron
    chevronIcon: {
        width: responsiveScreenWidth(2),
        height: responsiveScreenWidth(3.5),
        resizeMode: 'contain',
        tintColor: '#D1D5DB',
    },

    // No-app row
    noAppRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: responsiveScreenHeight(1),
    },

    // Card actions
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: responsiveScreenWidth(3),
        marginTop: responsiveScreenHeight(1.5),
        paddingTop: responsiveScreenHeight(1),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionBtn: {
        padding: responsiveScreenWidth(1.5),
    },
    actionIcon: {
        height: responsiveScreenHeight(2.2),
        width: responsiveScreenHeight(2.2),
        resizeMode: 'contain',
    },

    // Empty
    emptyContainer: {
        marginHorizontal: 'auto',
        width: responsiveScreenWidth(90),
        height: responsiveScreenHeight(50),
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyHeading: {
        fontSize: responsiveScreenFontSize(2.7),
        fontWeight: '700',
        marginBottom: responsiveHeight(0.4),
    },
    emptyText: {
        fontSize: responsiveScreenFontSize(1.8),
        lineHeight: responsiveHeight(2),
        width: '100%',
        textAlign: 'center',
        fontWeight: '600',
    },
})