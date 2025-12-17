import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { fonts, lightColors } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ArticelRender, BlogCardOne, HomeHeaderScrollBar, Loading, PostComponentTwo } from '../../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiCall } from '../../api';
import { addBookmMarkdPost } from '../../reducer/jobsReducer';
import { useDispatch } from 'react-redux';
import usePostData from '../../hooks/usePostData';
import { useFocusEffect } from '@react-navigation/native';
import imagePath from '../../constants/imagePath';
import { useCustomQuery } from '../../hooks/useCustomQuery';
import WrapperContainer from '../../components/WrapperContainer';
import { height } from '../../styles/scaling';

const colors = lightColors
const Bookmark = ({ navigation }: any) => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [page2, setPage2] = useState(0);
    const [isRepostLoading, setIsReportLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const dispatch = useDispatch();

  const removeDuplicates = (data: any) => {
    const uniqueDataMap = new Map();
    data?.forEach((item: any) => {
      if (!uniqueDataMap.has(item.id)) {
        uniqueDataMap.set(item.id, item);
      }
    });
    return Array.from(uniqueDataMap.values());
  };

  const {
    isRefetching,
    data: bookmarkData,
    isLoading: bookmarkDataLoading,
    refetch: getBookmarks,
  } = useCustomQuery(`bookmark-articles?type=${page2 == 0 ? 'post' : 'article'}&search=${search}&page=${currentPage}`);



 

  useEffect(() => {
    if (bookmarkData?.success && bookmarkData?.data) {
      console.log("==============bookmarkData", bookmarkData)
      setNews(prev =>
        currentPage === 1
          ? bookmarkData?.data
          : removeDuplicates([...prev, ...bookmarkData?.data]),
      );
      if (bookmarkData?.data?.length === 0 || bookmarkData?.data.length < 10) {
        setHasMorePosts(false);
      }
    }
  }, [bookmarkData]);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        setCurrentPage(1);
        getBookmarks();
      }, 1000);

    }, [search, navigation,])
  );

  useEffect(() => {
    setCurrentPage(1);
    // setNews([])
    setTimeout(() => {
      getBookmarks();
    }, 200);
  }, [page2])



  const { mutate: onBookmarkPress } = usePostData<Error>(
    '/bookmark',
    'post',
    {
      onSuccess: async (res) => {
        if (res?.data) {
          const data = {
            post_id: res?.data?.blog_id,
            is_bookmarked: res?.data?.is_bookmark,
          };
          getBookmarks()
          dispatch(addBookmMarkdPost(data));
        }
      },
      onError: async (error: any) => {
        console.log(error, 'error in bookmark');
      },
    },
  );

  const bookmarkPress = (item: any) => {
    onBookmarkPress({ blog_id: item?.id });
  };

  const renderEmptyBookmarks = () => {
    const showNoBookmarks = !search && (!bookmarkDataLoading || !isRefetching);
    const showNoMatch = search && !bookmarkDataLoading && !isRefetching;
    const showLoading = ((bookmarkDataLoading || isRefetching) && currentPage ==1)
  
    return (
      <View style={{ alignItems: 'center', justifyContent:"center",height:height/1.5 }}>
        {showNoBookmarks && (
          <>
             <Text style={{ fontSize: responsiveScreenFontSize(3),fontWeight:"900", color: colors.black }}>
              Save posts for later
            </Text>
            <Text style={{ fontSize: 16, color: colors.secondaryText }}>
              Looks like you haven’t saved any posts.
            </Text>
          </>
        )}
  
        {showNoMatch && (
          <Text style={{ fontSize: 16, color: colors.secondaryText }}>
            Sorry! No match found
          </Text>
        )}
      </View>
    );
  };
  

  const handleRefresh = () => {
    setCurrentPage(1);
    // setNews([]);
   setTimeout(() => {
    getBookmarks();
   }, 100);
  };

  // const loadMoreData = () => {
  //   if (!isFetchingMore && hasMore && (!!search && news?.length < 10)) {
  //     setIsFetchingMore(true);
  //     setCurrentPage(prev => prev + 1);
  //   }
  // };
  const loadMoreData = () => {
    if (!bookmarkDataLoading && hasMorePosts && !!bookmarkData) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const removeBookMark = (el) =>{
    setNews(prev => prev.filter(i => i?.id != el))
  }

  const renderPosts = useCallback(
    ({ item, index }: { item: number, index: number }) => (
      <PostComponentTwo
        refetchData={()=>removeBookMark(item)}
        isMenuOption={true}
        index={index}
        item={item}
        setIsReportLoading={setIsReportLoading}
      />
    ),
    []
  );

  if (bookmarkDataLoading && !search && currentPage == 1 && page2 == 0) {
    return (
      <>
        <View style={{ marginVertical: 20 }}>
          <Loading style={{ width: '30%', height: responsiveScreenHeight(4), marginLeft: 20 }} />
          <Loading style={{ width: '90%', marginTop: responsiveScreenHeight(2), height: responsiveScreenHeight(4), marginLeft: 20 }} />
        </View>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          ItemSeparatorComponent={() => <View style={{ height: responsiveScreenHeight(2) }} />}
          renderItem={() => (
            <Loading style={{ height: responsiveScreenHeight(14), width: '90%', alignSelf: 'center' }} />
          )}
        />
      </>
    );
  }

  return (
    <WrapperContainer 
    // isLoading={isRefetching} 
    style={bookmarkStyle.container}>
      <View style={{paddingHorizontal:responsiveScreenWidth(3)}}>

      <Text style={bookmarkStyle.heading}>Bookmark</Text>

      <View style={bookmarkStyle.searchWrapper}>
        <Image source={imagePath.search} />
        <TextInput
          value={search}
          onChangeText={(e) => {
            setSearch(e);
            setCurrentPage(1);
            setNews([]);
          }}
          placeholder="Search"
          placeholderTextColor={colors.maintext}
          style={bookmarkStyle.searchInput}
        />
      </View>

      <View style={{ marginBottom: responsiveScreenHeight(2) }}>
        <HomeHeaderScrollBar
          width="full"
          // setPage={(val: number) => {
          //   setPage2(val);
          //   setCurrentPage(1);
          //   setNews([]);
          // }}
          page={page2}
          setPage={setPage2}
          list={['Posts', 'Articles']}
        />
      </View>

      {page2 === 1 ? (
        <FlatList
          data={news}
          showsVerticalScrollIndicator={false}
          style={bookmarkStyle.list}
          contentContainerStyle={bookmarkStyle.listContent}
          keyExtractor={(item, index) => index?.toString()}
          ListEmptyComponent={renderEmptyBookmarks}
          renderItem={({ item, index }) => (
            <BlogCardOne onBookmarkPress={bookmarkPress} item={item} index={index} />
          )}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => (
            <View style={{height:responsiveScreenHeight(20), width:'auto' ,}} >
               </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
            />
          }
        />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderPosts}
          style={bookmarkStyle.flatlist}
          contentContainerStyle={bookmarkStyle.flatlistGap}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={0}
          scrollEventThrottle={16}
          // onViewableItemsChanged={onViewableItemsChanged}
          // viewabilityConfig={viewabilityConfig}
          removeClippedSubviews={true}
          disableIntervalMomentum={true}
          maxToRenderPerBatch={5}
          ListEmptyComponent={renderEmptyBookmarks}
          windowSize={5}
          initialNumToRender={5}
          updateCellsBatchingPeriod={50}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <>
              {hasMorePosts ? <View style={{ height: responsiveScreenHeight(10) }} >
                <ActivityIndicator size={'large'} color={'black'} />
              </View> : <View style={{height:responsiveScreenHeight(20), width:'auto' ,}} >
              </View> }
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
       
      )}
      </View>

    </WrapperContainer>
  );
};

export default Bookmark

const bookmarkStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
    paddingHorizontal: responsiveScreenWidth(2.5),
  },
  heading: {
    fontSize: responsiveScreenFontSize(4),
    marginTop: responsiveScreenHeight(2),
    fontFamily: fonts.poppinsSM,
  },
  searchWrapper: {
    borderWidth: 1,
    marginBottom: responsiveScreenHeight(2),
    borderColor: colors.maintext,
    borderRadius: 7,
    flexDirection: 'row',
    paddingHorizontal: responsiveScreenWidth(2),
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: colors.maintext,
    fontSize: responsiveScreenFontSize(1.8),
    height: responsiveScreenHeight(5)
  },
  list: {
    paddingTop: responsiveScreenHeight(1),
    flexGrow: 0,
  },
  listContent: {
    gap: responsiveScreenHeight(2.2),
  },
  flatlist: {
    flexGrow: 0,
    marginBottom: responsiveScreenHeight(2),
    gap: responsiveScreenHeight(1.5),
  },
  flatlistGap: {
    gap: responsiveScreenHeight(1.5),
  },
});
