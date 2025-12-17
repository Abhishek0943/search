import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch } from '../store';
import { BookmarkPost, bookmarkReducers } from '../reducer/jobsReducer';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../utils/Icon';
import { ThemeContext } from '../context/ThemeProvider';

const BookmarkButton = ({ post }: { post: Post }) => {
    const dispatch = useAppDispatch();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSentValue = useRef(post.isBookmarked
    );
    const { colors } = useContext(ThemeContext)
    const handleBookmark = useCallback(
        (isBookmarked
            : boolean) => {
            if (isBookmarked === undefined) return
            dispatch(BookmarkPost({
                _id: post._id, isBookmarked}))
                .unwrap()
                .then((res) => console.log("✅ Bookmark API Response:", res));
            lastSentValue.current = isBookmarked
                ;
        },
        [dispatch, post._id]
    );
    useEffect(() => {
        if (post.isBookmarked
            === lastSentValue.current) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            if (post.isBookmarked
                !== lastSentValue.current) {
                handleBookmark(post.isBookmarked
                );
            }
        }, 5000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [post.isBookmarked
        , handleBookmark]);
    return (
        <Pressable
            onPress={() => dispatch(bookmarkReducers({ _id: post._id }))}
            style={{flex:1,  flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}
        >
            <Icon
                icon={{
                    type: "Ionicons", name: post.isBookmarked?"bookmark":'bookmark-outline'
                }}
                style={{
                    color: post.isBookmarked
                        ? "#3B82F6" : colors.textSecondary,
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
                {post.bookmarksCount > 0 && post.bookmarksCount}
            </Text>
        </Pressable>
    );
};


export default BookmarkButton;
