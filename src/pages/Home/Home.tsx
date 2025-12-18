import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, FlatList, Image, ImageBackground, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationBar, PageSlider, PostList, UserImage } from '../../components';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../../utils/Icon';
import { routes } from '../../constants/values';
import { useAppDispatch, useAppSelector } from '../../store';
import { GetRecentJobs, GetSuggestedJobs, } from '../../reducer/jobsReducer';
import imagePath from '../../assets/imagePath';
import { formatSalaryRange } from '../../utils';
function Home() {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { user } = useAppSelector(state => state.userStore)
  const [suggestedJob, setSuggestedJob] = useState<Job[]>([])
  const [recentJob, setRecentJob] = useState<Job[]>([])
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(GetSuggestedJobs()).unwrap().then(res => {
      if (res.success) {
        setSuggestedJob(res.data)
      }
    })
    dispatch(GetRecentJobs()).unwrap().then(res => {
      if (res.success) {
        setRecentJob(res.data)
      }

    })
  }, [])
  return (
    <>
      <NavigationBar statusbar={user?.id?true:false} name={routes.HOME}>
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
                <Pressable style={{ flex: 1, }} onPress={() => navigation.navigate(routes.SEARCH)}>
                  <Image source={imagePath.homeSearch} style={{ height: "100%", width: "100%", resizeMode: "stretch", }} />
                </Pressable>
                <Image source={imagePath.filter} style={{ height: "100%", resizeMode: "contain", }} />
              </View>
              <View style={{ position: "relative", marginHorizontal: responsiveScreenWidth(5), marginVertical: responsiveScreenHeight(2), flexDirection: "row", gap: responsiveScreenWidth(3) }}>
                <Image source={imagePath.homeText} style={{ width: "100%", }} />
              </View>
              <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(1) }}>
                <Pressable onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 10, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                  <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Register</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 10, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: "transparent", paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                  <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Log In</Text>
                </Pressable>
              </View>
              <View style={{ backgroundColor: "white", paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 10, marginHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(5),elevation:6 }}>
                <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "700" }}>Find your dream job!</Text>
                <TextInput
                  // value={formData.experienceTitle}
                  // onChangeText={t => handleChange('experienceTitle', t)}
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
                  placeholder="e.g., React Native Developer"
                />
                 <Pressable
                          // onPress={onSubmit}
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
                        </Pressable>
              </View>

            </ImageBackground>
          </> :
            <ScrollView style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(2) }}>
              <View style={{ height: responsiveScreenHeight(5) }}>
                <Image source={imagePath.logo} style={{ height: "100%", width: "37%", resizeMode: "contain", }} />
              </View>
              <View style={{ position: "relative", marginVertical: responsiveScreenHeight(2), height: responsiveScreenHeight(5), flexDirection: "row", gap: responsiveScreenWidth(3) }}>
                <Pressable style={{ flex: 1, }} onPress={() => navigation.navigate(routes.SEARCH)}>
                  <Image source={imagePath.homeSearch} style={{ height: "100%", width: "100%", resizeMode: "stretch", }} />
                </Pressable>
                <Image source={imagePath.filter} style={{ height: "100%", resizeMode: "contain", }} />
              </View>

              <View style={{ width: "100%", aspectRatio: 2.58 }}>
                <Image source={imagePath.banner} style={{ width: "100%", height: "100%", }} />
              </View>
              <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "600", textTransform: "capitalize", marginTop: responsiveScreenHeight(1) }}>browser by jobs</Text>
              <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(1), gap: responsiveScreenWidth(2) }}>
                <Pressable onPress={() => navigation.navigate(routes.COMPANY)} style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype1} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </Pressable>
                <View style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype2} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </View>
                <View style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype3} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </View>
                <View style={{ flex: 1, maxHeight: responsiveScreenHeight(13.5) }}>
                  <Image source={imagePath.jobtype4} style={{ height: "100%", resizeMode: "contain", width: "100%", }} />
                </View>
              </View>
              <View style={{ flexDirection: "row", marginVertical: responsiveScreenHeight(1), justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "600", textTransform: "capitalize", }}>Suggested Jobs</Text>
                <Text onPress={() => navigation.navigate(routes.SUGGESTEDJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
              </View>
              <FlatList horizontal data={suggestedJob} renderItem={({ item, index }) => {
                return (
                  <>
                    <View style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), width: responsiveScreenWidth(75), backgroundColor: colors.white, elevation: 4, margin: 10, borderRadius: 15 }}>
                      <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1), justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                          <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                        </View>
                        <Pressable onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }} >{item.company_info.name}</Text>
                          <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{item.title}</Text>
                        </Pressable>
                        <View >
                          <Image source={imagePath.bookmark} />
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                        {
                          item.jobType && <Text style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{item.jobType}</Text>
                        }
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                          {
                            item.salary && <>
                              <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{item.salary_currency}{formatSalaryRange(item.salary)} </Text>
                              <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{item.salary_period}</Text>
                            </>
                          }
                        </View>

                        <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                          <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                          <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )
              }} />
              <View style={{ backgroundColor: "transparent", flexDirection: "row", marginTop: responsiveScreenHeight(1), justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "600", textTransform: "capitalize", }}>recent jobs</Text>
                <Text onPress={() => navigation.navigate(routes.RECENTJOB)} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "600", textTransform: "capitalize", color: colors.darkGray }}>see all</Text>
              </View>
              <FlatList scrollEnabled={false} contentContainerStyle={{ gap: responsiveScreenHeight(1), marginVertical: responsiveScreenHeight(1) }} data={recentJob} renderItem={({ item, index }) => {
                return (
                  <>
                    <View style={{ paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(2), backgroundColor: "#F5F5F5", borderRadius: 15 }}>
                      <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1), justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                          <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.title}</Text>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2) }}>
                            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>
                              <Image source={imagePath.box} />
                              <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{item.company_info.name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>
                              <Image source={imagePath.location} />
                              <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{item.jobLocation}</Text>
                            </View>
                          </View>
                        </View>
                        <Pressable onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                          <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>View</Text>
                        </Pressable>
                      </View>
                    </View>
                  </>
                )
              }} />
            </ScrollView>
        }

      </NavigationBar>
    </>
  );
}


export default Home;

