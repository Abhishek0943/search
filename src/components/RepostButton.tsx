import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch } from '../store';
import { RepostPost, repostReducers } from '../reducer/jobsReducer';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../utils/Icon';
import { ThemeContext } from '../context/ThemeProvider';

 const RepostButton = ({ post }:{post:Post}) => {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentValue = useRef(post.isReposted);
  const { colors } = useContext(ThemeContext)

   const handleRepost = useCallback(
    (isReposted: boolean) => {
        console.log("start");
      if (isReposted === undefined) return
        console.log("done");

      dispatch(RepostPost({ _id: post._id , isReposted}))
        .unwrap()
        .then((res) => console.log("✅ Repost API Response:", res));
      lastSentValue.current = isReposted;
    },
    [dispatch, post._id]
  );

  useEffect(() => {
    if (post.isReposted === lastSentValue.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (post.isReposted !== lastSentValue.current) {
        handleRepost(post.isReposted);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [post.isReposted, handleRepost]);
  return (
    <Pressable
      onPress={() => dispatch(repostReducers({ _id: post._id }))}
      style={{ flex:1, flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}
    >
      <Icon
        icon={{
          type: "Lucide", name: "repeat-2"
        }}
        style={{
          color: post.isReposted ? "green" : colors.textSecondary,
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
        {post.repostCount > 0 && post.repostCount}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({})

export default RepostButton;
