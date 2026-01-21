import { View, ScrollView, TouchableHighlight, Image, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { ThemeContext } from '../../../context/ThemeProvider'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../../store'
import { Followers, GetCandidates, JobCandidates } from '../../../reducer/recruiterReducer'
import imagePath from '../../../assets/imagePath'
import Text from '../../../components/Text'
import { Header } from '../../../pages/Company/Company'
import { PageSlider } from '../../../components'
const Candidate = () => {
  const { colors } = useContext(ThemeContext);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const route = useRoute();
  const jobId = route?.params?.jobId ?? false;
  const followers = route.params?.followers;
  const dispatch = useAppDispatch()
  const [active, setActive] = useState(0)
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState()
  const [pages, setPages] = useState(1)
  const onLoadMore = React.useCallback(() => {
    if (!meta?.last_page) return;
    if (meta?.current_page >= meta.last_page) return;
    setPages((p) => p + 1);
  }, [meta?.last_page, meta?.current_page]);
  useFocusEffect(useCallback(
    () => {
      if (jobId) {
        const a = ["applied", "rejected", "shortlist", "hired"]
        setLoading(true)
        dispatch(JobCandidates({ pages, job_id: jobId, status: a[active] })).unwrap().then(res => {
          if (res.success !== false) {
            if (cvs?.meta?.current_page > 1) {
              setCvs([...cvs, ...res.data?.applications])
            } else {
              setCvs(res?.data?.applications)
            }
            setMeta(res?.data?.meta)
          }
          setLoading(false)
        })
      }
      else if (followers) {
        dispatch(Followers({ pages })).unwrap().then(res => {
          if (res.success !== false) {
            if (cvs.length > 0) {
              setCvs([...cvs, ...res.data.users])
            } else {
              setCvs(res?.data?.users)
            }
            setMeta(res?.data?.meta)
          }
          setLoading(false)
        })
      }
      else {
        dispatch(GetCandidates({ pages })).unwrap().then(res => {
          if (res.success !== false) {
            if (cvs.length > 0) {
              setCvs([...cvs, ...res.data.users])
            } else {
              setCvs(res.data.users)
            }
            setMeta(res.data.meta)
          }
          setLoading(false)
        })

      }
    },
    [jobId, followers, active, pages],
  )
  )

  return (
    <NavigationBar navigationBar={jobId || followers ? false : true} name={routes.ACTIVECANDIDATE}>
      <ScrollView style={{ flex: 1, }} contentContainerStyle={{ gap: responsiveScreenHeight(2) }}>
        {
          jobId || followers ? <Header title={followers ? "Followers" : "Candidates"} /> : <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              position: 'relative',
              alignItems: 'center',
              borderBottomColor: colors.textDisabled,
              borderBottomWidth: 0.5,
              paddingBottom: responsiveScreenHeight(2),
              width: responsiveScreenWidth(100),
              paddingHorizontal: responsiveScreenWidth(5),
            }}
          >
            <Text
              style={{
                flex: 1,
                textAlign: 'left',
                fontSize: responsiveScreenFontSize(2),
                color: colors.textPrimary,
                fontWeight: '600',
              }}
            >
              Candidates
            </Text>

          </View>
        }
        {
          jobId &&
          <PageSlider setActive={setActive} active={active} list={["Applied Users", "Rejected", "Shortlisted", "Hired"]} />
        }
        {
          loading ? <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}>
            <ActivityIndicator size={responsiveScreenFontSize(3)} style={{}} />
          </View> :
            <FlatList
              data={cvs}
              numColumns={2}

              ListEmptyComponent={() => {
                return (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: responsiveScreenHeight(70) }}>
                    <Image source={require("./followerImage.png")} />
                    <Pressable
                      onPress={() => navigation.navigate(routes.ACTIVECANDIDATE)}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: responsiveScreenHeight(2),
                        borderRadius: 12,
                        gap: responsiveScreenWidth(1),
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        paddingHorizontal: responsiveScreenWidth(3),
                        paddingVertical: responsiveScreenHeight(1.5),
                      }}
                    >
                      <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                        Search Candidates
                      </Text>
                    </Pressable>
                  </View>
                )
              }}
              style={{ paddingHorizontal: responsiveScreenWidth(5), marginBottom: responsiveScreenHeight(2) }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={{ marginVertical: 10, width: responsiveScreenWidth(43), backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.5), borderRadius: 10, position: "relative" }}>
                  <View style={{ borderRadius: 100, borderWidth: 1, borderColor: colors.primary, padding: 2, backgroundColor: colors.white, overflow: "hidden", height: responsiveScreenHeight(8), aspectRatio: 1, marginHorizontal: "auto" }}>
                    <Image source={{ uri: item.image || item.user.image }} style={{ borderRadius: 100, height: "100%", backgroundColor: "white", }} />
                  </View>
                  <Text style={{ textTransform: "capitalize", textAlign: "center", marginTop: responsiveScreenHeight(.5), fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.name || item.user.name}</Text>
                  {
                    item.profile_summary &&
                    <Text numberOfLines={2} style={{ textAlign: "center", marginTop: responsiveScreenHeight(.5), color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>{item.profile_summary}</Text>
                  }
                  {
                    item.location &&
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: responsiveScreenWidth(.5), marginTop: responsiveScreenHeight(.5) }}>
                      <Image source={imagePath.location} style={{ transform: [{ scale: 0.8 }] }} />
                      <Text numberOfLines={1} style={{ textAlign: "center", color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>{item.location}</Text>
                    </View>
                  }
                  <Pressable
                    onPress={() => {
                      if (jobId) {
                        navigation.navigate(routes.CANDIDATEPROFILE, { application_id: item.application_id, })
                      }
                      else {
                        navigation.navigate(routes.CANDIDATEPROFILE, { candidateId: item.id })
                      }


                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      marginTop: responsiveScreenHeight(2),
                      borderRadius: 12,
                      gap: responsiveScreenWidth(1),
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.primary,
                      paddingHorizontal: responsiveScreenWidth(3),
                      paddingVertical: responsiveScreenHeight(1),
                    }}
                  >
                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                      View Profile
                    </Text>
                  </Pressable>
                </View>
              )}
              onEndReachedThreshold={0.3}     // ✅ important
              onEndReached={onLoadMore}       // ✅
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            />
        }


      </ScrollView>
    </NavigationBar>
  )
}

export default Candidate