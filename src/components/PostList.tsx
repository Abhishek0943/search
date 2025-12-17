import React, { useContext, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { GetPost } from '../reducer/jobsReducer';
import { ThemeContext } from '../context/ThemeProvider';
import PostComponent from './PostComponent';

const PostList = () => {
  const dispatch = useAppDispatch()
  const { colors } = useContext(ThemeContext)
  const { postIds, postObject } = useAppSelector((state) => state.postStore.posts)
  useEffect(() => {
    dispatch(GetPost())
  }, []);
  return (
    <View style={{}}>
      <FlatList
        data={postIds}
        keyExtractor={(key) => key}
        renderItem={({ item, index }) => {
          const post = postObject[item]
          if (!post) { return <></> }
          return (
            <PostComponent post={post} />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({})

export default PostList;
