import { FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetBookmarkJobs, GetCompanies, GetSuggestedJobs } from '../../reducer/jobsReducer'
import Icon from '../../utils/Icon'
import { formatSalaryRange } from '../../utils'
import { JobCard } from '../CompanyDetails/CompanyDetails'
import { Header } from '../Company/Company'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'

const SuggestedJob = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();

  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>()
  const [loading, setLoading] = useState(true)
  const route = useRoute()

  const isBookmark = route.params?.isBookmark || false

  useEffect(() => {
    if (isBookmark) {
      dispatch(GetBookmarkJobs()).unwrap().then((res) => {
        setLoading(false)
        if (res.success) {
          setJob(res.data.jobs)
        }
      })
    }
    else {
      dispatch(GetSuggestedJobs()).unwrap().then((res) => {
        setLoading(false)
        if (res.success) {
          setJob(res.data)
        }
      })
    }
  }, [isBookmark])
  return (
    <NavigationBar navigationBar={false}>
      <ScrollView style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "flex-start" }}>
        <Header title={isBookmark ? "Save Job" : "Suggested Jobs"} />
        {
          loading ? <>
            <ActivityIndicator style={{ marginTop: responsiveScreenHeight(40) }} size={responsiveScreenFontSize(3)} />
          </> :
            <FlatList
              ListEmptyComponent={() => <> <EmptyComp bottom={() => {
                return (
                  <>
                    <Pressable
                      onPress={() => { navigation.goBack() }}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: responsiveScreenHeight(2),
                        borderRadius: 6,
                        gap: responsiveScreenWidth(1),
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        paddingHorizontal: responsiveScreenWidth(3),
                        paddingVertical: responsiveScreenHeight(1.5),
                        marginBottom: responsiveScreenHeight(3)
                      }}
                    >
                      <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                        Go Back
                      </Text>
                    </Pressable>
                  </>
                )
              }} />
              </>
              }
              scrollEnabled={false} data={job} style={{ marginHorizontal: responsiveScreenWidth(3) }} renderItem={({ item, index }) => {
                return (
                  <>
                    <JobCard refresh={() => {
                      if (isBookmark) {
                        dispatch(GetBookmarkJobs()).unwrap().then((res) => {
                          setLoading(false)
                          if (res.success) {
                            setJob(res.data.jobs)
                          }
                        })
                      }
                      else {
                        dispatch(GetSuggestedJobs()).unwrap().then((res) => {
                          setLoading(false)
                          if (res.success) {
                            setJob(res.data)
                          }
                        })
                      }
                    }} item={item} />
                  </>
                )
              }} />
        }


      </ScrollView>
    </NavigationBar>
  )
}

export default SuggestedJob

const styles = StyleSheet.create({})