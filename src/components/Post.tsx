import React,  {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useCustomQuery} from '../hooks/useCustomQuery';
import PostComponentTwo from './PostComponent.js';
import isEqual from 'lodash/isEqual';
import {homeStyle} from '../pages/Home/Style';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

import {
  responsiveHeight,
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import usePostData from '../hooks/usePostData';
import {debounce} from 'lodash';
import WrapperContainer from './WrapperContainer';
import LoadingModal from './LoadingModal';
import {showError, showSuccess} from '../utils/helperFunctions';
import React from 'react';
import {fonts, routes} from '../constants/values.js';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {moderateScale, verticalScale} from '../styles/scaling';
import colors from '../styles/colors.js';
import imagePath from '../constants/imagePath.js';
import {useConfirm} from '../ConfirmContext';
import StoryViewersModal from './StoryViewersModal';
import {
  InstagramStoriesPublicMethods,
  InstagramStoryProps,
} from '@birdwingo/react-native-instagram-stories/src/core/dto/instagramStoriesDTO';
import {apiClient} from '../api/customApi';
import {isStoryPlaying} from '../reducer/jobsReducer.js';
import {useAppDispatch, useAppSelector} from '../store';
import HeaderScrollBar from './HeaderScrollBar';
import {useQuery} from '@tanstack/react-query';
import {handleError} from '../pages/Home/Home';
import InstagramStories from '@birdwingo/react-native-instagram-stories';
export const removeDuplicates = (data: any) => {
  const uniqueDataMap = new Map();
  data?.forEach((item: any) => {
    if (!uniqueDataMap.has(item.id)) {
      uniqueDataMap.set(item.id, item);
    }
  });
  return Array.from(uniqueDataMap.values());
};
const Post = ({
  userId,
  menuOption,
  isProfile = false,
  isStory = false,
}: {
  userId?: number;
  menuOption?: boolean;
  isProfile?: boolean;
}) => {
  const {
    data,
    isLoading,
    isError: isError2,
    error: error2,
    refetch,
  } = useCustomQuery<SuccessResponce<InstagramStoryProps[]>>('getStories');
  const [stories, setStories] = useState<InstagramStoryProps[]>([]);
  const {user} = useAppSelector(state => state.userStore);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const storiesRef = useRef<InstagramStoriesPublicMethods>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [storyId, setStoryId] = useState<number | null>(null);
  const [isStoryViewsModal, setIsStoryViewsModal] = useState(false);
  const [storyViewers, setStoryViewers] = useState<any[]>([]);

  const {mutate: deleteStory} = usePostData<Error>('deleteStory');
  const {mutate: viewStory} = usePostData<Error>('storiesview/view', 'post');

  const onStoryHeaderPress = useCallback(
    (userId: string) => {
      const targetRoute =
        Number(userId) === user?.id ? routes.ADD_STORY : routes.PAGE;
      navigation.navigate(
        targetRoute,
        targetRoute === routes.PAGE ? {id: userId} : undefined,
      );
    },
    [navigation, user?.id],
  );
  const confirm = useConfirm();
  const onStoryDelete = useCallback(
    (activeStory: InstagramStoryProps) => {
      Alert.alert('', 'Are you sure you want to delete this story?', [
        {
          text: 'cancel',
          onPress: () => {
            storiesRef.current?.resume();
          },
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteStory({id: activeStory.id});
            setIsStoryViewsModal(false);
            storiesRef.current?.hide?.();
          },
        },
      ]);
    },
    [deleteStory],
  );

  useEffect(() => {
    if (isError2) {
      handleError(error2);
      return;
    }
    if (data?.success && data.data.length > 0) {
      const mapped = data.data.map(item => ({...item, onStoryHeaderPress}));
      setStories(mapped);
    } else {
      setStories([]);
    }
  }, [data?.data, data?.success, isError2, error2, onStoryHeaderPress]);

  const handleStoryPress = useCallback(
    (story: InstagramStoryProps) => {
      setIsVisible(true);
      setTimeout(() => {
        dispatch(isStoryPlaying(true));
        const firstStoryId = story?.stories?.[0]?.id;
        storiesRef.current?.show(story?.id, firstStoryId);
      }, 100);
    },
    [dispatch],
  );

  const handleViewsPress = useCallback((activeStory: any, data: any) => {
    if (data?.model === true) {
      storiesRef.current?.pause();
    } else if (data?.model === false) {
      storiesRef.current?.resume();
    } else {
      setStoryId(activeStory.id);
      setIsStoryViewsModal(true);
      storiesRef.current?.pause();
    }
  }, []);

  const getStoryViewsInfo = useQuery({
    queryKey: ['storyview', storyId],
    queryFn: () => apiClient.get(`storyview/${storyId}`),
    enabled: !!storyId,
    staleTime: 1000 * 60, // cache story views for 1 minute
  });

  useEffect(() => {
    if (getStoryViewsInfo?.data?.data) {
      setStoryViewers(getStoryViewsInfo.data.data);
    }
  }, [getStoryViewsInfo.data?.data]);

  const handleModalClose = useCallback(() => {
    setIsStoryViewsModal(false);
    storiesRef.current?.resume();
  }, []);

  const renderFooter = useMemo(() => {
    if (!isStoryViewsModal) return null;

    return (
      <StoryViewersModal
        onStoryDeletePress={() =>
          storyId && onStoryDelete({id: storyId} as InstagramStoryProps)
        }
        visible={false}
        isMineSTory
        onClose={handleModalClose}
        storyViewers={storyViewers}
      />
    );
  }, [
    isStoryViewsModal,
    storyId,
    storyViewers,
    handleModalClose,
    onStoryDelete,
  ]);

  const memoizedStories = useMemo(() => stories, [stories]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [navigation]),
  );

  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [viewableIndex, setViewableIndex] = useState<number>();
  const [postPage, setPostPage] = useState(1);
  const viewedPosts = useRef(new Set());
  const [isRepostLoading, setIsReportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    data: postData,
    isLoading: isPostLoading,
    refetch: refetchPosts,
    isRefetching,
    isError,
    error,
  } = useCustomQuery(
    userId
      ? `get-posts?page=${postPage}&user_id=${userId}`
      : `get-posts?page=${postPage}`,
  );

  useEffect(() => {
    if (isError) {
      const handleError = () => {
        let data;
        try {
          if (typeof error === 'string') {
            data = JSON.parse(error);
          } else if (typeof error === 'object' && error !== null) {
            data = error;
          }
          showError(data?.message || 'Something went wrong');
        } catch (e) {
          showError('Something went wrong');
        }
      };
      handleError();
    }
  }, [isError, error]);
  const onScreenFocus = useCallback(() => {
    refetchPosts();
  }, [refetchPosts]);
  useFocusEffect(onScreenFocus);
  const {
    mutate: onViewPost,
    isError: isErrorMutation,
    error: errorMutation,
  } = usePostData<Error>('/view', 'post');
  useEffect(() => {
    if (isErrorMutation) {
      const handleError = () => {
        let data;
        try {
          if (typeof errorMutation === 'string') {
            data = JSON.parse(errorMutation);
          } else if (
            typeof errorMutation === 'object' &&
            errorMutation !== null
          ) {
            data = errorMutation;
          }
          showError(data?.message || 'Something went wrong');
        } catch (e) {
          showError('Something went wrong');
        }
      };
      handleError();
    }
  }, [isErrorMutation, errorMutation]);
  const {
    mutate: onDeletePost,
    isError: isErrorMutation2,
    error: errorMutation2,
  } = usePostData<Error>('/deletePost', 'post', {
    onSuccess: async res => {
      setDeleteLoading(false);
      if (res?.data) {
        refetchPosts();
        // setPosts(prev => prev.filter(i => i?.id != res?.data))
        showSuccess(res?.message || 'Post Deleted Successfully');
      }
    },
    onError: async (error: any) => {
      setDeleteLoading(false);
    },
  });
  useEffect(() => {
    if (isErrorMutation2) {
      const handleError = () => {
        let data;
        try {
          if (typeof errorMutation2 === 'string') {
            data = JSON.parse(errorMutation2);
          } else if (
            typeof errorMutation2 === 'object' &&
            errorMutation2 !== null
          ) {
            data = errorMutation2;
          }
          showError(data?.message || 'Something went wrong');
        } catch (e) {
          showError('Something went wrong');
        }
      };
      handleError();
    }
  }, [isErrorMutation2, errorMutation2]);
  const onDeletePress = (id: any) => {
    confirm({
      message: 'Are you sure you want to delete this post?',
      onConfirm: () => {
        setDeleteLoading(true);
        onDeletePost({id: id});
      },
    });
  };
  const story = useMemo(() => {
    if (!isStory) return;
    return (
      <>
        {stories.length > 0 && stories[0]?.id && (
          <InstagramStories
            currentUser={user.id}
            stories={memoizedStories}
            hideAvatarList
            ref={storiesRef}
            isVisible={isVisible}
            storyAvatarSize={responsiveScreenWidth(11)}
            textStyle={{
              fontSize: responsiveScreenFontSize(1.8),
              color: 'white',
            }}
            backgroundColor="#000"
            storyAnimationDuration={800}
            modalAnimationDuration={600}
            animationDuration={7000}
            progressColor="#888"
            progressActiveColor="#fff"
            closeIconColor="#fff"
            containerStyle={{height: SCREEN_HEIGHT, width: SCREEN_WIDTH}}
            mediaContainerStyle={{flex: 1}}
            progressContainerStyle={{
              position: 'absolute',
              top: 0,
              backgroundColor: 'black',
            }}
            headerContainerStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              marginTop: -10,
            }}
            storyTextStyle={{color: 'white', fontSize: 16}}
            onStoryDeletePress={onStoryDelete}
            onViewsPress={handleViewsPress}
            onStoryStart={(userId, storyId) => viewStory({mediaid: storyId})}
            onStoryEnd={() => setIsStoryViewsModal(false)}
            onHide={() => {
              setIsVisible(false);
              setIsStoryViewsModal(false);
              dispatch(isStoryPlaying(false));
              refetch();
            }}
            onSwipeUp={() => setIsStoryViewsModal(false)}
            footerComponent={renderFooter}
          />
        )}
        <View
          style={[
            homeStyle.tabContainer,
            {
              borderBottomWidth: 0.5,
              width: responsiveScreenWidth(96),
              paddingBottom: responsiveScreenHeight(1),
            },
          ]}>
          <HeaderScrollBar
            onPressMyStory={() => navigation.navigate(routes.ADD_STORY)}
            onPressStory={handleStoryPress}
            list={memoizedStories.length > 0 ? [...memoizedStories] : [{}]}
          />
        </View>
      </>
    );
  }, [stories]);
  const debouncedViewPost = debounce(item => {
    if (!!item?.id) {
      onViewPost({blog_id: item.id});
    }
  }, 1000);

  const handleLoadMore = () => {
    if (!isPostLoading && hasMorePosts && postData) {
      setPostPage(prev => prev + 1);
    }
  };
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;
  const renderPosts = ({item, index}) => {
    if (item?.type === 'suggested_video') {
      return (
        <>
          <Text
            style={{
              fontSize: responsiveScreenFontSize(2),
              marginHorizontal: verticalScale(8),
              marginBottom: responsiveScreenHeight(1),
            }}>
            Suggested Videos
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: responsiveScreenWidth(2),
              marginHorizontal: responsiveScreenWidth(2),
            }}
            data={item.suggestedVideo}
            renderItem={({item: suggestedVideo}) => {
              return (
                <Pressable
                  onPress={() => {
                    navigation.navigate(routes.REELSPAGE, {
                      id: suggestedVideo?.blog_id,
                    });
                  }}
                  style={{
                    // borderWidth: 0.2,
                    width: responsiveScreenWidth(30),
                    aspectRatio: 9 / 16,
                    borderRadius: moderateScale(12),
                    overflow: 'hidden',
                    backgroundColor: colors.lightGray,
                  }}>
                  <Image
                    source={{uri: suggestedVideo.thumbnail}}
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Pressable>
              );
            }}
            ListFooterComponent={() => {
              return <View style={{width: responsiveScreenWidth(2)}}></View>;
            }}
          />
        </>
      );
    }
    return (
      <PostComponentTwo
        isProfile={isProfile}
        setIsReportLoading={setIsReportLoading}
        isMenuOption={menuOption}
        onDeletePress={onDeletePress}
        index={index}
        viewableIndex={viewableIndex}
        item={item}
      />
    );
  };
  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setViewableIndex(viewableItems[0].index);
      if (!viewedPosts.current.has(viewableItems[0].item)) {
        debouncedViewPost(viewableItems[0].item);
        viewedPosts.current.add(viewableItems[0].item);
      }
    }
  }).current;
  const prevDataRef = useRef<any[]>([]);
  useEffect(() => {
    if (postData?.success && Array.isArray(postData.data)) {
      const incoming = postData.data;

      // if it isn’t exactly the same array of objects as last time…
      if (!isEqual(prevDataRef.current, incoming)) {
        prevDataRef.current = incoming;

        setPosts(prev =>
          postPage === 1 ? incoming : removeDuplicates([...prev, ...incoming]),
        );

        // only disable “load more” if fewer than page‐size items returned
        setHasMorePosts(incoming.length >= 10);
      }
    }
  }, [postData, postPage]);

  const handleRefresh = () => {
    setPostPage(1);
    setTimeout(() => {
      refetchPosts();
    }, 200);
  };
  if (!user?.id || isLoading) return null;
  return (
    <>
      <LoadingModal isLoading={isRepostLoading || deleteLoading} />
      {posts?.length > 0 ? (
        <FlatList
          data={posts}
          ListHeaderComponent={story}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={renderPosts}
          ListEmptyComponent={() => (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Image
                style={{
                  flex: 1,
                  height: responsiveScreenHeight(20),
                  width: responsiveScreenHeight(20),
                }}
                source={imagePath.emptyList}
              />
              <Text
                style={{
                  fontSize: responsiveScreenFontSize(2),
                  color: Colors.secondaryText,
                  textAlign: 'center',
                }}>
                No data found
              </Text>
            </View>
          )}
          style={homeStyle.flatlist}
          scrollEnabled={true}
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
              <View style={{height: responsiveScreenHeight(5)}}>
                {hasMorePosts && (
                  <ActivityIndicator
                    size={'large'}
                    color={Colors.activeColor}
                  />
                )}
              </View>
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
      ) :   isPostLoading ? 
     
        (
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
       
      ):
      <>
       <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: responsiveHeight(10),
                    }}>
                        <Text
                          style={{
                            fontSize: responsiveScreenFontSize(3),
                            fontWeight: '900',
                            color: colors.black,
                          }}>
                          You don't have any Post yet
                        </Text>
                        <Text
                          style={{
                            fontSize: responsiveScreenFontSize(2),
                            color: Colors.secondaryText,
                            textAlign: 'center',
                          }}>
                          No data found
                        </Text>
                   
                  </View>
      </>
      }
    </>
  );
};

export default Post;
