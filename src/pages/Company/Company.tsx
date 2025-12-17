import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetCompanies } from '../../reducer/jobsReducer'
import Icon from '../../utils/Icon'

const Company = () => {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<{ companies: Company[] }>({ companies: [] })
  const [activeCompany, setActiveCompany] = useState<Company>()
  useEffect(() => {
    dispatch(GetCompanies()).unwrap().then((res) => {
      if (res.success) {
        setJob(res.data)
      }
    })
  }, [])
  return (
    <NavigationBar navigationBar={false}>
      <ScrollView style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "flex-start" }}>
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
            Company
          </Text>
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>
        {
          job?.meta?.total_jobs > 0 &&
          <Text style={{ marginTop: responsiveScreenHeight(2), marginHorizontal: responsiveScreenWidth(5), fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary, }}>{job?.meta?.total_jobs} Company's</Text>
        }
        <FlatList scrollEnabled={false} contentContainerStyle={{ marginHorizontal: responsiveScreenWidth(5), gap: responsiveScreenHeight(1), marginVertical: responsiveScreenHeight(1) }} data={job.companies} renderItem={({ item, index }) => {
          return (
            <>
              <Pressable onPress={() => navigation.navigate(routes.COMPANYDETAILS, { id: item.id })} style={{ paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(2), backgroundColor: "#F5F5F5", borderRadius: 15, gap: responsiveScreenHeight(1) }}>
                <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1), justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ borderRadius: 6, height: responsiveScreenHeight(3), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                    <Image source={{ uri: item.logo }} style={{ height: "100%", aspectRatio: 1 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "500" }}>{item.name}</Text>
                  </View>
                  <Pressable onPress={() => { navigation.navigate(routes.JOBDETAIL, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", }}>
                    <Icon icon={{ type: "Ionicons", name: 'heart-outline' }} style={{ color: "#A9A9A9", fontSize: responsiveScreenFontSize(2.3) }} />
                  </Pressable>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.4), fontWeight: "600" }}>Solution Engineering</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                  <Image source={imagePath.star} />
                  <Text style={{ fontSize: responsiveScreenFontSize(1.5) }}>4.8(340 Review)</Text>
                </View>

                {
                  (item.city || item.country) &&
                  <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                    <Image style={{ transform: [{ scale: .9 }] }} source={imagePath.location} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.darkGray }}>{item.city || item.country}</Text>
                  </View>
                }


                <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                  <Image style={{ transform: [{ scale: .9 }] }} source={imagePath.bag} />
                  <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.darkGray }}>Job Posts : 90</Text>
                </View>


              </Pressable>
            </>
          )
        }} />

      </ScrollView>
    </NavigationBar>
  )
}

export default Company

const styles = StyleSheet.create({})