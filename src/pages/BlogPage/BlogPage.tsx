import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator, Linking, RefreshControl } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { ArticleCard } from '../Blog'
import { useAppDispatch, useAppSelector } from '../../store'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { Header } from '../Company/Company'
import { ThemeContext } from '../../context/ThemeProvider'
import Icon from '../../utils/Icon'
import Button from '../../components/Button'
import Text from '../../components/Text'
import { CreatorRequest, MyBlogs } from '../../reducer/userReducer'
import { DeleteBlog, ProfileData, ProfileData2 } from '../../reducer/jobsReducer'
import { useAlert } from '../../context/AlertContext'
import { RecruiterProfile } from '../../reducer/recruiterReducer'
const BlogPage = () => {
    const route = useRoute<any>()
    const userType = route.params?.user_type || 'user'
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(state => state.userStore)
    console.log(user, "user")
    const { colors } = useContext(ThemeContext)
    const [loading, setLoading] = useState(false)
    const [blogsLoading, setBlogsLoading] = useState(false)
    const [blogIds, setBlogIds] = useState<string[]>([])
    const [blogsById, setBlogsById] = useState<Record<string, BlogItem>>({})
    const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('approved')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [creatorData, setCreatorData] = useState(user?.creator_status)
    useEffect(() => {
        setCreatorData(user?.creator_status)
    }, [user])
    const handleCreatorRequest = async () => {
        setLoading(true)
        try {
            const res = await dispatch(CreatorRequest()).unwrap()
            console.log(res, "res")
            if (res.success) {
                if (userType === 'user') {
                    await dispatch(ProfileData()).unwrap().then((res) => console.log(res, "res"))
                } else {
                    await dispatch(RecruiterProfile()).unwrap().then((res) => console.log(res, "res"))
                }
                Alert.alert("Success", res.message || "Request sent successfully!")
            } else {
                Alert.alert("Error", res.message || "Failed to send request")
            }
        } catch (error: any) {
            Alert.alert("Error", error?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }
    const [allData, setAllData] = useState({})
    useEffect(() => {
        if (creatorData === 'approved') {
            setPage(1)
            fetchMyBlogs({ status: selectedStatus, page: 1 })
        }
    }, [creatorData, selectedStatus])

    const fetchMyBlogs = async ({ status: blogStatus, page: blogPage, isLoadMore = false }: { status: string, page: number, isLoadMore?: boolean }) => {
        setBlogsLoading(true)
        try {
            const res = await dispatch(MyBlogs({ status: blogStatus, page: blogPage })).unwrap()
            if (res.success) {
                const newBlogs = res.data.blogs as BlogItem[]
                const newIds = newBlogs.map(b => b.id)
                const newById = newBlogs.reduce((acc, b) => {
                    acc[b.id] = b
                    return acc
                }, {} as Record<string, BlogItem>)

                setBlogIds(prev => isLoadMore ? [...prev, ...newIds] : newIds)
                setBlogsById(prev => isLoadMore ? { ...prev, ...newById } : newById)
                setAllData(res.data)
                setHasMore(newBlogs.length > 0 && res.data.meta?.current_page < res.data.meta?.last_page)
            }
        } catch (error) {
            console.log("Error fetching blogs:", error)
        } finally {
            setBlogsLoading(false)
        }
    }

    const loadMore = () => {
        if (!blogsLoading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchMyBlogs({ status: selectedStatus, page: nextPage, isLoadMore: true })
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        setPage(1)
        await fetchMyBlogs({ status: selectedStatus, page: 1 })
        setRefreshing(false)
    }

    const renderContent = () => {
        console.log(creatorData, "creatorData")
        switch (creatorData) {
            case 'pending':
                return <PendingCreatorView />
            case 'approved':
                return (
                    <ApprovedCreatorView
                        data={creatorData}
                        blogIds={blogIds}
                        blogsById={blogsById}
                        allData={allData}
                        blogsLoading={blogsLoading}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        onDeleteSuccess={(id) => {
                            console.log(id, blogIds, "id")
                            setBlogIds(prev => prev.filter(blogId => blogId !== id))
                            setAllData((prev: any) => ({
                                ...prev,
                                counts: {
                                    ...prev?.counts,
                                    [selectedStatus]: Math.max(0, (prev?.counts?.[selectedStatus] || 1) - 1)
                                }
                            }))
                        }}
                        userType={userType}
                    />
                )
            case 'rejected':
                return <RejectedCreatorView onApply={handleCreatorRequest} loading={loading} />
            default:
                return <BecomeCreatorView onRequest={handleCreatorRequest} loading={loading} />
        }
    }

    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
            >
                <Header title="Blogs" />
                <View style={{ marginTop: responsiveScreenHeight(2), width: '100%' }}>
                    {renderContent()}
                </View>
            </ScrollView>
        </NavigationBar>
    )
}

const BecomeCreatorView = ({ onRequest, loading }: { onRequest: () => void, loading: boolean }) => {
    const { colors } = useContext(ThemeContext)
    return (
        <View style={[styles.card, { backgroundColor: colors.surfaces }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Become a Creator ✨</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Want to publish blogs and articles? Send a request to admin and start creating!
            </Text>
            <Button
                label="🚀 Send Creator Request"
                isActive={!loading}
                isLoading={loading}
                onPress={onRequest}
                style={styles.actionButton}
            />
        </View>
    )
}

const PendingCreatorView = () => {
    const { colors } = useContext(ThemeContext)
    return (
        <View style={[styles.card, { backgroundColor: colors.surfaces }]}>
            <View style={[styles.badge, { backgroundColor: '#FFC107' }]}>
                <Text style={styles.badgeText}>Pending</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginTop: 15 }]}>
                Your Creator Request is Under Review
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Please wait while our team verifies your request.
            </Text>
        </View>
    )
}

const RejectedCreatorView = ({ onApply, loading }: { onApply: () => void, loading: boolean }) => {
    const { colors } = useContext(ThemeContext)
    return (
        <View style={[styles.card, { backgroundColor: colors.surfaces }]}>
            <View style={[styles.badge, { backgroundColor: '#DC3545' }]}>
                <Text style={styles.badgeText}>Rejected</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginTop: 15 }]}>
                Your Creator Request was Rejected
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Unfortunately, your request to become a creator was not approved at this time.
            </Text>
            <Button
                label="🔄 Apply Again"
                isActive={!loading}
                isLoading={loading}
                onPress={onApply}
                style={styles.actionButton}
            />
        </View>
    )
}

const ApprovedCreatorView = ({ allData, data, blogIds, blogsById, blogsLoading, selectedStatus, onStatusChange, hasMore, onLoadMore, onDeleteSuccess, userType = "user" }:
    { allData: any, data: any, blogIds: string[], blogsById: Record<string, BlogItem>, blogsLoading: boolean, selectedStatus: string, onStatusChange: (s: any) => void, hasMore: boolean, onLoadMore: () => void, onDeleteSuccess: (id: string) => void, userType: string }) => {
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const { showConfirm, showAlert } = useAlert();
    const dispatch = useAppDispatch()
    return (
        <View style={{ width: '100%', }}>
            <View style={styles.statsContainer}>
                <StatCard
                    label="Pending Blogs"
                    count={allData?.counts?.pending || 0}
                    icon={{ type: 'MaterialIcons', name: 'edit' }}
                    iconColor="#FFC107"
                    isActive={selectedStatus === 'pending'}
                    onPress={() => onStatusChange('pending')}
                />
                <StatCard
                    label="Approved Blogs"
                    count={allData?.counts?.approved || 0}
                    icon={{ type: 'Ionicons', name: 'checkmark-circle' }}
                    iconColor="#198754"
                    isActive={selectedStatus === 'approved'}
                    onPress={() => onStatusChange('approved')}
                />
                <StatCard
                    label="Rejected Blogs"
                    count={allData?.counts?.rejected || 0}
                    icon={{ type: 'Ionicons', name: 'close-circle' }}
                    iconColor="#DC3545"
                    isActive={selectedStatus === 'rejected'}
                    onPress={() => onStatusChange('rejected')}
                />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surfaces, marginTop: responsiveScreenHeight(2) }]}>
                <View style={[styles.badge, { backgroundColor: '#198754' }]}>
                    <Text style={styles.badgeText}>Approved</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.textPrimary, marginTop: 15 }]}>
                    Congratulations! 🥳
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    You are now a Creator. Start writing blogs and articles.
                </Text>
                <Button
                    label="✍️ Create Blog"
                    isActive={true}
                    onPress={() => {
                        Linking.openURL(`https://searchtalents.co/blog-create-by-creator?user_type=${userType}&user_id=${user?.id}`)
                    }}
                    style={styles.actionButton}
                />
            </View>
            <View style={{ marginTop: responsiveScreenHeight(3), width: '100%' }}>
                <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15 }}>
                    My Blogs 📚
                </Text>
                {blogsLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : blogIds.length > 0 ? (
                    blogIds.map((id) => (
                        <ArticleCard
                            key={id}
                            post={blogsById[id]}
                            onEdit={(post) => {
                                Linking.openURL(`https://searchtalents.co/blog-edit-by-creator/${post.slug}?user_type=${userType}&user_id=${user?.id}`)
                            }}
                            onDelete={async (post) => {
                                const a = await showConfirm({
                                    title: "Delete this Blog",
                                    message: "Are you sure you want to delete this Blog?",
                                    okText: "Delete",
                                    cancelText: "Cancel",
                                    waitForOk: true,
                                    onOkPress: async () => {
                                        const res = await dispatch(DeleteBlog({ slug: post.slug })).unwrap();
                                        if (res.success) {
                                            onDeleteSuccess(post.id)
                                        }
                                        return res.success;
                                    },

                                })
                                if (a) {
                                    showAlert({
                                        title: "Blog Deleted",
                                        message: "Blog deleted successfully",

                                    })

                                }
                            }}
                        />
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
                        No blogs found for this status.
                    </Text>
                )}

                {hasMore && !blogsLoading && (
                    <TouchableOpacity onPress={onLoadMore} style={styles.loadMoreButton}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Load More</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const StatCard = ({ label, count, icon, iconColor, isActive, onPress }:
    { label: string, count: number, icon: any, iconColor: string, isActive?: boolean, onPress?: () => void }) => {
    const { colors } = useContext(ThemeContext)
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.statCard,
                { backgroundColor: colors.surfaces },
                isActive && { borderColor: iconColor, borderWidth: 1.5, shadowColor: iconColor, shadowOpacity: 0.2 }
            ]}
        >
            <Icon icon={icon} size={28} style={{ color: iconColor }} />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{count}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    )
}

export default BlogPage

const styles = StyleSheet.create({
    card: {
        width: '100%',
        padding: responsiveScreenWidth(5),
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardTitle: {
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: responsiveScreenFontSize(1.8),
        textAlign: 'center',
        marginTop: responsiveScreenHeight(2),
        lineHeight: 22,
    },
    actionButton: {
        marginTop: responsiveScreenHeight(2),
        width: '100%',
        backgroundColor: '#0056D2',
    },
    badge: {
        paddingHorizontal: responsiveScreenWidth(3),
        paddingVertical: responsiveScreenHeight(1),
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: responsiveScreenFontSize(1.4),
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statCard: {
        width: '31%',
        padding: responsiveScreenWidth(5),
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statCount: {
        fontSize: responsiveScreenFontSize(2.4),
        fontWeight: 'bold',
        marginTop: responsiveScreenHeight(2),
    },
    statLabel: {
        fontSize: responsiveScreenFontSize(1.6),
        marginTop: responsiveScreenHeight(1),
        textAlign: 'center',
    },
    blogCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: responsiveScreenWidth(4),
        borderRadius: 12,
        marginBottom: responsiveScreenHeight(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    blogTitle: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '600',
    },
    blogDate: {
        fontSize: responsiveScreenFontSize(1.3),
        marginTop: 4,
        textTransform: 'capitalize'
    },
    loadMoreButton: {
        marginTop: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
})