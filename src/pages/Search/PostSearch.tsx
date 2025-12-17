import {
    NavigationProp,
    ParamListBase,
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import {
    responsiveScreenFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { debounce } from "lodash";
import { LoadingModal, PostComponentTwo, } from '../../components';
import imagePath from '../../constants/imagePath';
import { lightColors } from '../../constants/values';
import usePostData from '../../hooks/usePostData';
import { showSuccess } from '../../utils/helperFunctions';
import { useCustomQuery } from '../../hooks/useCustomQuery';
import { removeDuplicates } from '../../components/Post';
import { homeStyle } from '../Home/Style';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useConfirm } from '../../ConfirmContext';
const colors = lightColors;
const PostSearch = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [postPage, setPostPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [isRepostLoading, setIsReportLoading] = useState(false)
    const route = useRoute()
    const pageVal = route.params?.search
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const [viewableIndex, setViewableIndex] = useState<number>();
    const [search, setSearch] = useState(pageVal || '');
    const [deleteLoading, setDeleteLoading] = useState(false)
    const viewedPosts = useRef(new Set());
    const { mutate: onDeletePost } = usePostData<Error>(
        '/deletePost',
        'post',
        {
            onSuccess: async (res) => {
                console.log(res, posts, 'resreson reportinggg>><<<<<<', res?.data);
                setDeleteLoading(false)

                if (res?.data) {
                    setPosts(prev => prev.filter(i => i?.id != res?.data))
                    showSuccess(res?.message || 'Post Deleted Successfully')
                }

            },
            onError: async (error: any) => {
                console.log(error, 'error in delete');
                setDeleteLoading(false)
            },
        },
    );
    useEffect(() => {
        setSearch(pageVal)
    }, [])
    console.log("ksdfjkasdjhfsdjkfhjdksf", search, pageVal)
    const { data: postData, isLoading: isPostLoading, refetch: refetchPosts, isRefetching } = useCustomQuery(
        `hashtag?type=post&search=${search.startsWith("#") ? search.slice(1) : search}&is_hash=${search.startsWith("#") ? 1 : 0}`
    );
    useEffect(() => {
        console.log(postData)
        if (postData?.success && postData.data) {
            setPosts(prev =>
                postPage === 1
                    ? postData.data
                    : removeDuplicates([...prev, ...postData.data]),
            );
            if (postData.data.length === 0 || postData.data.length < 10) {
                setHasMorePosts(false);
            }
        }

    }, [postData]);
    const confirm = useConfirm()
    const onDeletePress = (id: any) => {
        confirm({
            message: "Are you sure you want to Delete this post?",
            onConfirm: () => {
                setDeleteLoading(true)
                onDeletePost({ id: id })
            }
        })

    }
    const postApi = useMemo(() => {
        const objectById: Record<number, Post> = {};
        const id: number[] = [];
        posts.forEach((item: Post) => {
            objectById[item.id] = item;
            id.push(item.id);
        });
        return { id, objectById };
    }, [posts]);
    const renderPosts = useCallback(
        ({ item, index }: { item: number, index: number }) => {
            return (
                <PostComponentTwo
                    isProfile={false}
                    setIsReportLoading={setIsReportLoading}
                    isMenuOption={true}
                    onDeletePress={onDeletePress}
                    index={index}
                    viewableIndex={viewableIndex}
                    item={postApi.objectById[item]}
                />
            );
        },
        [viewableIndex, postApi],
    );
    const { mutate: onViewPost } = usePostData<Error>('/view', 'post',);
    const debouncedViewPost = debounce((item) => {
        if (!!item) {
            onViewPost({ blog_id: item.id });
        }
    }, 1000);
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setViewableIndex(viewableItems[0].index);
            if (!viewedPosts.current.has(viewableItems[0].item)) {
                debouncedViewPost(viewableItems[0].item);
                viewedPosts.current.add(viewableItems[0].item);
            }
        }

    }).current;
    const handleRefresh = () => {
        setPostPage(1);
        setTimeout(() => {
            refetchPosts()
        }, 200);
    };
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 60,
    }).current;
    const handleLoadMore = () => {
        if (!isPostLoading && hasMorePosts && postData) {
            setPostPage(prev => prev + 1);
        }
    };
    return (
        <View
            style={{
                backgroundColor: colors.bgMain,
                flex: 1,
                paddingHorizontal: responsiveScreenWidth(2.5),
                paddingVertical: responsiveScreenHeight(2),
            }}>
            <View style={{ flexDirection: "row", marginHorizontal: responsiveScreenWidth(2), alignItems: "center", gap: responsiveScreenWidth(2), marginBottom: responsiveScreenHeight(3), }}>
                <Pressable onPress={() => navigation.goBack()} style={{
                    height: responsiveScreenWidth(7),
                    aspectRatio: 1,
                }}>
                    <Image source={imagePath.leftArrow} style={{
                        height: "100%",
                        width: "100%",
                        tintColor: colors.maintext,
                    }} />
                </Pressable>
                <View
                    // onPress={() => navigation.navigate(routes.SEARCH)}
                    style={{
                        borderWidth: 1,
                        flex: 1,
                        borderColor: colors.maintext,
                        borderRadius: 7,
                        gap: responsiveScreenWidth(1),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: responsiveScreenWidth(2),
                    }}>
                    <Image style={{}} source={imagePath.search} />
                    <TextInput
                        placeholderTextColor={colors.secondaryText}
                        value={search}
                        onChangeText={e => setSearch(e)}
                        placeholder="Search"
                        style={{
                            flex: 1,
                            margin: 0,
                            padding: 0,
                            color: colors.maintext,
                            height: responsiveScreenHeight(4),
                            fontSize: responsiveScreenFontSize(1.8),
                        }}
                    />
                    {/* 
                     */}
                </View>
            </View>


            <LoadingModal isLoading={isRepostLoading || deleteLoading} />
            {postApi.id.length > 0 ? (
                <FlatList
                    data={postApi.id}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={renderPosts}
                    style={homeStyle.flatlist}
                    contentContainerStyle={homeStyle.flatlistGap}
                    showsVerticalScrollIndicator={false}
                    initialScrollIndex={0}
                    scrollEventThrottle={16}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    removeClippedSubviews={true}
                    disableIntervalMomentum={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    initialNumToRender={5}
                    updateCellsBatchingPeriod={50}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (
                        <>
                            {hasMorePosts && <View style={{ height: responsiveScreenHeight(10) }} >
                                <ActivityIndicator size={'large'} color={Colors.activeColor} />
                            </View>}
                        </>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                        // tintColor={'red'}
                        />
                    }
                />
            ) : (
                isPostLoading &&
                postPage == 1 && (
                    <FlatList
                        data={[...new Array(5)]}
                        renderItem={renderPosts}
                        style={homeStyle.flatlist}
                        contentContainerStyle={homeStyle.flatlistGap}
                        showsVerticalScrollIndicator={false}
                        initialScrollIndex={0}
                        scrollEventThrottle={16}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        removeClippedSubviews
                        disableIntervalMomentum={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={2}
                    />
                )
            )}
            <View style={{ flex: 1 }}></View>
        </View>
    );
};

export default PostSearch;
