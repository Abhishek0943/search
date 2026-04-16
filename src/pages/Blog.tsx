import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View, Linking, TouchableOpacity } from 'react-native'
import Icon from '../utils/Icon'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { NavigationBar } from '../components'
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'
import { getApiCall } from '../api'
import { useAppDispatch } from '../store'
import Text from '../components/Text'
import { routes } from '../constants/values'

const Blog = () => {
    const { colors } = useContext(ThemeContext);
    const [data, setData] = useState<any[]>([]);
    const dispatch = useAppDispatch();

    const [savedTopics, setSavedTopics] = useState<Record<number, boolean>>({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const fetchingRef = useRef(false);
    const loadMore = useCallback(async (isReset = false) => {
        if (fetchingRef.current) return;
        if (!isReset && !hasMore) return;
        if (loadingMore) return;
        fetchingRef.current = true;
        setLoadingMore(true);
        const currentPage = isReset ? 1 : page;
        const endpoint = `/blogs?page=${currentPage}`;
        try {
            const res = await getApiCall<any>(endpoint);
            if (res?.success) {
                let fetchedData: any[] = [];
                if (Array.isArray(res.data.blogs)) fetchedData = res.data.blogs;
                else if (Array.isArray(res.data?.blogs)) fetchedData = res.data.blogs;

                const mergeData = (prev: any[]) => {
                    const newData = isReset ? fetchedData : [...prev, ...fetchedData];
                    return newData.filter((item, index, self) =>
                        index === self.findIndex(t => (t?.id && t.id === item?.id) || t === item)
                    );
                };

                setData(mergeData);
                setPage(currentPage + 1);

                const lastPage = res.data?.last_page;
                if (lastPage) {
                    setHasMore(currentPage < lastPage);
                } else {
                    setHasMore(fetchedData.length > 0);
                }
            }
        } catch (e) {
        } finally {
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    }, [hasMore, loadingMore, page,]);

    useEffect(() => {
        loadMore(true);
    }, []);


    return (
        <NavigationBar name={routes.BLOG}>
            <View style={{ flex: 1, }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        position: 'relative',
                        alignItems: 'center',
                        borderBottomColor: colors.textDisabled,
                        borderBottomWidth: 0.5,
                        paddingBottom: responsiveScreenHeight(2),
                        width: responsiveScreenWidth(100),
                        paddingHorizontal: responsiveScreenWidth(5),
                    }}
                >
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            fontSize: responsiveScreenFontSize(2),
                            color: colors.textPrimary,
                            fontWeight: '800',
                        }}
                    >
                        Insights
                    </Text>
                    {/* <TouchableOpacity onPress={() => navigation.navigate(routes.NOTIFICATION)}>
                 <Image
                   source={imagePath.notification}
                   style={{ opacity: 1, resizeMode: 'contain' }}
                 />
               </TouchableOpacity> */}
                </View>
                <View style={{ flex: 1, width: responsiveWidth(90), alignSelf: 'center', marginTop: responsiveScreenHeight(2) }}>
                    <FlatList
                        data={data}
                        showsVerticalScrollIndicator={false}
                        style={{ paddingTop: responsiveScreenHeight(1) }}
                        contentContainerStyle={{ gap: responsiveScreenHeight(2.2), paddingBottom: responsiveScreenHeight(5) }}
                        keyExtractor={(item, index) => item?.id ? String(item.id) : index.toString()}
                        onEndReached={() => loadMore(false)}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                        ListEmptyComponent={!loadingMore ? <Text style={{ textAlign: "center", marginTop: 20 }}>No {'articles'} found</Text> : null}
                        renderItem={({ item, index }) => {

                            return <ArticleCard post={item} />;

                        }}
                    />
                </View>
            </View>


        </NavigationBar>
    )
}

export default Blog
export const ArticleCard = ({ post, onEdit, onDelete }: { post: any, onEdit?: (post: any) => void, onDelete?: (post: any) => void }) => {
    const { colors } = useContext(ThemeContext)
    const [loading, setLoading] = useState(true);
    const openURL = async (url: any) => {
        if (!url) return;
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                console.log(`Opening URL: ${url}`);
                Linking.openURL(url)
                    .catch(err => console.error("Failed to open URL:", err));
            } else {
                console.log(`Can't open URL: ${url}`);
            }
        } catch (error: any) {
            console.error("Failed to open URL:", error.message);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString();
    };

    const title = post?.heading || post?.title;
    const image = post?.image || post?.imageUrl;
    const date = post?.created_at;
    const author = post?.created_by;
    const categoryName = post?.category?.name || post?.topic;
    return (
        <Pressable onPress={() => openURL(post?.web_url)} style={{ flexDirection: "row", gap: responsiveWidth(2), alignItems: "center", marginBottom: responsiveScreenHeight(2) }}>
            <View style={{ borderWidth: .5, borderColor: "#b8b8b899", height: responsiveHeight(10), borderRadius: 10, aspectRatio: 1, overflow: "hidden", position: 'relative' }}>
                {loading && (
                    <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSurface || "#f0f0f0" }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}
                <Image
                    source={{ uri: image }}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    style={{ height: "100%", width: "100%", resizeMode: "cover" }}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: "black", fontSize: responsiveFontSize(2.5), fontWeight: "600" }}>{title}</Text>
                <Text numberOfLines={1} style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: "400" }}>{categoryName || post?.status}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveWidth(2), marginTop: responsiveHeight(0.5) }}>

                    {author?.name && (
                        <Text numberOfLines={1} style={{ color: "black", fontSize: responsiveFontSize(1.8), fontWeight: "500" }}>{author?.name}</Text>
                    )}
                    {date && (
                        <>
                            <Text numberOfLines={1} style={{ color: "gray", fontSize: responsiveFontSize(1.5), fontWeight: "400", marginTop: 2 }}>
                                •
                            </Text>
                            <Text numberOfLines={1} style={{ color: "gray", fontSize: responsiveFontSize(1.5), fontWeight: "400", marginTop: 2 }}>
                                {formatDate(date)}
                            </Text>
                        </>
                    )}
                </View>
            </View>
            {(onEdit || onDelete) && (
                <View style={{ flexDirection: 'row', gap: responsiveWidth(3), alignItems: 'center' }}>
                    {onEdit && (
                        <TouchableOpacity onPress={() => onEdit(post)}>
                            <Icon icon={{ type: 'MaterialIcons', name: 'edit' }} size={24} style={{ color: colors.primary }} />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity onPress={() => onDelete(post)}>
                            <Icon icon={{ type: 'MaterialIcons', name: 'delete' }} size={24} style={{ color: '#DC3545' }} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Pressable>
    )
}
const styles = StyleSheet.create({})