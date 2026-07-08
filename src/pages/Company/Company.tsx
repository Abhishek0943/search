import { FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, View, ActivityIndicator, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { Favorite, GetCompanies, GetFavoriteCompanies } from '../../reducer/jobsReducer'
import Icon from '../../utils/Icon'
import Text from '../../components/Text'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'
export const Header = ({ title }) => {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: "relative",
        alignItems: 'center',
        borderBottomColor: colors.textDisabled,
        borderBottomWidth: 0.5,
        paddingBottom: responsiveScreenHeight(2),
        width: responsiveScreenWidth(100),
        paddingHorizontal: responsiveScreenWidth(5)
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={imagePath.backIcon} style={{ resizeMode: 'contain', transform: [{ scale: 1.1 }] }} />
      </TouchableOpacity>
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: responsiveScreenFontSize(2),
          color: colors.textPrimary,
          fontWeight: '800',
        }}
      >
        {title}
      </Text>
      <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
    </View>
  )
}
const Company = () => {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<any[]>([])
  const route = useRoute()
  const [loading, setLoading] = useState(true)
  const company = route.params?.company || false
  const isFavorite = route.params?.isFavorite || false
  const [pages, setPages] = useState(1)
  const [meta, setMeta] = useState<any>({})
  const [search, setSearch] = useState('')

  const onLoadMore = React.useCallback(() => {
    if (!meta?.last_page) return;
    if (meta?.current_page >= meta.last_page) return;
    setPages((p) => p + 1);
  }, [meta?.last_page, meta?.current_page]);
  const fetchCompanies = (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    }
    const params = { pages: pageNumber, search };
    const promise = isFavorite ? dispatch(GetFavoriteCompanies(params)) : dispatch(GetCompanies(params));
    promise.unwrap().then((res: any) => {
      setMeta(res?.data?.meta);
      if (pageNumber === 1) {
        setJob(res?.data?.companies || []);
      } else {
        setJob(prev => [...(prev || []), ...(res?.data?.companies || [])]);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    setPages(1);
    fetchCompanies(1);
  }, [isFavorite, search]);

  useEffect(() => {
    if (pages > 1) {
      fetchCompanies(pages);
    }
  }, [pages]);
  return (
    <NavigationBar navigationBar={false}>
      <>
        <Header title={isFavorite ? "Favorite Companies" : "Companies"} />
        <Pressable
          style={{
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 7,
            backgroundColor: colors.lightGrayNatural,
            gap: responsiveScreenWidth(1),
            width: responsiveScreenWidth(90),
            marginTop: responsiveScreenHeight(2),
            marginHorizontal: "auto",
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: responsiveScreenWidth(2),
            paddingVertical: responsiveScreenHeight(1.2),
          }}>
          <Pressable>
            <Image style={{}} source={imagePath.search} />
          </Pressable>
          <TextInput
            value={search}
            onChangeText={e => setSearch(e)}
            placeholder="Search"
            placeholderTextColor={colors.textDisabled}
            style={{
              flex: 1,
              margin: 0,
              padding: 0,
              fontSize: responsiveScreenFontSize(1.8),
              color: colors.textPrimary,
            }}
          />
        </Pressable>
        <ScrollView style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "flex-start" }}>
          {
            loading ? <>
              <ActivityIndicator style={{ marginTop: responsiveScreenHeight(40) }} size={responsiveScreenFontSize(3)} />
            </> : <>
              {
                meta?.total_jobs > 0 &&
                <Text style={{ marginTop: responsiveScreenHeight(2), marginHorizontal: responsiveScreenWidth(5), fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary, }}>{meta?.total_jobs} Company's</Text>
              }
              <FlatList
                onEndReachedThreshold={0.3}     // ✅ important
                onEndReached={onLoadMore}
                keyExtractor={(i) => `${i.id}fasdfdasfasadsfsadfdsfadsfdfsadfdasfdasfdasfasdfsdfadsffdsafdsfasdfasdfadsferfewrqewserchitem`}
                scrollEventThrottle={16}
                removeClippedSubviews={false}
                ListEmptyComponent={() => <EmptyComp />}
                scrollEnabled={false}
                contentContainerStyle={{ marginHorizontal: responsiveScreenWidth(5), gap: responsiveScreenHeight(1), marginVertical: responsiveScreenHeight(1) }}
                data={job}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      <TouchableOpacity onPress={() => navigation.navigate(routes.COMPANYDETAILS, { id: item.id, company })} style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: "#F5F5F5", borderRadius: 15, gap: responsiveScreenHeight(1) }}>
                        <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ borderRadius: 6, height: responsiveScreenHeight(3), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                            <Image source={{ uri: item.logo }} resizeMode='contain' style={{ height: "100%", aspectRatio: 1 }} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "500" }}>{item.name}</Text>
                          </View>
                          {
                            !company &&
                            <TouchableOpacity onPress={() => {
                              dispatch(Favorite({ id: item.slug })).unwrap().then((res) => {
                                if (res.data) {
                                  job[index].is_favourite = !item.is_favourite
                                  setJob([...job])
                                }
                              })
                            }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", }}>
                              <Icon icon={{ type: "Ionicons", name: item.is_favourite ? 'heart' : 'heart-outline' }} style={{ color: item.is_favourite ? colors.primary : "#A9A9A9", fontSize: responsiveScreenFontSize(2.3) }} />
                            </TouchableOpacity>
                          }
                        </View>
                        {
                          item?.latestJob?.title &&
                          <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.4), fontWeight: "700" }}>{item?.latestJob?.title}</Text>
                        }

                        {
                          (item.city || item.country) &&
                          <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                            {/* <Image style={{ transform: [{ scale: .9 }] }} source={require('../home/location2.png')} /> */}
                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.darkGray }}>{item.city || item.country}</Text>
                          </View>
                        }
                        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                          <Image style={{ transform: [{ scale: .9 }] }} source={imagePath.bag} />
                          <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.darkGray, flex: 1 }}>Job Posts : {item.jobs_count}</Text>
                          {
                            item?.latestJob?.posted_at &&
                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.darkGray }}>{item?.latestJob?.posted_at}</Text>
                          }
                        </View>
                      </TouchableOpacity>
                    </>
                  )
                }} />
            </>
          }


        </ScrollView>
      </>

    </NavigationBar>
  )
}

export default Company

const styles = StyleSheet.create({})