import { FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetCompany, GetJob } from '../../reducer/jobsReducer'
import { AutoHeightWebView } from '../Jobdetail/Jobdetail'
import { formatSalaryRange } from '../../utils'
import Icon from '../../utils/Icon'
import { routes } from '../../constants/values'
import Text from '../../components/Text'
import { Header } from '../Company/Company'

const CompanyDetails = () => {
    const { colors } = useContext(ThemeContext)
    const route = useRoute()
    const { id } = route.params as { id: number }
    const navigation: NavigationProp<ParamListBase> = useNavigation()

    const dispatch = useAppDispatch()
    const [job, setJob] = useState<Company>()
    useEffect(() => {
        if (!id) return
        dispatch(GetCompany({ id })).unwrap().then((res) => {
            if (res.success) {
                setJob(res.data)
            }
            console.log(res)
        })
    }, [id])
    if (!job) return
    return (
        <NavigationBar navigationBar={false}>
            <ScrollView style={{ flex: 1, }} contentContainerStyle={{ justifyContent: "flex-start" }}>
              <Header title="Company Details" />
                <Text style={{ paddingHorizontal: responsiveScreenWidth(5), color: colors.textPrimary, fontWeight: "900", fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1) }}>{job?.name}</Text>
                {
                    (job?.city || job?.country) &&
                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.8), }}>{job?.city || job?.country}</Text>
                }
                <View style={{ borderBottomColor: colors.textDisabled, borderBottomWidth: .5, }}></View>
                <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1), marginBottom: 0 }}>About Company</Text>
                <View style={{ paddingHorizontal: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(1) }}>

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
                        job.openJobs &&
                        <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                            <Image source={imagePath.bag2} style={{ transform: [{ scale: 1.3 }], }} />
                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Opened Jobs</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.openJobs}</Text>
                        </View>
                    }
                </View>
                <View style={{ borderBottomColor: colors.textDisabled, borderBottomWidth: .5, marginTop: responsiveScreenHeight(2) }}></View>
                <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginVertical: responsiveScreenHeight(1), marginBottom: 0 }}>Current openings</Text>
                <FlatList scrollEnabled={false} data={job.jobs} renderItem={({ item, index }) => {
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
export const JobCard = ({ item }: { item: any }) => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    return (
        <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin: responsiveScreenWidth(3), borderRadius: 15 }}>
            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ borderRadius: 6, height: responsiveScreenHeight(5), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                    <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(routes.JOBDETAIL, { id: item.id })} style={{ flex: 1 , gap: responsiveScreenHeight(0.5) }}>
                    <Text numberOfLines={1} style={{ textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }} >{item.company_info.name}</Text>
                    <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{item.title}</Text>
                </TouchableOpacity>
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

                <TouchableOpacity onPress={() => { navigation.navigate(routes.APPLY, { id: item.id }) }} style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                    <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>

    )
}
export default CompanyDetails

const styles = StyleSheet.create({})