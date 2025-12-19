import { FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetCompanies, GetSuggestedJobs } from '../../reducer/jobsReducer'
import Icon from '../../utils/Icon'
import { formatSalaryRange } from '../../utils'
import { JobCard } from '../CompanyDetails/CompanyDetails'

const SuggestedJob = () => {
  const { colors } = useContext(ThemeContext)
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>()
  const [activeCompany, setActiveCompany] = useState<Company>()
  useEffect(() => {
    dispatch(GetSuggestedJobs()).unwrap().then((res) => {
      console.log(res)
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={imagePath.backIcon} style={{ resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: responsiveScreenFontSize(2),
              color: colors.textPrimary,
              fontWeight: '600',
            }}
          >
            Suggested job
          </Text>
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>
        {/* {
          job?.meta?.total_jobs> 0 && 
        <Text style={{marginTop:responsiveScreenHeight(2), fontSize:responsiveScreenFontSize(1.8), color:colors.textPrimary, }}>{job?.meta?.total_jobs} Company's</Text>
        } */}
        <FlatList scrollEnabled={false} data={job}style={{marginHorizontal:responsiveScreenWidth(3)}} renderItem={({ item, index }) => {
          return (
            <>
              <JobCard item={item} />
            </>
          )
        }} />

      </ScrollView>
    </NavigationBar>
  )
}

export default SuggestedJob

const styles = StyleSheet.create({})