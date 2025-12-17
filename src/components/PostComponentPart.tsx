import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share
} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { ImageRender, Loading } from '.';
import { postApiCall } from '../api';
import imagePath from '../constants/imagePath';
import { fonts, lightColors, routes } from '../constants/values';
import { addLikedPost } from '../reducer/jobsReducer';
import { scale, verticalScale } from '../styles/scaling';
import { useAppSelector } from '../store';
// import Share from 'react-native-share';
const colors = lightColors;
interface PostComponentPartProps {
  item?: Post;
  isActiveIndex: number;
}
const PostComponentPart: React.FC<PostComponentPartProps> = ({
  item,
  isActiveIndex,
}) => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useDispatch();

  const [textShown, setTextShown] = useState(false);
  const [lengthMore, setLengthMore] = useState(false);

  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = React.useCallback(e => {
    if (e.nativeEvent.lines.length > 3 && !textShown) {
      setLengthMore(true);
    }
  }, []);

  const likedPost = useSelector((state: any) => state.posts?.LikedPosts || []);

  const isLikedPost = useMemo(() => {
    return (
      likedPost.find(itm => itm?.post_id === item?.id)?.is_Liked ??
      item?.is_liked
    );
  }, [likedPost, item]);
  const commentCount = useAppSelector(
    (state) => state.posts?.Comment || [],
  );
  let PostCommentCount =
    commentCount?.find(el => el?.post_id == item?.id)?.commentCount ??
    item?.comments_count;
  const likedCount = useMemo(() => {
    return (
      likedPost.find(itm => itm?.post_id === item?.id)?.likesCount ??
      item?.likes_count
    );
  }, [likedPost, item]);

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
  const [dis, setDis] = useState<string[]>([])
  useEffect(() => {
    if (item?.description) {
      const tempDis = item.description.split(/(\s+)/)
      setDis(tempDis)
    }
  }, [item])
  if (!item) {
    return (
      <>
        <Loading
          style={{ width: '100%', marginBottom: responsiveScreenHeight(0.5) }}
        />
        <Loading
          style={{ width: '100%', marginBottom: responsiveScreenHeight(0.5) }}
        />
        <Loading
          style={{ width: '100%', marginBottom: responsiveScreenHeight(1) }}
        />
        <View style={{ width: '100%', aspectRatio: 2 / 1 }}>
          <Loading
            style={{
              width: '100%',
              height: '100%',
              marginBottom: responsiveScreenHeight(1),
            }}
          />
        </View>
        <View style={styles.metaWrapper}>
          <Loading
            style={{ width: '23%', marginBottom: responsiveScreenHeight(0.5) }}
          />
          <Loading
            style={{ width: '23%', marginBottom: responsiveScreenHeight(0.5) }}
          />
          <Loading
            style={{ width: '23%', marginBottom: responsiveScreenHeight(0.5) }}
          />
          <Loading
            style={{ width: '23%', marginBottom: responsiveScreenHeight(0.5) }}
          />
        </View>
      </>
    );
  }

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
  return (
    <>
      {item.description && (
        < >
          <Text
            onTextLayout={onTextLayout}
            numberOfLines={textShown ? undefined : 3}
            style={styles.description}>
            {dis.map((e) => {
              if (e.startsWith("#")) {
                return (
                  <>
                    <Text onPress={() => {
                      navigation.navigate(routes.POSTSEARCH, { search: e });
                    }} style={[styles.description, { color: colors.blueColor }]}>
                      {e}
                    </Text>
                  </>
                )
              }
              else {
                return e

              }
            })}
          </Text>

          {lengthMore ? (
            <TouchableOpacity onPress={toggleNumberOfLines}>
              <Text style={styles.seeMoreText}>
                {textShown ? 'See less' : 'See more'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
      <View style={{ height: responsiveScreenHeight(.8) }}>

      </View>
      {item?.media?.length > 0 && (
        <ImageRender
          key={'*'}
          item={item}
          isActiveIndex={isActiveIndex}
          // images={item?.media?.map(e => e.thumbnail? e.thumbnail:e.media) || []}
          images={item?.media?.map(e => e.media) || []}
          thumbnail={item?.media?.map(e => e.thumbnail || "")}
        />
      )}

      <View style={styles.metaWrapper}>
        {/* Comments */}
        <Pressable
          onPress={() => navigation.navigate(routes.POSTINFO, { id: item.id })}
          style={styles.metaItem}>
          <View style={[styles.iconWrapper, { width: responsiveScreenWidth(4), }]}>
            <Image source={imagePath.comment} style={styles.icon} />
          </View>
          <Text style={styles.metaText}>{PostCommentCount}</Text>
        </Pressable>

        {/* Likes */}
        <Pressable onPress={handleLike} style={styles.metaItem}>
          <View style={[styles.iconWrapper, { marginTop: verticalScale(-2) }]}>
            {!isLikedPost ? <Image
              source={imagePath.like}
              style={{
                ...styles.icon,
              }}
            /> :
              <Image
                source={imagePath.disLike}
                style={{
                  ...styles.icon,
                }}
              />}
          </View>
          <Text style={styles.metaText}>{likedCount}</Text>
        </Pressable>

        {/* Views */}
        <View style={styles.metaItem}>
          <View style={styles.iconWrapper}>
            <Image source={imagePath.view} style={styles.icon} />
          </View>
          <Text style={styles.metaText}>{item?.views_count}</Text>
        </View>

        {/* Share */}
        <Pressable onPress={() => {
          onShare();
        }} style={styles.metaItem}>
          <View style={[styles.iconWrapper, { width: responsiveScreenWidth(5.5), marginTop: verticalScale(-2) }]}>
            <Image source={imagePath.shear} style={styles.icon} />
          </View>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  description: {
    width: '100%',
    fontSize: responsiveScreenFontSize(1.8),
    color: colors.black,
  },
  metaWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsiveScreenHeight(1),
  },
  metaItem: {
    flexDirection: 'row',
    gap: responsiveScreenHeight(1),
  },
  iconWrapper: {
    width: responsiveScreenWidth(5),
    // maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,

  },
  icon: {
    backgroundColor: 'white',
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
  },
  metaText: {
    color: colors.secondaryText,
    fontFamily: fonts.poppins,
    fontSize: responsiveScreenFontSize(1.6),
  },
  seeMoreText: {
    color: '#007BFF',
    fontSize: responsiveScreenFontSize(1.6),
    marginTop: responsiveScreenHeight(.4)
  },
});
export { styles as PrstCompnonentStyle }
export default React.memo(PostComponentPart);
