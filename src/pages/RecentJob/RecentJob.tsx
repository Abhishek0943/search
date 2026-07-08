import { ActivityIndicator, FlatList, View, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { useAppDispatch } from '../../store'
import { GetRecentJobs } from '../../reducer/jobsReducer'
import { Header } from '../Company/Company'
import { JobCard } from '../CompanyDetails/CompanyDetails'
import { responsiveScreenFontSize, responsiveScreenHeight } from 'react-native-responsive-dimensions'

const SuggestedJob = () => {
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchJobs = (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    dispatch(GetRecentJobs({ page: pageNumber })).unwrap().then((res) => {
      console.log('res', res)
      setLoading(false)
      setLoadingMore(false)
      if (res.success) {
        setMeta(res.data.meta)
        if (pageNumber === 1) {
          setJob(res.data.jobs)
          setPage(2)
        } else {
          setJob(prev => [...(prev || []), ...res.data.jobs])
          setPage(pageNumber + 1)
        }
      }
    }).catch(() => {
      setLoading(false)
      setLoadingMore(false)
    })
  }

  useEffect(() => {
    fetchJobs(1)
  }, [])

  const onLoadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return
    fetchJobs(page)
  }

  return (
    <NavigationBar navigationBar={false}>
      <View style={{ flex: 1 }}>
        <Header title="Recent Jobs" />
        {
          loading ? (
            <ActivityIndicator style={{ marginTop: responsiveScreenHeight(40) }} size={responsiveScreenFontSize(3)} />
          ) : (
            <FlatList
              data={job}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.3}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              ListFooterComponent={
                loadingMore ? <ActivityIndicator size="small" style={{ marginVertical: responsiveScreenHeight(2) }} /> : null
              }
              renderItem={({ item }) => (
                <JobCard
                  refresh={() => fetchJobs(1)}
                  item={item}
                />
              )}
            />
          )
        }
      </View>
    </NavigationBar>
  )
}

export default SuggestedJob

const styles = StyleSheet.create({})