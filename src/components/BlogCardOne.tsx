import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import imagePath from '../constants/imagePath';
import { fonts, lightColors, routes } from '../constants/values';
import Loading from './Loading';
import { useAppSelector } from '../store';
import FastImage from 'react-native-fast-image';
import { homeStyle2 } from '../pages/Home/Style';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import colors from '../styles/colors';
interface BlogCardOneProps {
  item?: Article;
  imageAligment?: 'horizontal' | 'vertical';
  onBookmarkPress?: (item: Article) => void;
}

const BlogCardOne: React.FC<BlogCardOneProps> = React.memo(
  ({ item, imageAligment = 'horizontal', onBookmarkPress }) => {
    const navigation = useNavigation();
    const colors = lightColors;
    const isHorizontal = imageAligment === 'horizontal';
    const userBookmarks = useSelector((state: any) => state.posts?.BookMarkPost || []);
    const { user } = useAppSelector(state => state.userStore);
    const isPostBookMarked = useMemo(() => {
      return (
        userBookmarks?.find(el => el?.post_id == item?.id)?.is_bookmarked ??
        item?.is_bookmarked
      );
    }, [userBookmarks, item?.id, item?.is_bookmarked]);

    const handleNavigate = useCallback(() => {
      if (item?.url) {
        navigation.navigate(routes.WEBVIEWSCREEN, {
          url: `${item?.url}?user_id=${user.id}`,
          title: 'News',
        });
      }
    }, [item?.url, user.id]);

    const handleBookmarkPress = useCallback(() => {
      if (item && onBookmarkPress) {
        onBookmarkPress(item);
      }
    }, [item, onBookmarkPress]);

    if (!item) {
      return (
        <View style={[styles.container, isHorizontal && styles.rowLayout, { alignItems: 'center' }]}>
          <View
            style={[
              styles.imageContainer,
              isHorizontal ? styles.horizontalImage : styles.verticalImage,
              { marginTop: !isHorizontal ? responsiveScreenHeight(2) : 0 },
            ]}>
            <Loading style={styles.image} />
          </View>
          <Pressable
            style={{
              gap: responsiveScreenHeight(0.5),
              marginTop: !isHorizontal ? responsiveScreenHeight(1) : 0,
            }}>
            <Loading />
            <Loading style={{ width: responsiveScreenWidth(100) }} />
            <Loading />
            <Loading style={{ height: responsiveScreenHeight(3) }} />
          </Pressable>
        </View>
      );
    }

    return (
      <>
      <View style={[styles.container, isHorizontal && styles.rowLayout,]}>
        <Pressable
          onPress={handleNavigate}
          style={[styles.imageContainer, isHorizontal ? styles.horizontalImage : styles.verticalImage,]}>
          <FastImage
            source={{
              uri: item?.image || undefined,
            }}
            style={styles.image}
          // defaultSource={imagePath.profile_fill}
          />
        </Pressable>

        <Pressable
          onPress={handleNavigate}
          // accessibilityLabel={`Open blog titled ${item?.title}`}
          // style={[imageAligment === 'horizontal' && styles.content, {borderWidth:1,flex:1, gap: responsiveScreenHeight(0.3) }]}
          style={{ backgroundColor: "white", borderWidth: 1, borderColor: "white", flex: 1, gap: responsiveScreenHeight(0.3), }}
        >
          <Text style={[styles.category]}>
            {item?.topic}
          </Text>
          <Text numberOfLines={2} style={[styles.title, { color: colors.maintext }]}>
            {item?.title || item?.description}
          </Text>

          <View style={styles.metaContainer}>
            <Pressable onPress={() => {
              navigation.navigate(routes.PAGE, { id: item?.user?.id });
            }} style={styles.metaLeft}>
              {!!item?.user?.profile_image && (
                <View style={styles.profileImageContainer}>
                  <Image source={{ uri: item?.user?.profile_image }} style={styles.image} />
                </View>
              )}
              <Text
                numberOfLines={1}
                style={[styles.metaText, { color: colors.black, maxWidth: responsiveScreenWidth(30) }]}>
                {item?.user?.name}
              </Text>
              {item?.user?.tick === 'blue' && (
                <MaterialIcons name="verified" color={"#006fff"} style={{ fontSize: responsiveScreenFontSize(1.2), marginLeft: -responsiveScreenWidth(.5) }} />

              )}
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {item?.created_at}
              </Text>
            </Pressable>

            <Pressable onPress={handleBookmarkPress} style={styles.bookmarkButton}>
              <Image
                style={styles.bookmarkIcon}
                source={
                  isPostBookMarked ? imagePath.active_bookmark : imagePath.bookmark
                }
              />
            </Pressable>
          </View>
        </Pressable>



      </View>
      <View style={{width:responsiveScreenWidth(100), height:responsiveScreenHeight(.1), backgroundColor:colors.lightGray, marginBottom:responsiveScreenHeight(1),marginLeft:-responsiveScreenWidth(2) }}></View>
      </>
    );
  }
);

export default BlogCardOne;

const styles = StyleSheet.create({
  container: {
    gap: responsiveScreenWidth(2),
    marginBottom: 6,

  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',

  },
  blueTickWrapper: {
    width: responsiveScreenWidth(3.2),
    maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 1
  },
  horizontalImage: {
    width: responsiveScreenWidth(24),
    aspectRatio: 1,
  },
  verticalImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    backgroundColor: colors.lightGray
  },
  content: {
    flex: 1,
  },
  category: {
    fontFamily: fonts.poppinsB,
    fontSize: responsiveScreenFontSize(1.5),
    color: colors.black
  },
  title: {
    fontFamily: fonts.poppins,
    fontSize: responsiveScreenFontSize(1.6),

  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: responsiveScreenWidth(.5),
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveScreenWidth(1)
  },
  profileImageContainer: {
    width: responsiveScreenWidth(6),
    maxWidth: 25,
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 100,
    borderWidth: .2,
    borderColor: colors.black
  },
  clockIconContainer: {
    width: responsiveScreenWidth(3),
    marginLeft: responsiveScreenWidth(1),
    maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,
    marginBottom: responsiveScreenHeight(0.2),
  },
  metaText: {
    fontWeight: "600",
    fontSize: responsiveScreenFontSize(1.4),
    textTransform: "capitalize"
  },
  bookmarkButton: {
    marginLeft: responsiveScreenWidth(4),
  },
  bookmarkIcon: {
    height: responsiveScreenWidth(5),
    width: responsiveScreenWidth(5),
    resizeMode: 'contain',
  },
});
