import React, { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth
} from 'react-native-responsive-dimensions';
import imagePath from '../constants/imagePath';
import { lightColors } from '../constants/values';
import { useAppSelector } from '../store';
import Loading from './Loading';
import { moderateScale, verticalScale } from '../styles/scaling';
import { useSelector } from 'react-redux';
// import { Image } from 'react-native-svg';
const colors = lightColors;

const HeaderScrollBar = ({ list, page = 0, onPressMyStory, onPressStory }) => {
  const sorySCreenIds = useSelector((state: any) => state.posts?.storySeenIds);
  const ref = useRef<FlatList>(null);
  useEffect(() => {
    ref.current?.scrollToIndex({
      index: page,
      animated: true,
      viewPosition: 0.5,
    });
  }, [page]);
  const { user } = useAppSelector(state => state.userStore);
  return (
    <FlatList
      // ref={ref}
      data={list && list?.length > 0 ? list : [...new Array(7)]}
      contentContainerStyle={{
        gap: responsiveScreenWidth(2.5),
        justifyContent: 'flex-start',
        marginHorizontal: responsiveScreenWidth(2),
        // flex:1,
      }}
      style={{}}
      keyExtractor={(item, index) => `routesdfdsafadsfdsf${index}`}
      horizontal
      scrollEnabled={true}
      bounces={false}
      initialScrollIndex={0}
      showsHorizontalScrollIndicator={false}
      onScrollToIndexFailed={info => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          ref.current?.scrollToIndex({
            index: info.highestMeasuredFrameIndex,
            animated: true,
          });
        });
      }}
      renderItem={({ item, index }: { item: string; index: number }) => {
        const isSeeenStory =
          item?.is_seen === true ||
          (Array.isArray(item?.stories) &&
            item.stories.length > 0 &&
            item.stories.every((story: any) => sorySCreenIds.includes(story.id)));


        if (!item) {
          return (
            <Loading
              style={{
                width: responsiveScreenWidth(20),
                aspectRatio: 1,
                borderRadius: 100,
              }}
            />
          );
        }
        if (index === 0) {
          if (item?.id === user?.id) {
            return (
              <StoryItem
                imageUri={user?.profile_image}
                name={user.name}
                onPressImage={() => onPressStory(item)}
                onPressAdd={onPressMyStory}
                showAddButton={true}
                isSeen={isSeeenStory}
              />
            );
          }
          else if (!item?.id) {
            return (
              <StoryItem
                imageUri={user?.profile_image}
                name={user.name}
                onPressImage={onPressMyStory}
                onPressAdd={onPressMyStory}
                showAddButton={true}
                isSeen={false}
                border={0}
              />
            );
          }
          return (
            <>
              <StoryItem
                imageUri={user?.profile_image}
                name={user.name}
                onPressImage={onPressMyStory}
                onPressAdd={onPressMyStory}
                showAddButton={true}
                isSeen={isSeeenStory}
                border={0}

              />
              <View style={{ width: responsiveScreenWidth(2) }}></View>
              <StoryItem
                imageUri={item?.photo}
                name={item?.name}
                onPressImage={() => onPressStory(item)}
                onPressAdd={() => { }}
                showAddButton={false}
                isSeen={isSeeenStory}
              />
            </>
          );
        }
        return (
          <StoryItem
            imageUri={item?.photo}
            name={item?.name}
            onPressImage={() => onPressStory(item)}
            onPressAdd={() => { }}
            showAddButton={false}
            isSeen={isSeeenStory}
          />
        );
      }}
      ListFooterComponent={() => {
        return (
          <View></View>
        )
      }}
    />
  );
};
const style = StyleSheet.create({
  main: {
    aspectRatio: 1,
    borderRadius: '50%',
    width: responsiveScreenWidth(20),
    borderColor: "#3793f6",
  },
  img: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 100,
    backgroundColor: colors.gray,
  },
});
export default HeaderScrollBar;
const StoryItem = ({
  imageUri,
  name,
  onPressImage,
  onPressAdd,
  showAddButton = false,
  isSeen = false,
  border
}) => {
  return (
    <View style={{ gap: responsiveScreenHeight(0.2), alignItems: 'center', }}>
      <View style={[style.main, { position: 'relative', borderColor: 'white' }]}>
        <Pressable
          onPress={onPressImage}
          style={[
            style.main,
            {
              width: responsiveScreenWidth(20),
              borderWidth: border===0 ? 0:4,
              borderColor: isSeen ? '#ccc' : '#3793f6',
              overflow: 'hidden',
              margin: 'auto',
            },
          ]}
        >
          <Image style={style.img} source={{ uri: imageUri }} />
        </Pressable>

        {showAddButton && (
          <Pressable
            onPress={onPressAdd}
            style={{
              backgroundColor:  '#3793f6',
              borderWidth: 2,
              borderColor: colors.white,
              position: 'absolute',
              right: moderateScale(-2),
              bottom: verticalScale(4),
              borderRadius: 100,
              width: moderateScale(24),
              aspectRatio:1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              style={{
                width: moderateScale(12),
                height: verticalScale(12),
                resizeMode: 'contain',
                tintColor: colors.white,
              }}
              source={imagePath.add}
            />
          </Pressable>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={{
          fontSize: responsiveScreenFontSize(1.8),
          maxWidth: responsiveScreenWidth(18),
          width:"100%",
          textAlign: 'center',
        }}
      >
        {name}
      </Text>
    </View>
  );
};