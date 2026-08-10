import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { NavigationBar, } from '../../components';
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../../utils/Icon';
import { routes } from '../../constants/values';
import { useAppDispatch, useAppSelector } from '../../store';
import { Bookmark, GetBanners, GetRecentJobs, GetSuggestedJobs, ProfileData, toggleBookmark } from '../../reducer/jobsReducer';
import imagePath from '../../assets/imagePath';
import { formatSalaryRange } from '../../utils';
import Text from '../../components/Text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFCMToken } from '../../utils/notificationService';
import { Tokien } from '../../reducer/recruiterReducer';
import { CustomTextInput } from '../../components';
function Home() {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { suggested, banners } = useAppSelector(state => state.jobsReducer)
  const { user } = useAppSelector(state => state.userStore)
  const { appliedJobIds, bookmarkedJobIds } = useAppSelector(state => state.jobsReducer)
  const [search, setSearch] = useState<string>("")
  const dispatch = useAppDispatch()
  const [recent, setRecent] = useState<any[]>([])
  const [page, setPage] = useState(2)
  const [loadingMore, setLoadingMore] = useState(false)
  const [meta, setMeta] = useState<any>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const onLoadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    dispatch(GetRecentJobs({ page: page })).unwrap().then((res) => {
      setLoadingMore(false);
      if (res.success) {
        setRecent(prev => [...prev, ...res.data.jobs]);
        setMeta(res.data.meta);
        setPage(prev => prev + 1);
      }
    }).catch(() => {
      setLoadingMore(false);
    });
  };

  useEffect(() => {
    dispatch(GetSuggestedJobs())
    dispatch(GetBanners())
    dispatch(GetRecentJobs({})).unwrap().then((res) => {
      if (res.success) {
        console.log(res.data)
        setRecent(res.data.jobs)
        setMeta(res.data.meta)
      }
    })
  }, [])
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
  useFocusEffect(useCallback(
    () => {
      dispatch(ProfileData()).unwrap()
    },
    [],
  ))
  useBlockBack()
  return (
    <>
      <NavigationBar statusbar={user?.id ? true : false} name={routes.HOME} onPress={() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      }}>
        {
          !user?.id ? <>
            <ImageBackground
              source={imagePath.homeBackGround}
              style={{ flex: 1, }}
              imageStyle={{
                resizeMode: "contain",
                alignSelf: "flex-end",
              }}
            >
              <View style={{ height: "100%", position: "absolute", top: 0, right: 0, width: "100%" }}>
                <Image source={imagePath.transparent} style={{ width: "100%", height: "100%", }} />
              </View>
              <View style={{ height: responsiveScreenHeight(7), marginHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(4), }}>
                <Image source={imagePath.logo} style={{ height: "100%", width: "37%", resizeMode: "contain", }} />
              </View>
              <View style={{ position: "relative", marginHorizontal: responsiveScreenWidth(5), marginVertical: responsiveScreenHeight(2), height: responsiveScreenHeight(5), flexDirection: "row", gap: responsiveScreenWidth(3) }}>
                <TouchableOpacity style={{ flex: 1, }} onPress={() => navigation.navigate(routes.SEARCH, { search: true })}>
                  <Image source={imagePath.homeSearch} style={{ height: "100%", width: "100%", resizeMode: "stretch", }} />
                </TouchableOpacity>
              </View>
              <Pressable style={{ position: "relative", aspectRatio: 3.50495, width: "90%", marginHorizontal: responsiveScreenWidth(5), marginVertical: responsiveScreenHeight(2), flexDirection: "row", gap: responsiveScreenWidth(3) }}>
                <Image source={imagePath.homeText} style={{ width: "100%", height: "100%" }} />
              </Pressable>
              <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(1) }}>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 10, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                  <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 10, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: "transparent", paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                  <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Log In</Text>
                </TouchableOpacity>
              </View>
              <View style={{ backgroundColor: "white", paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 10, marginHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(5), elevation: 6 }}>
                <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "700" }}>Find your dream job!</Text>
                <CustomTextInput
                  value={search}
                  onChangeText={t => setSearch(t)}
                  style={{
                    borderWidth: 1,
                    width: '100%',
                    borderRadius: 6,
                    borderColor: colors.mediumGray,
                    color: colors.textPrimary,
                    paddingHorizontal: responsiveScreenWidth(3),
                    fontSize: responsiveScreenFontSize(1.8),
                    paddingVertical: responsiveScreenHeight(1.3),
                    marginTop: responsiveScreenHeight(2),
                  }}
                  placeholderTextColor={colors.gray}
                  placeholder="Enter skills, designation, companies"
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate(routes.SEARCH, { searchText: search })}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: responsiveScreenHeight(3),
                    borderRadius: 6,
                    gap: responsiveScreenWidth(1),
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    paddingHorizontal: responsiveScreenWidth(2),
                    paddingVertical: responsiveScreenHeight(1.5),
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                    Search Job
                  </Text>
                </TouchableOpacity>
              </View>

            </ImageBackground>
          </> :
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(5) }}
              onScroll={({ nativeEvent }) => {
                const paddingToBottom = 1000;
                const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;
                if (isCloseToBottom) {
                  onLoadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              <View style={{ height: responsiveScreenHeight(5), flexDirection: "row", alignItems: "stretch", gap: responsiveScreenWidth(2), }}>
                <Pressable onPress={() => navigation.navigate(routes.PROFILE)} style={{ height: "100%", aspectRatio: 1, overflow: "hidden", borderRadius: 5 }}>
                  <Image source={{ uri: user.image }} style={{ height: "100%", resizeMode: "cover", }} />
                </Pressable>
                <Pressable onPress={() => navigation.navigate(routes.PROFILE)} style={{ flex: 1, justifyContent: "space-between", }}>
                  <Text style={{ fontSize: responsiveScreenFontSize(1.6) }}>Welcome Back!</Text>
                  <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "800", textTransform: "capitalize", maxWidth: responsiveScreenWidth(65) }}>Hello! {user.name}👋 </Text>
                </Pressable>
                <TouchableOpacity style={{ alignSelf: "center" }} onPress={() => navigation.navigate(routes.NOTIFICATION)}>
                  <Image
                    source={imagePath.notification}
                    style={{ opacity: 1, resizeMode: 'contain' }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ position: "relative", marginVertical: responsiveScreenHeight(2), height: responsiveScreenHeight(5), flexDirection: "row", gap: responsiveScreenWidth(3) }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate(routes.SEARCH, { search: true })}
                  style={{
                    borderWidth: 1,
                    flex: 1,
                    borderColor: colors.primary,
                    borderRadius: 7,
                    backgroundColor: colors.lightGrayNatural,
                    gap: responsiveScreenWidth(1),
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: responsiveScreenWidth(2),
                    paddingVertical: responsiveScreenHeight(1.2),
                  }}>
                  <TouchableOpacity onPress={() => { }}>
                    <Image style={{}} source={imagePath.search} />
                  </TouchableOpacity>
                  <CustomTextInput
                    value={search}
                    editable={false}
                    onChangeText={e => setSearch(e)}
                    placeholder="Search"
                    placeholderTextColor={colors.textDisabled}
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: 0,
                      fontSize: responsiveScreenFontSize(1.8),
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { filter: true })}>
                  <Image source={imagePath.filter} style={{ height: "100%", resizeMode: "contain", }} />
                </TouchableOpacity>
              </View>
              {banners && banners.length > 0 ? (
                <FlatList
                  data={banners}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ width: responsiveScreenWidth(90), aspectRatio: 2.58 }}>
                      <Image source={{ uri: item?.image || item?.banner_image || item?.url }} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                    </Pressable>
                  )}
                />
              ) : (
                <Pressable onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ width: "100%", aspectRatio: 2.58 }}>
                  <ActivityIndicator size="small" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                </Pressable>
              )}
              <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(1.5) }}>browser by jobs</Text>
              <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(1), gap: responsiveScreenWidth(2) }}>
                <TouchableOpacity onPress={() => navigation.navigate(routes.COMPANY)} style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype1} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { type: 3 })} style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype2} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { type: 5 })} style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype3} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(routes.SEARCH, { type: 2 })} style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype4} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </TouchableOpacity>
              </View>
              {
                suggested.length > 0 && recent.length > 0 ? <>
                  <View style={{ flexDirection: "row", marginVertical: responsiveScreenHeight(1), justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(.5) }}>Suggested Jobs</Text>
                    <Text onPress={() => navigation.navigate(routes.SUGGESTEDJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
                  </View>
                  <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} horizontal data={suggested} renderItem={({ item, index }) => {
                    const isApplied = appliedJobIds.includes(item.id)
                    return (
                      <>
                        <View style={{ borderWidth: 1, borderColor: colors.gray, paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), width: responsiveScreenWidth(75), backgroundColor: colors.white, margin: 10, borderRadius: 15 }}>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ borderRadius: 6, height: responsiveScreenHeight(5), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                              <Image resizeMode='contain' source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                            </View>
                            <TouchableOpacity onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ flex: 1, gap: responsiveScreenHeight(0.5) }}>
                              <Text numberOfLines={1} style={[styles.companyName,]}>{item.title}</Text>
                              <Text numberOfLines={1} style={[styles.companyCategory,]} >{item.company_info.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                              dispatch(toggleBookmark({ id: item.id, is_favorited: bookmarkedJobIds[item.id] ?? item.is_favorited }))
                              dispatch(Bookmark({ id: item.id }))
                            }}>
                              <Image source={(bookmarkedJobIds[item.id] ?? item.is_favorited) ? imagePath.activeBookmark : imagePath.bookmark} />
                            </TouchableOpacity>
                          </View>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                            {
                              item.jobType && <Text numberOfLines={1} style={{
                                backgroundColor: "#F5F5F5", textTransform: "capitalize",
                                borderWidth: 1, borderColor: "#F5F5F5",
                                paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.6)
                              }}>{item.jobType}</Text>
                            }
                            {
                              item?.functionalArea && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.6) }}>{
                                item.functionalArea}</Text>
                            }
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <Text numberOfLines={2} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>

                              {
                                !item.is_hide_salary && item.salary && item.salary_period && <>
                                  <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{item.salary_currency}{formatSalaryRange(item.salary)}/</Text>
                                  <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{item.salary_period}</Text>
                                </>
                              }
                            </Text>
                            {item?.is_applied || isApplied ? (
                              <View style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", opacity: 0.5, alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Applied</Text>
                              </View>
                            ) : item?.expired ? (
                              <Image source={imagePath.expired} style={{ resizeMode: "contain" }} />
                            ) : (
                              <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                                <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </>
                    )
                  }} />
                  <View style={{ backgroundColor: "transparent", flexDirection: "row", marginTop: responsiveScreenHeight(1), justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(.5) }}>recent jobs</Text>
                    <Text onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
                  </View>
                  <FlatList scrollEnabled={false} contentContainerStyle={{ gap: responsiveScreenHeight(1), marginVertical: responsiveScreenHeight(1) }} data={recent} renderItem={({ item: job, index }) => {
                    const highlights: string[] = job?.highlights ?? [];
                    const isApplied = appliedJobIds.includes(job.id)
                    return (
                      <>
                        <Pressable
                          onPress={() => navigation.navigate(routes.JOBDETAIL, { id: job?.id } as never)}
                          style={[styles.card, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
                        >
                          <View style={styles.headerRow}>
                            <View style={[styles.logoBox, { borderWidth: .5, borderColor: "#bbbbbbff" }]}>
                              <Image
                                source={{ uri: job?.company_info?.image || 'https://via.placeholder.com/150' }}
                                style={styles.logoImage}
                              />
                            </View>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => {
                              dispatch(toggleBookmark({ id: job.id, is_favorited: bookmarkedJobIds[job.id] ?? job.is_favorited }))
                              dispatch(Bookmark({ id: job.id }))
                            }}>
                              <Image source={(bookmarkedJobIds[job.id] ?? job.is_favorited) ? imagePath.activeBookmark : imagePath.bookmark} />
                            </TouchableOpacity>
                          </View >
                          <View style={styles.companyInfo}>
                            <Text style={[styles.companyName,]}>
                              {job?.title}
                            </Text>
                            <Text style={[styles.companyCategory]}>
                              {job?.company_info?.name}
                            </Text>
                          </View>
                          {
                            job?.expired && (
                              <Image
                                source={imagePath.expired}
                                style={{ marginTop: responsiveHeight(1), }}
                              />
                            )
                          }
                          <View style={[styles.metaRow, { marginTop: responsiveHeight(1) }]}>
                            <Image source={imagePath.clock} style={{ transform: [{ scale: .7 }] }} />
                            <Text style={[styles.metaText, { color: "#484848" }]}>
                              {job?.job_type || 'Full Time'}
                            </Text>
                          </View>
                          {
                            (job?.jobLocation) && (
                              <View style={styles.metaRow}>
                                <Image source={require("./location2.png")} style={{ transform: [{ scale: .7 }] }} />
                                <Text style={[styles.metaText, { color: "#484848" }]} numberOfLines={2}>
                                  {job?.jobLocation}
                                </Text>
                              </View>
                            )
                          }
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(.5) }}>
                            {
                              (job?.salary && job?.salary_period && !job?.is_hide_salary) ? (
                                <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{job.salary_currency}{job.salary}/{job.salary_period}</Text>
                              ) : (job?.salary_from || job?.salary_to) && !job?.is_hide_salary ? (
                                <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>Salary : {job.salary_currency}{job.salary_from} - {job.salary_to}</Text>
                              ) : null
                            }
                            {
                              job?.expiredAt && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.6) }}>Expiry Date : {job?.expiredAt}</Text>
                            }
                            {
                              job?.posted_at && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.6) }}>Post Date : {job?.posted_at}</Text>
                            }
                          </View>
                          {
                            job?.description && (
                              <Text numberOfLines={4} style={[{ lineHeight: responsiveHeight(2), color: "#737373", fontSize: responsiveFontSize(1.8) }]}>
                                {job?.description}
                              </Text>
                            )
                          }
                          {
                            highlights.length > 0 && (
                              <View style={styles.highlightsContainer}>
                                {highlights.slice(0, 3).map((item, idx) => (
                                  <View key={idx} style={styles.bulletRow}>
                                    <View style={[styles.bullet, { backgroundColor: colors.textThree }]} />
                                    <Text style={[styles.bulletText, { color: colors.textTwo }]}>{item}</Text>
                                  </View>
                                ))}
                              </View>
                            )
                          }
                          {
                            !job?.is_applied && !isApplied && !job?.expired &&
                            <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: job.id }) }} style={{ marginTop: responsiveScreenHeight(1.5) }}>
                              <Image source={require('./updateAndSaveButton.png')} style={{ width: "100%", resizeMode: "contain" }} />
                            </TouchableOpacity>
                          }
                          {
                            job?.is_applied &&
                            <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: job.id }) }} style={{ marginTop: responsiveScreenHeight(1.5) }}>
                              <Image source={require('./appliedButton.png')} style={{ width: "100%", resizeMode: "contain" }} />
                            </TouchableOpacity>
                          }

                        </Pressable>
                      </>
                    )
                  }} />
                  {loadingMore && <ActivityIndicator size="small" style={{ marginVertical: responsiveScreenHeight(2) }} />}
                </> :
                  <>
                    <View style={{ flex: 1, marginTop: responsiveScreenHeight(15) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View>
                  </>
              }
            </ScrollView >
        }
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


const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoBox: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(3),
    // backgroundColor applied inline via colors.backgroundTwo
  },
  logoImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
    marginTop: responsiveHeight(1),
    gap: responsiveHeight(.5)
  },
  companyName: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: '700',
  },
  companyCategory: {
    fontSize: responsiveFontSize(1.8),
    marginTop: 1,
  },
  bookmarkIcon: {
    width: responsiveWidth(5.5),
    height: responsiveWidth(5.5),
    resizeMode: 'contain',
  },

  /* Badge */
  badgeRow: {
    flexDirection: 'row',
    marginTop: responsiveHeight(1),
  },
  expiredBadge: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.4),
    borderRadius: 20,
  },
  expiredText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '600',
  },

  /* Divider */
  divider: {
    height: 1,
    marginVertical: responsiveHeight(1.2),
  },

  /* Meta rows */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(0.7),
    gap: responsiveWidth(2)
  },
  metaIcon: {
    width: responsiveWidth(4.5),
    height: responsiveWidth(4.5),
    resizeMode: 'contain',
    marginRight: responsiveWidth(2),
  },
  metaText: {
    fontSize: responsiveFontSize(1.8),
    flex: 1,
  },
  salaryText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
  },

  /* Highlights */
  highlightsContainer: {
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(0.5),
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: responsiveHeight(0.7),
    marginRight: responsiveWidth(2),
  },
  bulletText: {
    fontSize: responsiveFontSize(1.4),
    flex: 1,
    lineHeight: responsiveFontSize(2.2),
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(1.2),
  },
  quickApplyBtn: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(0.7),
    borderRadius: 8,
  },
  quickApplyText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
  },
  daysAgo: {
    fontSize: responsiveFontSize(1.6),
  },
});