import { View, ScrollView, Image, Pressable, TextInput, FlatList, TouchableHighlight, TouchableOpacity } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { GetJobApplication } from '../../reducer/jobsReducer'
import { formatSalaryRange } from '../../utils'
import Routes from '../../navigation/Routes'
import Text from '../../components/Text'

const ApplyJob = () => {
  const { colors } = useContext(ThemeContext);
  const [cvs, setCvs] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const { user } = useAppSelector(state => state.userStore)

  useFocusEffect(
    useCallback(() => {

      dispatch(GetJobApplication())
        .unwrap()
        .then(res => {
          if (res.success !== false) {
            setCvs(res.data);
          }
          console.log(res.data)
        });
    }, []),
  );
  return (
    <NavigationBar name={routes.APPLYJOB}>

      <ScrollView style={{ flex: 1, }} contentContainerStyle={{ flex: 1 }}>
        <View
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
              fontWeight: '800',
            }}
          >
            Your Application
          </Text>
          <TouchableHighlight onPress={() => navigation.navigate(routes.NOTIFICATION)}>
            <Image
              source={imagePath.notification}
              style={{ opacity: 1, resizeMode: 'contain' }}
            />
          </TouchableHighlight>
        </View>
        {
          !user || !user?.id ? <View style={{ alignSelf: "center", flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={imagePath.image1} />
            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", textAlign: "center", width: responsiveScreenWidth(80) }}>You’re not logged in. Please log in to access this feature</Text>
            <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(2) }}>
              <Pressable onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Register</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>Log In</Text>
              </Pressable>
            </View>
          </View> : <>

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
              <Pressable >
                <Image style={{}} source={imagePath.search} />
              </Pressable>
              <TextInput
                value={search}
                //  onFocus={() => { setActiveSearch(true) }}
                onChangeText={e => setSearch(e)}
                placeholder="Search"
                placeholderTextColor={colors.textDisabled}
                style={{
                  flex: 1,
                  margin: 0,
                  padding: 0,                 fontSize: responsiveScreenFontSize(1.8),
                }}
              />
            </Pressable>
            {
                      cvs?.meta?.total_jobs > 0 &&
                      <Text style={{ marginTop: responsiveScreenHeight(2), marginHorizontal: responsiveScreenWidth(5), fontSize: responsiveScreenFontSize(1.8), fontWeight: "700", color: colors.textPrimary, }}>{cvs?.meta?.total_jobs} Jobs Find</Text>
                    }
            <FlatList scrollEnabled={false} contentContainerStyle={{ marginTop: responsiveScreenHeight(2), gap: responsiveScreenHeight(1), width: responsiveScreenWidth(90), marginHorizontal: "auto", marginVertical: responsiveScreenHeight(1) }} data={cvs.jobs} renderItem={({ item, index }) => {
              return (
                <>
                  <View style={{ paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), backgroundColor: "#ffffffff", elevation: 7, borderRadius: 15 }}>
                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                        <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.2), textTransform: "capitalize" }}>{item.company_info.name}</Text>
                        <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "700" }}>{item.title}</Text>
                        <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(2) }}>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>
                            <Image source={imagePath.box} />
                            {
                              item.salary && <>
                                <Text style={{ color: "#A9A9A9", fontSize: responsiveScreenFontSize(1.8) }}>{item.salary_currency}{formatSalaryRange(item.salary)} </Text>
                                <Text style={{ color: "#A9A9A9", flex: 1, marginTop: responsiveScreenHeight(.3) }}>sdfjshdfjds ffh dsf{item.salary_period}</Text>
                              </>
                            }
                            {/* <Text style={{ color: "#A9A9A9", fontSize: responsiveScreenFontSize(1.8) }}>{item.company_info.name}</Text> */}
                          </View>
                          <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>
                            <Image source={imagePath.location} />
                            <Text style={{ color: "#A9A9A9", fontSize: responsiveScreenFontSize(1.8) }}>{item.jobLocation}</Text>
                          </View>
                        </View>
                      </View>
                      {/* <Pressable onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>View</Text>
                    </Pressable> */}
                    </View>
                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), justifyContent: "flex-start" }}>
                      <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                          flex:1,  
                          justifyContent: 'center',
                          marginTop: responsiveScreenHeight(2),
                          borderRadius: 15,
                          gap: responsiveScreenWidth(1),
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.lightGrayNatural,
                          paddingHorizontal: responsiveScreenWidth(3),
                          paddingVertical: responsiveScreenHeight(1.5),
                        }}
                      >
                        <Text
                          style={{
                            color: colors.darkGray,
                            fontSize: responsiveScreenFontSize(1.8),
                            textTransform: 'capitalize',
                            fontWeight: '800',
                          }}
                        >
                          {item.status}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{

flex:1,                              justifyContent: 'center',
                          marginTop: responsiveScreenHeight(2),
                          borderRadius: 15,
                          gap: responsiveScreenWidth(1),
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: "#E9F0FF",
                          paddingHorizontal: responsiveScreenWidth(3),
                          paddingVertical: responsiveScreenHeight(1.5),
                        }}
                      >
                        <Text
                          style={{
                            color: colors.primary,
                            fontSize: responsiveScreenFontSize(1.8),
                            textTransform: 'capitalize',
                            fontWeight: '800',
                          }}
                        >
                          View Application
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )
            }} />
          </>
        }

      </ScrollView>
    </NavigationBar>
  )
}

export default ApplyJob