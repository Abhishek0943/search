import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Image, ImageBackground, Platform, Pressable, ScrollView, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { NavigationBar, } from '../../components';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../../utils/Icon';
import { routes } from '../../constants/values';
import { useAppDispatch, useAppSelector } from '../../store';
import { Bookmark, GetRecentJobs, GetSuggestedJobs, ProfileData, } from '../../reducer/jobsReducer';
import imagePath from '../../assets/imagePath';
import { formatSalaryRange } from '../../utils';
import Text from '../../components/Text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFCMToken } from '../../utils/notificationService';
import { Tokien } from '../../reducer/recruiterReducer';
function Home() {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { suggested, recent } = useAppSelector(state => state.jobsReducer)
  const { user, } = useAppSelector(state => state.userStore)
  const { appliedJobIds } = useAppSelector(state => state.jobsReducer)
  const [search, setSearch] = useState<string>("")
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(GetSuggestedJobs())
    dispatch(GetRecentJobs())
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
      <NavigationBar statusbar={user?.id ? true : false} name={routes.HOME}>
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
                <TextInput
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
            <ScrollView style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(5) }}>
              <View style={{ height: responsiveScreenHeight(5), flexDirection: "row", alignItems: "stretch", gap: responsiveScreenWidth(2), }}>
                <Pressable onPress={() => navigation.navigate(routes.PROFILE)} style={{ height: "100%", aspectRatio: 1, overflow: "hidden", borderRadius: 5 }}>
                  <Image source={{ uri: user.image }} style={{ height: "100%", resizeMode: "cover", }} />
                </Pressable>
                <Pressable onPress={() => navigation.navigate(routes.PROFILE)} style={{ flex: 1, justifyContent: "space-between", }}>
                  <Text style={{ fontSize: responsiveScreenFontSize(1.6) }}>Welcome Back!</Text>
                  <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "800", textTransform: "capitalize", }}>Hello! {user.name}👋</Text>
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
                  <TextInput
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
              <Pressable onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ width: "100%", aspectRatio: 2.58 }}>
                <Image source={imagePath.banner} style={{ width: "100%", height: "100%", }} />
              </Pressable>
              <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(1.5) }}>browser by jobs</Text>
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
                    <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(.5) }}>Suggested Jobs</Text>
                    <Text onPress={() => navigation.navigate(routes.SUGGESTEDJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
                  </View>
                  <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} horizontal data={suggested} renderItem={({ item, index }) => {
                    const isApplied = appliedJobIds.includes(item.id)
                    return (
                      <>
                        <View style={{ borderWidth: 1, borderColor: colors.gray, paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), width: responsiveScreenWidth(75), backgroundColor: colors.white, margin: 10, borderRadius: 15 }}>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), justifyContent: "space-between", alignItems: "flex-start" }}>
                            <View style={{ borderRadius: 6, height: responsiveScreenHeight(5), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                              <Image resizeMode='contain' source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                            </View>
                            <TouchableOpacity onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ flex: 1, gap: responsiveScreenHeight(0.5) }}>
                              <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.title}</Text>
                              <Text numberOfLines={1} style={{ textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }} >{item.company_info.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => dispatch(Bookmark({ id: item.id })).unwrap().then((res) => dispatch(GetSuggestedJobs()))}>
                              <Image source={item.is_favorited ? imagePath.activeBookmark : imagePath.bookmark} />
                            </TouchableOpacity>
                          </View>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                            {
                              item.jobType && <Text numberOfLines={1} style={{
                                backgroundColor: "#F5F5F5", textTransform: "capitalize",
                                borderWidth: 1, borderColor: "#F5F5F5",
                                paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8)
                              }}>{item.jobType}</Text>
                            }
                            {
                              item?.functionalArea && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{
                                item.functionalArea}</Text>
                            }
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <Text numberOfLines={2} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                              {
                                item.salary && item.salary_period && <>
                                  <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{item.salary_currency}{formatSalaryRange(item.salary)}/</Text>
                                  <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{item.salary_period}</Text>
                                </>
                              }
                            </Text>
                            {
                              !item?.is_applied && !isApplied &&
                              <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                                <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                              </TouchableOpacity>
                            }
                          </View>
                        </View>
                      </>
                    )
                  }} />
                  <View style={{ backgroundColor: "transparent", flexDirection: "row", marginTop: responsiveScreenHeight(1), justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "700", textTransform: "capitalize", marginTop: responsiveScreenHeight(.5) }}>recent jobs</Text>
                    <Text onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
                  </View>
                  <FlatList scrollEnabled={false} contentContainerStyle={{ gap: responsiveScreenHeight(1), marginVertical: responsiveScreenHeight(1) }} data={recent} renderItem={({ item, index }) => {
                    return (
                      <>
                        <View style={{ paddingVertical: responsiveScreenHeight(1), height: responsiveScreenHeight(10), justifyContent: "center", paddingHorizontal: responsiveScreenWidth(2), backgroundColor: "#F5F5F5", borderRadius: 15 }}>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                              <Image source={{ uri: item.company_info.image }} resizeMode='contain' style={{ height: "100%", aspectRatio: 1 }} />
                            </View>
                            <View style={{ flex: 1, gap: responsiveScreenHeight(1.2) }}>
                              <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.title}</Text>
                              <View style={{ flexDirection: "column", gap: responsiveScreenWidth(2), flexWrap: "wrap" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                                  <Image source={imagePath.box} />
                                  <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(45), color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{item.company_info.name}</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
                                  <Image source={imagePath.location} />
                                  <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(45), color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{item.jobLocation}</Text>
                                </View>
                              </View>
                            </View>
                            <TouchableOpacity onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ alignSelf: "center", marginVertical: responsiveScreenHeight(0.5), borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.8) }}>
                              <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>View</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    )
                  }} />
                </> :
                  <>
                    <View style={{ flex: 1, marginTop: responsiveScreenHeight(15) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View>
                  </>
              }

            </ScrollView>
        }

      </NavigationBar>
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

