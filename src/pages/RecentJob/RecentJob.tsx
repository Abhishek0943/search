import { FlatList,ScrollView, StyleSheet, } from 'react-native'
import React, {  useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { useAppDispatch } from '../../store'
import { GetRecentJobs, } from '../../reducer/jobsReducer'
import { Header } from '../Company/Company'
import { JobCard } from '../CompanyDetails/CompanyDetails'

const SuggestedJob = () => {
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>()
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
     <Header title="Recent Jobs" />
        <FlatList scrollEnabled={false} data={job} renderItem={({ item, index }) => {
          return (
            <>
             <JobCard item={item}/>
            </>
          )
        }} />
      </ScrollView>
    </NavigationBar>
  )
}

export default SuggestedJob

const styles = StyleSheet.create({})