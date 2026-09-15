import { View, ScrollView, Image, Pressable, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { GetJobApplication } from '../../reducer/jobsReducer'
import Text from '../../components/Text'
import Button from '../../components/Button'

// --- Status badge config ---
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; borderColor?: string }> = {
  applied: { label: 'SENT', bg: '#E8F5E9', color: '#2E7D32', borderColor: '#2E7D32' },
  shortlist: { label: 'SHORTLISTED', bg: '#E8F5E9', color: '#2E7D32', borderColor: '#2E7D32' },
  viewed: { label: 'VIEWED', bg: '#FFF8E1', color: '#E8A317', borderColor: '#E8A317' },
  hired: { label: 'SHORTLISTED', bg: '#E8F5E9', color: '#2E7D32', borderColor: '#2E7D32' },
  rejected: { label: 'NOT THIS TIME', bg: '#FFEBEE', color: '#D32F2F', borderColor: '#D32F2F' },
  closed: { label: 'CLOSED', bg: '#F5F5F5', color: '#616161', borderColor: '#9E9E9E' },
}

const getStatusStyle = (status: string) => {
  return STATUS_CONFIG[status?.toLowerCase()] || { label: status?.toUpperCase() || 'SENT', bg: '#E8F5E9', color: '#2E7D32', borderColor: '#2E7D32' }
}

const AVATAR_COLORS = ['#1A5FA8', '#0E8A5A', '#6C3483', '#D4AC0D', '#CB4335', '#2874A6', '#1ABC9C', '#E67E22']
const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

// --- Helper: relative time ---
const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// --- Helper: status note ---
const getStatusNote = (item: any) => {
  const status = item.status?.toLowerCase()
  if (status === 'applied') return 'Not opened yet · closes 15 Aug'
  if (status === 'viewed') return 'Opened yesterday · closes 18 Aug'
  if (status === 'shortlist' || status === 'hired') return `You will hear either way by 15 Aug`
  if (status === 'rejected') return 'They went with someone else'
  if (status === 'closed') return ''
  return ''
}

// --- Filter Tab ---
type FilterTab = 'all' | 'active' | 'closed'

const ApplyJob = () => {
  const { colors } = useContext(ThemeContext)
  const [cvs, setCvs] = useState<{ jobs: any[]; meta: any }>({ jobs: [], meta: {} })
  const dispatch = useAppDispatch()
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { user } = useAppSelector(state => state.userStore)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const getCvs = (page = 1) => {
    dispatch(GetJobApplication({ search: '', page }))
      .unwrap()
      .then(res => {
        setLoading(false)
        if (res.success !== false) {
          if (page === 1) {
            setCvs(res.data)
          } else {
            setCvs(prev => ({
              jobs: [...prev.jobs, ...res.data.jobs],
              meta: res.data.meta
            }))
          }
        }
      })
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      getCvs(1)
    }, [])
  )

  const loadMore = () => {
    if (cvs?.meta?.current_page < cvs?.meta?.last_page) {
      getCvs(cvs.meta.current_page + 1)
    }
  }

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return cvs.jobs
    if (activeFilter === 'active') {
      return cvs.jobs.filter((j: any) => {
        const s = j.status?.toLowerCase()
        return s === 'applied' || s === 'viewed' || s === 'shortlist' || s === 'hired'
      })
    }
    // closed
    return cvs.jobs.filter((j: any) => {
      const s = j.status?.toLowerCase()
      return s === 'rejected' || s === 'closed'
    })
  }, [cvs.jobs, activeFilter])

  const activeCount = useMemo(() => cvs.jobs.filter((j: any) => {
    const s = j.status?.toLowerCase()
    return s === 'applied' || s === 'viewed' || s === 'shortlist' || s === 'hired'
  }).length, [cvs.jobs])

  const closedCount = useMemo(() => cvs.jobs.filter((j: any) => {
    const s = j.status?.toLowerCase()
    return s === 'rejected' || s === 'closed'
  }).length, [cvs.jobs])

  const totalCount = cvs.jobs.length

  // --- Filter Tab Component ---
  const FilterChip = ({ label, count, isActive, onPress }: { label: string; count: number; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(0.9),
        borderRadius: 20,
        backgroundColor: isActive ? colors.primary : colors.white,
        borderWidth: isActive ? 0 : 1,
        borderColor: colors.gray,
        marginRight: responsiveWidth(2),

      }}
    >
      <Text style={{
        fontSize: responsiveScreenFontSize(1.6),
        fontWeight: '800',
        color: isActive ? colors.white : colors.textPrimary,
      }}>
        {label} {count}
      </Text>
    </TouchableOpacity>
  )

  const ApplicationCard = ({ item }: { item: any }) => {
    const companyName = item.company_info?.name || ''
    const initials = getInitials(companyName)
    const avatarColor = getAvatarColor(companyName)
    const statusStyle = getStatusStyle(item.status)
    const relativeTime = getRelativeTime(item.created_at || item.applied_date)
    const note = getStatusNote(item)

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate(routes.JOBDETAIL, { id: item.id })}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          paddingHorizontal: responsiveWidth(4),
          paddingTop: responsiveHeight(2),
          paddingBottom: note ? responsiveHeight(0) : responsiveHeight(2),
          marginBottom: responsiveHeight(1.2),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F0F0F0',
        }}
      >
        {/* Top row: avatar, info, date + badge */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Avatar */}
          <View style={{
            width: responsiveWidth(11),
            height: responsiveWidth(11),
            borderRadius: responsiveWidth(5.5),
            backgroundColor: avatarColor + '18',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: responsiveWidth(3),
          }}>
            <Text style={{
              fontSize: responsiveScreenFontSize(1.7),
              fontWeight: '700',
              color: avatarColor,
            }}>
              {initials}
            </Text>
          </View>

          {/* Title + company */}
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{
              fontSize: responsiveScreenFontSize(1.9),
              fontWeight: '700',
              color: '#1A1A2E',
            }}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={{
              fontSize: responsiveScreenFontSize(1.6),
              color: '#6B7280',
              marginTop: responsiveHeight(0.3),
            }}>
              {companyName}
            </Text>
          </View>

          {/* Date + Status */}
          <View style={{ alignItems: 'flex-end', marginLeft: responsiveWidth(2) }}>
            <Text style={{
              fontSize: responsiveScreenFontSize(1.4),
              color: '#9CA3AF',
              marginBottom: responsiveHeight(0.5),
            }}>
              {relativeTime}
            </Text>
            <View style={{
              paddingHorizontal: responsiveWidth(2.5),
              paddingVertical: responsiveHeight(0.4),
              borderRadius: 6,
              borderWidth: 1,
              borderColor: statusStyle.borderColor || statusStyle.color,
              backgroundColor: statusStyle.bg,
            }}>
              <Text style={{
                fontSize: responsiveScreenFontSize(1.2),
                fontWeight: '700',
                color: statusStyle.color,
                letterSpacing: 0.5,
              }}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
        </View>

        {note ? (
          <View style={{
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            marginTop: responsiveHeight(1.5),
            paddingVertical: responsiveHeight(1.2),
          }}>
            <Text style={{
              fontSize: responsiveScreenFontSize(1.4),
              color: '#9CA3AF',
            }}>
              {note}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    )
  }
  const EmptyState = () => (
    <>
      <View style={{ width: responsiveWidth(100), aspectRatio: 390 / 440, position: "relative", right: responsiveWidth(5), marginVertical: responsiveHeight(2) }}>
        <Image source={require("./ApplicationsNotFound.png")} style={{ width: "100%", height: "100%", }} />
      </View>
      <Button backgroundColor={colors.primary} label='Find a job to apply for' />
    </>

  )
  return (
    <NavigationBar name={routes.APPLYJOB}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: responsiveHeight(3) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          paddingHorizontal: responsiveWidth(5),
          paddingTop: responsiveHeight(1),
          paddingBottom: responsiveHeight(1.5),
        }}>
          <Text style={{
            fontSize: responsiveScreenFontSize(3.2),
            fontWeight: '800',
            color: colors.textPrimary
          }}>
            Applications
          </Text>
        </View>
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: responsiveWidth(5),
          marginBottom: responsiveHeight(2),
        }}>
          <FilterChip
            label="All"
            count={totalCount}
            isActive={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterChip
            label="Active"
            count={activeCount}
            isActive={activeFilter === 'active'}
            onPress={() => setActiveFilter('active')}
          />
          <FilterChip
            label="Closed"
            count={closedCount}
            isActive={activeFilter === 'closed'}
            onPress={() => setActiveFilter('closed')}
          />
        </View>
        {loading ? (
          <ActivityIndicator
            style={{ marginTop: responsiveHeight(25) }}
            size={responsiveScreenFontSize(4)}
            color={colors.primary}
          />
        ) : (
          <>
            <FlatList
              ListEmptyComponent={() => <EmptyState />}
              scrollEnabled={false}
              contentContainerStyle={{
                paddingHorizontal: responsiveWidth(5),
              }}
              data={filteredJobs}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => <ApplicationCard item={item} />}
            />
          </>
        )}
      </ScrollView>
    </NavigationBar>
  )
}

export default ApplyJob