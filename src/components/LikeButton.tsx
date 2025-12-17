import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch } from '../store';
import { LikePost, likeReducers } from '../reducer/jobsReducer';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../utils/Icon';
import { ThemeContext } from '../context/ThemeProvider';

 const LikeButton = ({ post }:{post:Post}) => {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentValue = useRef(post.isLiked);
  const { colors } = useContext(ThemeContext)

   const handleLike = useCallback(
    (isLiked: boolean) => {
      if (isLiked === undefined) return
      dispatch(LikePost({ _id: post._id , isLiked}))
        .unwrap()
        .then((res) => console.log("✅ Like API Response:", res));
      lastSentValue.current = isLiked;
    },
    [dispatch, post._id]
  );

  useEffect(() => {
    if (post.isLiked === lastSentValue.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (post.isLiked !== lastSentValue.current) {
        handleLike(post.isLiked);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [post.isLiked, handleLike]);
  return (
    <Pressable
      onPress={() => dispatch(likeReducers({ _id: post._id }))}
      style={{ flex:1, flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}
    >
      <Icon
        icon={{
          type: "Ionicons",
          name: post.isLiked ? "heart" : "heart-outline",
        }}
        style={{
          color: post.isLiked ? "red" : colors.textSecondary,
          marginTop: responsiveScreenHeight(0.1),
        }}
        size={responsiveScreenFontSize(1.8)}
      />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: responsiveScreenFontSize(1.4),
        }}
      >
        {post.likesCount > 0 && post.likesCount}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({})

export default LikeButton;
