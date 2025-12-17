import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from 'react-native';
import React from 'react';
import {
  responsiveHeight,
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import BlogCardOne from './BlogCardOne';
import imagePath from '../constants/imagePath';
import {homeStyle} from '../pages/Home/Style';
import {homeHeaderScrollBar} from './PageSlider';
import {lightColors, routes} from '../constants/values';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store';
import {addBookmMarkdPost} from '../reducer/jobsReducer';
import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import usePostData from '../hooks/usePostData';
import {useCustomQuery} from '../hooks/useCustomQuery';
import {useQuery} from '@tanstack/react-query';
import {getApiCall} from '../api';
import Loading from './Loading';
import {showError} from '../utils/helperFunctions';
const colors = lightColors;
const ArticelRender = ({type, imageAligment, userId}) => {
  const [newsList, setNewsList] = useState<any[]>([...new Array(5)]);
  const [newsPage, setNewsPage] = useState(1);
  const [page, setPage] = useState(0);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const ref = useRef<FlatList>(null);
  const {user} = useAppSelector(state => state.userStore);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch();
  const [newIndex, setNewIndex] = useState(0);
  const {
    data: newsResponse,
    isLoading,
    refetch: refetchNews,
    isError,
    error,
  } = useQuery({
    queryKey: [`news ${page} ${userId}`, user?.id, page, newsPage],
    queryFn: async () => {
      let res;
      if (userId) {
        res = await getApiCall(`/news?user_id=${userId}&page=${newsPage}`);
      } else {
        res = await getApiCall(`/news?topic_id=${page}&page=${newsPage}`);
      }
      return res;
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchNews();
    }, [page, newsPage, userId]),
  );
  useEffect(() => {
    setNewsList([]);
    setNewsPage(0);
  }, [userId]);
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
  const {data: homeResponse} = useCustomQuery('home');
  const {
    mutate: onBookmarkPress,
    isError: isErrorMutation,
    error: errorMutation,
  } = usePostData<Error>('/bookmark', 'post', {
    onSuccess: async res => {
      if (res?.data) {
        const data = {
          post_id: res?.data?.blog_id,
          is_bookmarked: res?.data?.is_bookmark,
        };
        dispatch(addBookmMarkdPost(data));
      }
    },
    onError: async (error: any) => {},
  });
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
  const bookmarkPress = (item: any) => {
    onBookmarkPress({blog_id: item?.id});
  };
  const onEndReached = () => {
    if (hasMoreNews && !isLoading) {
      setNewsPage(prev => prev + 1);
    }
  };
  // useEffect(() => {
  //   if (!isNewsLoading) {
  //   }
  // }, [isNewsLoading]);
  useEffect(() => {
    if (newsResponse) {
      setNewsList(prev => {
        return newsPage === 1
          ? newsResponse.data
          : removeDuplicates([...prev, ...newsResponse.data]);
      });
      if (newsResponse?.data?.length < 10) {
        setHasMoreNews(false);
      }
    }
  }, [newsResponse]);

  const categoryList =
    homeResponse?.data?.topics && homeResponse?.data?.topics?.length >= 1
      ? [{name: 'All', id: 0}, ...homeResponse?.data?.topics]
      : [...new Array(7)];
  const handlePress = (index: number, item?: number) => {
    if (index !== newIndex) {
      setNewsPage(1);
      setNewsList([...new Array(5)]);
    }
    setNewIndex(index);
    if (setPage) {
      setPage(item ?? index);
    }
  };
  useEffect(() => {
    return () => {
      setNewsList([...new Array(5)]);
    };
  }, []);
  useEffect(() => {
    ref.current?.scrollToIndex({
      index: newIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [newIndex]);
  return (
    <>
      {type === 'home' && (
        <>
          <View style={homeStyle.sectionHeader}>
            <Text style={homeStyle.sectionTitle}>Trending</Text>
            <Text
              onPress={() => navigation.navigate(routes.TRANDING)}
              style={homeStyle.seeAll}>
              See all
            </Text>
          </View>
          <BlogCardOne
            onBookmarkPress={() =>
              bookmarkPress(homeResponse?.data?.trending_article)
            }
            imageAligment="vertical"
            item={homeResponse?.data?.trending_article}
          />
          <View
            style={[
              homeStyle.sectionHeader,
              {marginTop: responsiveScreenHeight(1)},
            ]}>
            <Text style={homeStyle.sectionTitle}>Latest</Text>
            <Text style={homeStyle.seeAll}></Text>
          </View>
          <View
            style={{
              marginBottom: responsiveScreenHeight(1),
              justifyContent: 'center',
            }}>
            <FlatList
              ref={ref}
              data={categoryList}
              contentContainerStyle={{
                gap: responsiveScreenWidth(2.5),
                justifyContent: 'center',
              }}
              keyExtractor={(item, index) => `route${index}`}
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={page}
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  ref.current?.scrollToIndex({
                    index: info.highestMeasuredFrameIndex,
                    animated: true,
                  });
                });
              }}
              renderItem={({
                item,
                index,
              }: {
                item: {id: number; name: string}[];
                index: number;
              }) => {
                const isActive = newIndex === index;
                if (!item) {
                  return (
                    <Loading
                      style={{
                        width: responsiveScreenWidth(20),
                        marginTop: responsiveScreenHeight(1),
                      }}
                    />
                  );
                }
                return (
                  <Pressable
                    onPress={() => handlePress(index, item?.id)}
                    style={[
                      homeHeaderScrollBar.pressable,
                      isActive && {
                        borderBottomWidth: 3,
                        borderColor: colors.activeColor,
                      },
                    ]}>
                    <Text
                      style={[
                        homeHeaderScrollBar.text,
                        {
                          color: isActive
                            ? colors.maintext
                            : colors.secondaryText,
                        },
                      ]}>
                      {item?.name}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </>
      )}
      {newsList.length < 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: responsiveHeight(10),
          }}>
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
      ) : (
        <FlatList
          data={newsList}
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={homeStyle.flatlistLoading}
          contentContainerStyle={homeStyle.flatlistGapLarge}
          keyExtractor={(item, index) => index?.toString()}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: responsiveHeight(10),
              }}>
              {!isLoading &&  (
                <>
                  <Text
                    style={{
                      fontSize: responsiveScreenFontSize(3),
                      fontWeight: '900',
                      color: colors.black,
                    }}>
                    You don't have any Articles yet
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveScreenFontSize(2),
                      color: Colors.secondaryText,
                      textAlign: 'center',
                    }}>
                    No data found
                  </Text>
                </>
              )}
            </View>
          )}
          renderItem={({item}) => (
            <BlogCardOne
              imageAligment={imageAligment}
              key={item?.id?.toString()}
              onBookmarkPress={bookmarkPress}
              item={item}
            />
          )}
          onEndReached={onEndReached}
          ListFooterComponent={() => (
            <>
              {isLoading && (
                <View style={{height: responsiveScreenHeight(10)}}>
                  <ActivityIndicator
                    size={'large'}
                    color={Colors.activeColor}
                  />
                </View>
              )}
            </>
          )}
        />
      )}
    </>
  );
};

export default ArticelRender;

const removeDuplicates = (data: any) => {
  const uniqueDataMap = new Map();
  data?.forEach((item: any) => {
    if (!uniqueDataMap.has(item?.id)) {
      uniqueDataMap.set(item?.id, item);
    }
  });
  return Array.from(uniqueDataMap.values());
};
