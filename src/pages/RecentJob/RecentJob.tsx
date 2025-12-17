import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetCompanies, GetRecentJobs, GetSuggestedJobs } from '../../reducer/jobsReducer'
import Icon from '../../utils/Icon'
import { formatSalaryRange } from '../../utils'

const SuggestedJob = () => {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>()
  const [activeCompany, setActiveCompany] = useState<Company>()
  useEffect(() => {
    dispatch(GetRecentJobs()).unwrap().then((res) => {
      if (res.success) {
        setJob(res.data)
      }
    })
  }, [])
  return (
    <NavigationBar navigationBar={false}>
      <ScrollView style={{ flex: 1,  }} contentContainerStyle={{ justifyContent: "flex-start" }}>
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
          <Pressable onPress={() => navigation.goBack()}>
            <Image source={imagePath.backIcon} style={{ resizeMode: 'contain' }} />
          </Pressable>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: responsiveScreenFontSize(2),
              color: colors.textPrimary,
              fontWeight: '600',
            }}
          >
            Recent job
          </Text>
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>
        {/* {
          job?.meta?.total_jobs> 0 && 
        <Text style={{marginTop:responsiveScreenHeight(2), fontSize:responsiveScreenFontSize(1.8), color:colors.textPrimary, }}>{job?.meta?.total_jobs} Company's</Text>
        } */}
        <FlatList scrollEnabled={false} data={job} renderItem={({ item, index }) => {
          return (
            <>
              <Pressable style={{width:responsiveScreenWidth(90),marginHorizontal:"auto", paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin: 10, borderRadius: 15 }}>
                <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1), justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                    <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                  </View>
                  <Pressable onPress={() => navigation.navigate(routes.JOBDETAIL, { id: item.id })} style={{ flex: 1 }}>
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

                  <View style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                    <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                  </View>
                </View>
              </Pressable>
            </>
          )
        }} />

      </ScrollView>
    </NavigationBar>
  )
}

export default SuggestedJob

const styles = StyleSheet.create({})