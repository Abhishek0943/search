import { FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, View, Pressable, ActivityIndicator, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { Bookmark, GetCompany, GetJob, ReportCompany, ReportJob } from '../../reducer/jobsReducer'
import { AutoHeightWebView } from '../Jobdetail/Jobdetail'
import { formatSalaryRange } from '../../utils'
import Icon from '../../utils/Icon'
import { routes } from '../../constants/values'
import Text from '../../components/Text'
import { Header } from '../Company/Company'
import { useAlert } from '../../context/AlertContext'

const CompanyDetails = () => {
    const { colors } = useContext(ThemeContext)
    const route = useRoute()
    const { id, company } = route.params as { id: number, company: boolean }
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState(true)
    const dispatch = useAppDispatch()
    const [job, setJob] = useState<Company>()
    const { showConfirm, showAlert } = useAlert();

    useEffect(() => {
        if (!id) return
        dispatch(GetCompany({ id })).unwrap().then((res) => {
            if (res.success) {
                setJob(res.data)
            }
            setLoading(false)
        })
    }, [id])

    return (
        <NavigationBar navigationBar={false}>
            <ScrollView style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "flex-start" }}>
                <Header title="Company Details" />
                {
                    loading ? <>
                        <ActivityIndicator style={{ marginTop: responsiveScreenHeight(40) }} size={responsiveScreenFontSize(3)} />
                    </> : <>
                        <Text style={{ paddingHorizontal: responsiveScreenWidth(5), color: colors.textPrimary, fontWeight: "900", fontSize: responsiveScreenFontSize(2.6), marginTop: responsiveScreenHeight(1) }}>{job?.name}</Text>
                        {
                            job?.jobs[0]?.id &&
                            <Text style={{ paddingHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(1), color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), }}>{job?.jobs[0].title}</Text>
                        }
                        {
                            (job?.city || job?.country || job?.company_address) &&
                            <Text style={{ paddingHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(.5), color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), }}>{job?.company_address || job?.city || job?.country}</Text>
                        }
                        <View style={{ borderBottomColor: colors.textDisabled, borderBottomWidth: .5, marginTop: responsiveScreenHeight(2) }}></View>
                        <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1), marginBottom: 0 }}>About Company</Text>
                        <View style={{ paddingHorizontal: responsiveScreenWidth(5), }}>
                            {
                                job?.description &&
                                <AutoHeightWebView html={job.description} margin={0} />
                            }
                        </View>
                        <View style={{ borderBottomColor: colors.textDisabled, borderBottomWidth: .5, }}></View>
                        <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1), marginBottom: 0 }}>Company details</Text>

                        <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(2), marginHorizontal: responsiveScreenWidth(5), rowGap: responsiveScreenHeight(1.54), flexWrap: "wrap", justifyContent: "space-between", }}>
                            {
                                job.is_verified &&
                                <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                                    <Image source={imagePath.verify} style={{ transform: [{ scale: 1.3 }], }} />
                                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Verified</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>Yes</Text>
                                </View>
                            }
                            <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>

                                <Image source={imagePath.users} style={{ transform: [{ scale: 1.3 }], }} />
                                <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Company size</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>Yes</Text>
                            </View>
                            {
                                job.founded_at &&
                                <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                                    <Image source={imagePath.verify} style={{ transform: [{ scale: 1.3 }], }} />
                                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Founded in</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.founded_at}</Text>
                                </View>
                            }
                            {
                                job.organizationType &&
                                <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                                    <Image source={imagePath.company2} style={{ transform: [{ scale: 1.3 }], }} />
                                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Organization
                                        Type</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.organizationType}</Text>
                                </View>
                            }
                            {
                                job.no_of_offices &&
                                <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                                    <Image source={imagePath.company2} style={{ transform: [{ scale: 1.3 }], }} />
                                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Total Offices</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.no_of_offices}</Text>
                                </View>
                            }
                            {
                                job.jobs_count &&
                                <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                                    <Image source={imagePath.bag2} style={{ transform: [{ scale: 1.3 }], }} />
                                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Opened Jobs</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.jobs_count}</Text>
                                </View>
                            }
                        </View>
                        <View style={{ borderBottomColor: colors.textDisabled, borderBottomWidth: .5, marginTop: responsiveScreenHeight(2) }}></View>
                        <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1), marginBottom: 0 }}>Current openings</Text>
                        <FlatList scrollEnabled={false} data={job.jobs} renderItem={({ item, index }) => {
                            return (
                                <>
                                    <JobCard item={item} refresh={() => {
                                        dispatch(GetCompany({ id })).unwrap().then((res) => {
                                            if (res.success) {
                                                setJob(res.data)
                                            }
                                        })
                                    }} company={company} />
                                </>
                            )
                        }} />
                        {
                            user?.id &&
                            <Text onPress={async () => {
                                const ok = await showConfirm({
                                    title: "Report this Company",
                                    message: "Are you sure you want to report this Company?",
                                    okText: "Report",
                                    cancelText: "Cancel",
                                })
                                if (ok) {
                                    dispatch(ReportCompany({ your_email: user?.email, your_name: user?.name, company_url: job.companyUrl })).unwrap().then(res => {
                                        showAlert({
                                            title: res.success ? "Success message" : "error message",
                                            message: res.message
                                        })
                                    })
                                }
                            }} style={{ color: "#FF383C", width: "90%", marginVertical: responsiveScreenHeight(2), marginHorizontal: "auto", backgroundColor: "#FFE5E6", borderWidth: 1, borderColor: "#FF383C", paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Report Abuse</Text>
                        }

                    </>
                }

            </ScrollView>
        </NavigationBar>
    )
}
export const JobCard = ({ refresh, item, company, margin = responsiveScreenWidth(3) }: { margin?: number, item: any, company?: boolean }) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const dispatch = useAppDispatch()
    const { showAlert } = useAlert();
    const { user } = useAppSelector(state => state.userStore)
    return (
        <Pressable style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin, borderRadius: 15 }}>
            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ borderRadius: 6, height: responsiveScreenHeight(5), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                    <Image resizeMode='contain' source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                </View>
                <Pressable onPress={() => !company && navigation.navigate(routes.JOBDETAIL, { id: item.id })} style={{ flex: 1, gap: responsiveScreenHeight(0.5) }}>
                    <Text numberOfLines={1} style={{ textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }} >{item.company_info.name}</Text>
                    <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{item.title}</Text>
                </Pressable>
                {
                    company || !user?.id ? null :
                        <TouchableOpacity onPress={() => dispatch(Bookmark({ id: item.id })).unwrap().then((res) => {
                            if (res.success) {
                                refresh()
                            }
                            else {
                                showAlert({
                                    title: "Validation",
                                    message: res.message,
                                })
                            }
                        })}>
                            <Image source={item.is_favorited ? imagePath.activeBookmark : imagePath.bookmark} />

                        </TouchableOpacity>
                }
            </View>
            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                {
                    item.jobType && <Text style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{item.jobType}</Text>
                }
                {
                    item.functionalArea && <Text style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{item.functionalArea}</Text>
                }
            </View>
            <View style={{ flexDirection: "row" }}>
                <Text numberOfLines={2} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                    {
                        item.salary && <>
                            <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{item.salary_currency}{formatSalaryRange(item.salary)}/</Text>
                            <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{item.salary_period}</Text>
                        </>
                    }
                </Text>
                {
                    company ? null :
                        <TouchableOpacity onPress={() => { !item.is_applied && navigation.navigate(routes.APPLY, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                            <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>{item.is_applied ? "Applied" : "Apply Now"}</Text>
                            {!item.is_applied && <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />}
                        </TouchableOpacity>
                }
            </View>
        </Pressable>

    )
}
export default CompanyDetails

const styles = StyleSheet.create({})