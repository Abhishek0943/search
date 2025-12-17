import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Video from 'react-native-video';
import convertToProxyURL from 'react-native-video-cache';
import { useSelector } from 'react-redux';
import { getApiCall, postApiCall } from '../api';
import imagePath from '../constants/imagePath.js';
import { fonts, lightColors, routes } from '../constants/values.js';
import usePostData from '../hooks/usePostData';
import { IsFollow } from '../pages/Search/Search';
import { addBookmMarkdPost, addFollowing, addLikedPost } from '../reducer/jobsReducer.js';
import { useAppDispatch, useAppSelector } from '../store';
import colors from '../styles/colors.js';
import {
  height,
  moderateScale,
  scale,
  verticalScale,
  width,
} from '../styles/scaling';
import { showError, showSuccess } from '../utils/helperFunctions';
import CommentModel from './CommentModel';
import CustomModal from './CustomModal';
import LoadingModal from './LoadingModal';
const ReelItem = ({
  item,
  isPlaying,
  isLoading: parentLoading,
  setIsComment,
  height
}: {
  item: any;
  isPlaying: boolean;
  isLoading?: boolean;
  
}) => {

  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bottomModalVisible, setBottomModalVisible] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(true);
  const [slectedPost, setSelectedPost] = useState({});
  const { user } = useAppSelector(state => state.userStore);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isRepostLoading, setIsReportLoading] = useState(false);

  const videoRef = useRef<Video>(null);

  const userBookmarks = useSelector(
    (state: any) => state.posts?.BookMarkPost || [],
  );
  const FollowingUsers = useSelector(
    (state: any) => state.posts?.FollowingUsers || [],
  );
  let isPostBookMarked =
    userBookmarks?.find(el => el?.post_id == item?.id)?.is_bookmarked ??
    item?.is_bookmarked;
  let isFollowing =
    FollowingUsers?.find(el => el?.post_id == item?.user?.id)?.is_following ??
    item?.user?.is_following;
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    };
  }, []);
  const handleVideoPress = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  useEffect(() => {
    if (!isPlaying) {
      const timer = setTimeout(() => setShouldRenderVideo(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderVideo(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

  const handleLoadStart = useCallback(() => {
    setIsBuffering(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback(() => setIsBuffering(false), []);

  const handleError = useCallback(() => {
    setIsBuffering(false);
    setHasError(true);
  }, []);

  const handleBuffer = useCallback(({ isBuffering: buffering }) => {
    setIsBuffering(buffering);
  }, []);

  const isLoading = parentLoading || isBuffering;
  const [textShown, setTextShown] = useState(false);


  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };
  const dispatch = useAppDispatch()
  const handleLike = async () => {
    const res = await postApiCall<{
      success: true;
      message: string;
      data: { likesCount: number; liked: boolean };
    }>('like', { id: item.id, type: 'blog' });
    if (res.success) {
      const data = {
        post_id: item?.id,
        is_Liked: res?.data?.liked,
        likesCount: res?.data?.likesCount,
      };
      dispatch(addLikedPost(data));
    }
  };
  const isComment = false
  const likedPost = useAppSelector((state: any) => state.posts?.LikedPosts || []);

  const isLikedPost = useMemo(() => {
    return (
      likedPost.find(itm => itm?.post_id === item?.id)?.is_Liked ??
      item?.is_liked
    );
  }, [likedPost, item]);
  const likedCount = useMemo(() => {
    return (
      likedPost.find(itm => itm?.post_id === item?.id)?.likesCount ??
      item?.likes_count
    );
  }, [likedPost, item]);

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Couldn't load video</Text>
      </View>
    );
  }

  const bookmarkPress = (item: any) => {
    setIsReportLoading(true);
    onBookmarkPress({ blog_id: item?.id });
  };

  const {
    mutate: onBookmarkPress,
    isError: isErrorMutation,
    error: errorMutation,
  } = usePostData<Error>('/bookmark', 'post', {
    onSuccess: async res => {
      setIsReportLoading(false);
      if (res?.data) {
        const data = {
          post_id: res?.data?.blog_id,
          is_bookmarked: res?.data?.is_bookmark,
        };
        dispatch(addBookmMarkdPost(data));
        // if (!!refetchData) {
        //   refetchData();
        // }
      }
    },
    onError: async (error: any) => { },
  });
  const handleFollowButton = async (id: number) => {
    setIsReportLoading(true);
    const response = await getApiCall('/follow/' + id);
    if (response?.success) {
      showSuccess(response?.message);
      const data = {
        post_id: id,
        is_following: response?.data?.following,
      };
      dispatch(addFollowing(data));
    }
    setIsReportLoading(false);
  };

  const {
    mutate: onReport,
    isError: isErrorMutation2,
    error: errorMutation2,
  } = usePostData<Error>('/reportPost', 'post', {
    onSuccess: async res => {
      setIsReportLoading(false);
      if (res?.success) {
        showSuccess(res?.message ?? 'Post Reported successfully!');
      }
    },
    onError: async (error: any) => {
      setIsReportLoading(false);
      showError(error?.message || '');
    },
  });
  const onReportPress = (item: any) => {
     confirm({
      message: 'Are you sure you want to report this post',
      onConfirm: () => {
      setIsReportLoading(true);
          onReport({ post_id: item?.id });
      },
    });
  
  };
  const {
    mutate: onBlockUser,
    isError: isErrorMutation3,
    error: errorMutation3,
  } = usePostData<Error>('/block', 'post', {
    onSuccess: async res => {
      setIsReportLoading(false);
      if (res?.success) {
        showSuccess(res?.message ?? 'Post Reported successfully!');
      }
    },
    onError: async (error: any) => {
      setIsReportLoading(false);
      showError(error?.message || '');
    },
  });
  const onBlockPress = (item: any) => {
       confirm({
      message: 'Are you sure you want to Block this user ',
      onConfirm: () => {
    setIsReportLoading(true);
          onBlockUser({ user_id: item?.user.id, type: 'block' });
      },
    });

  };
  const onShare = async () => {
    const deepLink = `https://dev.loopin.org/post/${item?.id}`;
    let message = `${!!item?.description ? item?.description : ' Check out this post at loopin!'} ${deepLink} `;
    try {
      await Share.share({
        // title: 'Check out this post!',
        message: message,
        url: deepLink,
      });
    } catch (error) {
      console.error('Sharing error:', error);
    }
  };
  const onOptionPress = (option: number) => {
    switch (option) {
      case 1:
        bookmarkPress(slectedPost);
        break;
      case 2:
        handleFollowButton(slectedPost?.user?.id);
        break;
      case 3:
        setBottomModalVisible(false);
        onReportPress(slectedPost);
        break;
      case 4:
        setBottomModalVisible(false);
        setTimeout(() => {
          navigation.navigate(routes.POST, { item: slectedPost });
        }, 200);
        break;
      case 5:
        setBottomModalVisible(false);
        onBlockPress(slectedPost);
        break;
      case 6:
        setBottomModalVisible(false);
        if (user.id === item?.user?.id) {
          !isProfile &&
            navigation.navigate(routes.PROFILE, { id: slectedPost?.user?.id });
        } else {
          navigation.navigate(routes.PAGE, { id: slectedPost?.user?.id });
        }
        break;
    }
  };

  const renderModalContent = () => {
    let isMyPost = user?.id == slectedPost?.user?.id;
    return (
      <View
        style={{
         flex: 1,
                   paddingTop: responsiveScreenHeight(1),
                   borderTopRightRadius: moderateScale(14),
                   borderTopLeftRadius: moderateScale(14),
        }}>
        <Pressable
          onPress={() => onOptionPress(1)}
          style={styles.modalOptionContainer}>
          <Image
            source={
              isPostBookMarked ? imagePath.active_bookmark : imagePath.bookmark
            }
          />
          <Text style={styles.modalOption}>
            {' '}
            {isPostBookMarked ? 'Bookmarked' : 'Bookmark'}{' '}
          </Text>
        </Pressable>
        {!isMyPost && (
          <Pressable
            onPress={() => onOptionPress(2)}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.follow} />
            <Text style={styles.modalOption}>
              {' '}
              {isFollowing ? 'Unfollow' : 'Follow'}{' '}
            </Text>
          </Pressable>
        )}
        {!isMyPost && (
          <Pressable
            onPress={() => onOptionPress(3)}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.report} />
            <Text style={styles.modalOption}> Report </Text>
          </Pressable>
        )}
        {!isMyPost && (
          <Pressable
            onPress={() => onOptionPress(5)}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.report} />
            <Text style={styles.modalOption}> Block user </Text>
          </Pressable>
        )}
        {isMyPost && (
          <Pressable
            onPress={() => onOptionPress(4)}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.edit} />
            <Text style={styles.modalOption}> Edit</Text>
          </Pressable>
        )}
        {isMyPost && (
          <Pressable
            onPress={() => {
              onDeletePress(slectedPost?.id);
              setBottomModalVisible(false);
            }}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.delete} />
            <Text style={styles.modalOption}> Delete </Text>
          </Pressable>
        )}
        {!isMyPost && (
          <Pressable
            onPress={() => onOptionPress(6)}
            style={styles.modalOptionContainer}>
            <Image source={imagePath.profile} />
            <Text style={styles.modalOption}> About this account </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const onpressMenu = (item: any) => {
    setBottomModalVisible(true);
    setSelectedPost(item);
  };
  return (
    <View style={[styles.reelContainer, { height ,}]}>
      {shouldRenderVideo && (
        <Pressable onPress={handleVideoPress} style={{ height: responsiveScreenHeight(82) }}>
          <Video
            ref={videoRef}
            source={{ uri: convertToProxyURL(item?.media[0]?.media) }}
            style={{ flex: 1 }}
            resizeMode="contain"
            paused={!isPlaying || !isFocused || isPaused}
            repeat
            muted={isMuted}
            ignoreSilentSwitch="ignore"
            playInBackground={false}
            playWhenInactive={false}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onError={handleError}
            onBuffer={handleBuffer}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            maxBitRate={2000000}
            selectedVideoTrack={{
              type: 'auto',
              value: 480,
            }}
          />
        </Pressable>

      )}

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <View style={styles.overlay}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.topView}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <View style={styles.backButton}>
            <Image style={styles.backIcon} source={imagePath.leftArrow} />
            <Text style={styles.backText}>{'Reels'}</Text>
          </View>
          <Pressable onPress={toggleMute} hitSlop={10}>
            <Image
              style={styles.iconImage}
              source={
                isMuted ? imagePath.volumeInActive : imagePath.volumeActive
              }
            />
          </Pressable>
        </Pressable>
        <View style={{ width: "100%", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View style={styles.bottomLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => navigation.navigate(routes.PROFILE, { id: item?.user?.id })}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) }}>
                <FastImage style={styles.userImage} source={{ uri: item?.user?.profile_image }} />

                <View style={{ marginLeft: scale(10), flexDirection: "row", alignItems: "flex-end" }}>
                  <Text style={styles.user} numberOfLines={1}>
                    {item?.user?.name}
                  </Text>
                  {(item?.user?.tick === 'blue' || item?.user?.tick === 'red') && (
                    <View
                      style={{
                        width: responsiveScreenWidth(4),
                        maxWidth: 25,
                        aspectRatio: 1,
                        borderRadius: 100,
                      }}>
                      <Image
                        source={imagePath.blueTick}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                          tintColor:
                            item?.user?.tick === 'blue'
                              ? colors.blue
                              : item?.user?.tick === 'red'
                                ? colors?.red
                                : undefined,
                        }}
                      />
                    </View>
                  )}

                </View>
              </Pressable>
              {
                item?.user?.id !== user?.id&&<IsFollow
                isValue={item?.user?.is_following}
                id={item?.user?.id}
                containerStyle={{
                  borderColor: 'white',
                  bordewidth: 2,
                  borderRadius: moderateScale(20),
                  width: "auto",
                  height: verticalScale(24),
                  paddingHorizontal: responsiveScreenWidth(3),
                  marginLeft: 20,
                  backgroundColor: 'transparent',
                }}
                textStyle={{
                  fontSize: scale(10),
                  fontWeight: "700",
                  color: colors.white,
                }}
              />
              }
              
            </View>
            {item?.description && <Text onPress={toggleNumberOfLines}
              numberOfLines={textShown ? undefined : 2} style={styles.caption} >
              {item?.description}
            </Text>}
          </View>
          <View style={styles.rightActions}>
            <Pressable onPress={handleLike} hitSlop={10}>
              {
                !isLikedPost ? <Image
                  style={[styles.iconImageSmall]}
                  source={imagePath.like}
                /> :
                  <Image
                    style={[{
                      width: moderateScale(20),
                      height: verticalScale(20),
                      resizeMode: 'contain',
                    }]}
                    source={imagePath.disLike}
                  />
              }

              <Text style={styles.iconText}>{likedCount}</Text>
            </Pressable>

            <Pressable onPress={() => setIsComment(item.id)} hitSlop={10}>
              <Image
                style={[
                  styles.iconImageSmall,
                  { marginTop: moderateScale(10) },
                ]}
                source={imagePath.comment}
              />
              <Text style={styles.iconText}>{item?.comments_count}</Text>
            </Pressable>

            <Pressable onPress={onShare} hitSlop={10}>
              <Image style={styles.iconImage} source={imagePath.shear} />
              <Text style={styles.iconText}>{item?.share_count || "0"}</Text>
            </Pressable>

            <Pressable onPress={() => onpressMenu(item)}> hitSlop={10}
              <Image
                style={[styles.iconImageSmallest, styles.iconSpacing]}
                source={imagePath.threeDot}
              />
            </Pressable>
          </View>
        </View>
        {/* 
      */}
      </View>
      <LoadingModal isLoading={isRepostLoading} />
      {bottomModalVisible && (
        <CustomModal
          onBackdropPress={() => {
            setBottomModalVisible(false);
          }}
          isVisible={bottomModalVisible}
          renderModalContent={renderModalContent}
        />
      )}
      
    </View>
  );
};

export default memo(ReelItem);

const styles = StyleSheet.create({
  reelContainer: {
    width: "100%",
    backgroundColor: 'black',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    height: height,
    width: width,
  },
  errorText: {
    color: 'white',
    fontSize: moderateScale(16),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: moderateScale(10),
  },

  user: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(12),
    maxWidth: width * 0.35,
  },
  caption: {
    color: colors.white,
    fontSize: moderateScale(14),
    maxWidth: width * 0.8,
    marginTop: verticalScale(5),

  },
  rightActions: {
    alignItems: 'center',
  },

  iconImage: {
    width: moderateScale(26),
    height: verticalScale(26),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  iconImageSmall: {
    width: moderateScale(20),
    height: verticalScale(20),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  iconImageSmallest: {
    width: moderateScale(16),
    height: verticalScale(16),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  iconSpacing: {
    marginVertical: verticalScale(15),
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: moderateScale(24),
    height: verticalScale(24),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  backText: {
    color: colors.white,
    fontSize: scale(14),
    marginLeft: moderateScale(16),
    fontFamily: fonts.poppinsM,
    marginTop: 2,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iconText: {
    color: colors.white,
    fontSize: moderateScale(12),
    alignSelf: 'center',
    // marginTop: verticalScale(4),
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userImage: {
    width: moderateScale(48),
    aspectRatio: 1,
    resizeMode: 'contain',
    borderRadius: 100,
  },


  modalOption: {
    color: colors.black,
    fontSize: scale(14),
    fontFamily: fonts.poppinsM,
    marginLeft: responsiveScreenWidth(2),
  },
  modalOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: responsiveScreenFontSize(6),
    marginBottom: responsiveScreenFontSize(1),
    borderBottomWidth: 0.2,
    paddingHorizontal: responsiveScreenWidth(2.5)

  },
});
