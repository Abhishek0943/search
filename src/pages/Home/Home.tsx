import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { NavigationBar, } from '../../components';
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../../utils/Icon';
import { routes } from '../../constants/values';
import { useAppDispatch, useAppSelector } from '../../store';
import { Bookmark, GetBanners, GetJobs, ProfileData, toggleBookmark } from '../../reducer/jobsReducer';
import imagePath from '../../assets/imagePath';
import { formatSalaryRange } from '../../utils';
import Text from '../../components/Text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFCMToken } from '../../utils/notificationService';
import { Tokien } from '../../reducer/recruiterReducer';
import { CustomTextInput } from '../../components';
import { getApiCall, postApiCall } from '../../api';
function Home() {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { user } = useAppSelector(state => state.userStore)
  const { bookmarkedJobIds } = useAppSelector(state => state.jobsReducer)
  const [search, setSearch] = useState<string>("")
  const dispatch = useAppDispatch()
  const [jobs, setJobs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [meta, setMeta] = useState<any>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [sortBy, setSortBy] = useState('Newest')

  const fetchJobs = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await dispatch(GetJobs({ page: pageNum, search })).unwrap()
      if (res?.success) {
        const jobsList = res.data?.jobs || res.data || [];
        if (append) {
          setJobs(prev => [...prev, ...jobsList]);
        } else {
          setJobs(jobsList);
        }
        setMeta(res.data?.meta || null);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onLoadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, true);
  };
  useFocusEffect(
    useCallback(() => {
      const set = async () => {
        if (!user?.id) return
        const token = await AsyncStorage.getItem("FCM") as string
        if (token) return;
        const FCM = await getFCMToken()
        if (!FCM) return;
        const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
        await AsyncStorage.setItem("FCM", FCM)
        dispatch(Tokien({ device_token: FCM, device_type: Platform.OS, auth_type: a === "recruiter" ? "company" : "user", auth_id: user?.id }))
      }
      set()
    }, [user?.id])
  )
  useEffect(() => {
    fetchJobs(1, true);
  }, [user?.id]);
  useBlockBack()
  return (
    <>
      <NavigationBar statusbar={user?.id ? true : false} name={routes.HOME} onPress={() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      }}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, }}
          onScroll={({ nativeEvent }) => {
            const paddingToBottom = 1000;
            const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;
            if (isCloseToBottom) {
              onLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={{ paddingHorizontal: responsiveScreenWidth(5), paddingTop: responsiveScreenHeight(1), paddingBottom: responsiveScreenHeight(1) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: responsiveFontSize(3), fontWeight: '800', color: colors.textPrimary }}>Jobs for you</Text>
              <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { filter: true })} style={{ width: responsiveScreenWidth(7), aspectRatio: 1 }}>
                <Image source={imagePath.Filter} style={{ width: "100%", height: "100%", resizeMode: 'contain' }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ paddingHorizontal: responsiveScreenWidth(5), marginTop: responsiveHeight(.5), marginBottom: responsiveScreenHeight(1.5) }}>
            <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { search: true })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(1.5), borderWidth: 1, borderColor: '#E5E7EB' }}>
              <Image source={imagePath.SearchIcon} style={{ width: responsiveScreenWidth(5), height: responsiveScreenWidth(5), resizeMode: 'contain', tintColor: '#9CA3AF', marginRight: responsiveScreenWidth(2) }} />
              <Text style={{ fontSize: responsiveFontSize(1.9), color: colors.textSecondary, fontWeight: "600" }}>Search bar, kitchen, retail...</Text>
            </TouchableOpacity>
          </View>

          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: responsiveScreenWidth(5), gap: responsiveScreenWidth(2), marginBottom: responsiveScreenHeight(1.5) }}>
            {['Near me', 'Evenings', 'Casual', 'Any pay'].map((filter) => {
              const isActive = activeFilters.includes(filter);
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => {
                    if (isActive) {
                      setActiveFilters(prev => prev.filter(f => f !== filter));
                    } else {
                      setActiveFilters(prev => [...prev, filter]);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: responsiveScreenWidth(4),
                    paddingVertical: responsiveScreenHeight(1),
                    borderRadius: 24,
                    backgroundColor: isActive ? colors.textPrimary : colors.white,
                    borderWidth: 1,
                    borderColor: isActive ? colors.textPrimary : '#D1D5DB',
                    gap: responsiveScreenWidth(1.5),
                  }}
                >
                  <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '600', color: isActive ? colors.white : '#374151' }}>{filter}</Text>
                  {isActive && (
                    <Icon icon={{ type: 'MaterialIcons', name: 'close' }} size={14} style={{ color: colors.white }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView> */}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: responsiveScreenWidth(5), marginBottom: responsiveScreenHeight(1.5) }}>
            <Text style={{ fontSize: responsiveFontSize(1.7), color: colors.textSecondary }}>
              {jobs.length > 0 ? `${meta?.total || jobs.length} jobs near you` : 'Finding jobs...'}
            </Text>
            <TouchableOpacity onPress={() => setSortBy(sortBy === 'Newest' ? 'Closest' : 'Newest')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.primary }}>{sortBy}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ flex: 1, marginTop: responsiveScreenHeight(15), alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : jobs.length > 0 ? (
            <View style={{ paddingHorizontal: responsiveScreenWidth(5) }}>
              {jobs.map((job: any, index: number) => {
                const isBookmarked = bookmarkedJobIds[job.id] ?? job.is_favorited;
                const companyName = job?.company_info?.name || '';
                const initials = companyName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                const avatarColors = ['#2563EB', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0891B2'];
                const avatarBg = avatarColors[index % avatarColors.length];
                const closingText = job?.expiredAt ? (() => {
                  const now = new Date();
                  const expiry = new Date(job.expiredAt);
                  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) return 'Closed';
                  if (diffDays === 0) return 'Closes today';
                  return `Closes in ${diffDays} days`;
                })() : null;

                return (
                  <Pressable
                    key={"jobsearchPage" + index}
                    onPress={() => navigation.navigate(routes.JOBDETAIL, { id: job.id })}
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: 20,
                      padding: responsiveScreenWidth(4),
                      marginBottom: responsiveScreenHeight(1.2),
                      borderWidth: 1,
                      borderColor: colors.gray,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveScreenHeight(1) }}>
                      {job?.company_info?.image ? (
                        <View style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.gray, marginRight: responsiveScreenWidth(3) }}>
                          <Image source={{ uri: job.company_info.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>
                      ) : (
                        <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: avatarBg, alignItems: 'center', justifyContent: 'center', marginRight: responsiveScreenWidth(3) }}>
                          <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>{initials}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{
                          fontSize: responsiveFontSize(1.7), fontWeight: '700', color:
                            colors.primary2
                        }}>{companyName}</Text>
                        {job?.jobLocation && (
                          <Text numberOfLines={1} style={{ fontSize: responsiveFontSize(1.7), color: colors.textSecondary, marginTop: 2 }}>{job.jobLocation}</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => {
                        dispatch(toggleBookmark({ id: job.id, is_favorited: isBookmarked }))
                        dispatch(Bookmark({ id: job.id }))
                      }} style={{ width: responsiveWidth(5), aspectRatio: 1 }}>
                        <Image source={isBookmarked ? imagePath.Bookmarked : imagePath.Bookmark} style={{ resizeMode: "contain", width: "100%", height: "100%" }} />
                      </TouchableOpacity>
                    </View>

                    <Text numberOfLines={1} style={{ fontSize: responsiveFontSize(2.1), fontWeight: '700', color: colors.textPrimary, marginBottom: responsiveScreenHeight(0.5) }}>{job?.title}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: responsiveScreenHeight(1) }}>
                      {!job?.is_hide_salary && job?.salary && job?.salary_period && (
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.primary }}>
                          {job.salary_currency}{formatSalaryRange(job.salary)} / {job.salary_period}
                          {job?.jobType && (
                            !job?.is_hide_salary && job?.salary ? ' · ' + job.jobType : job.jobType
                          )}
                        </Text>
                      )}
                      {closingText && (
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.primary, marginLeft: 'auto' }}>
                          {closingText}
                        </Text>
                      )}
                    </View>
                    {
                      (job?.functionalArea || job?.highlights?.length > 0) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveScreenWidth(2) }}>
                          {job?.functionalArea && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: responsiveScreenWidth(2.5), paddingVertical: responsiveScreenHeight(0.4), borderRadius: 8, gap: 4 }}>
                              <Image source={imagePath.Check2} tintColor={colors.primary} style={{ resizeMode: "contain", width: responsiveWidth(3), height: responsiveWidth(3) }} />
                              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.primary, fontWeight: '500' }}>{job.functionalArea}</Text>
                            </View>
                          )}
                          {(job?.highlights || []).slice(0, 2).map((tag: string, idx: number) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: responsiveScreenWidth(2.5), paddingVertical: responsiveScreenHeight(0.4), borderRadius: 8, gap: 4 }}>
                              <Image source={imagePath.Check2} tintColor={colors.primary} style={{ resizeMode: "contain", width: responsiveWidth(3), height: responsiveWidth(3) }} />
                              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.primary, fontWeight: '500' }}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )
                    }
                  </Pressable>
                );
              })}
              {loadingMore && <ActivityIndicator size="small" style={{ marginVertical: responsiveScreenHeight(2) }} color={colors.primary} />}
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', marginTop: responsiveScreenHeight(10) }}>
              {/* <Icon icon={{ type: 'MaterialIcons', name: 'work-outline' }} size={48} style={{ color: '#D1D5DB', marginBottom: responsiveScreenHeight(2) }} />
              <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600', color: '#6B7280' }}>No jobs found</Text>
              <Text style={{ fontSize: responsiveFontSize(1.6), color: '#9CA3AF', marginTop: responsiveScreenHeight(0.5) }}>Try adjusting your filters</Text> */}
            </View>
          )}
          <View style={{ height: responsiveScreenHeight(3) }} />
        </ScrollView>
      </NavigationBar >
    </>
  );
}

export function useBlockBack() {
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      const unsub = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault()
      })
      let backSub: any
      if (Platform.OS === 'android') {
        backSub = BackHandler.addEventListener('hardwareBackPress', () => true)
      }
      return () => {
        unsub()
        backSub?.remove?.()
      }
    }, [navigation])
  )
}
export default Home;


const styles = StyleSheet.create({});