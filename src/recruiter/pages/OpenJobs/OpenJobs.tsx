import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { Header } from '../../../pages/Company/Company'
import { ThemeContext } from '../../../context/ThemeProvider'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { useAppDispatch } from '../../../store'
import { deleteJob, GetJobByStatus } from '../../../reducer/jobsReducer'
import imagePath from '../../../assets/imagePath'
import { formatSalaryRange } from '../../../utils'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../../constants/values'
import Text from '../../../components/Text'
import { useAlert } from '../../../context/AlertContext'
import { RecruiterProfile } from '../../../reducer/recruiterReducer'
export default function OpenJobs() {
    const { colors } = useContext(ThemeContext)
    const [page, setPage] = useState("active")
    const dispatch = useAppDispatch()
    const [job, setJob] = useState({})
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const [loading, setLoading] = useState(true)
    const { showConfirm } = useAlert();

    useFocusEffect(useCallback(
        () => {
            setJob({ ...job, jobs: [] })
            setLoading(true)
            dispatch(GetJobByStatus({ status: page })).unwrap().then((res) => {
                if (res.success && 'data' in res) {
                    setJob(res?.data)
                }
                setLoading(false)

            })
        },
        [page],
    )
    )
    return (
        <NavigationBar navigationBar={false}>
            <ScrollView>

                <Header title='Open Jobs' />
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: responsiveScreenWidth(5), marginVertical: responsiveScreenHeight(2), gap: responsiveScreenWidth(3) }}>
                    <Text onPress={() => setPage("active")} style={{ color: page === "active" ? colors.white : "#A9A9A9", backgroundColor: page === "active" ? colors.primary : "#ffffff", paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Active Job{job.active_jobs_count > 0 && ` (${job.active_jobs_count})`}</Text>
                    <Text onPress={() => setPage("expired")} style={{ color: page === "expired" ? colors.white : "#A9A9A9", backgroundColor: page === "expired" ? colors.primary : "#ffffff", paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Expired Job{job.expired_jobs_count
                        > 0 && ` (${job.expired_jobs_count
                        })`}</Text>
                </TouchableOpacity>
                {
                    loading ? <><ActivityIndicator size={responsiveScreenFontSize(3)} style={{ marginTop: responsiveScreenHeight(35) }} /></> : <>

                        <FlatList
                            ListEmptyComponent={() => <EmptyComp />}
                            data={job?.jobs} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => (
                                <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), marginHorizontal: responsiveScreenWidth(5), backgroundColor: colors.lightGrayNatural, margin: 10, borderRadius: 10, overflow: "hidden", elevation: 5 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2), }}>
                                        <View>
                                            <Image source={imagePath.job} />
                                        </View>
                                        <Text style={{ flex: 1, color: colors.primary, fontSize: responsiveScreenFontSize(2), fontWeight: "bold" }}>{item.title}</Text>
                                        <Pressable onPress={() => navigation.navigate(routes.ADDJOB, { ...item })} style={{ height: responsiveScreenHeight(3), aspectRatio: 1 }}>
                                            <Image source={imagePath.edit} style={{ height: "100%", width: "100%" }} />
                                        </Pressable>
                                        <Pressable onPress={async () => {
                                            const ok = await showConfirm({
                                                title: "Delete",
                                                message: "Are you sure you want to delete this Job?",
                                                okText: "Delete",
                                                cancelText: "Cancel",
                                            })
                                            if (ok)
                                                dispatch(deleteJob({ id: item.id })).unwrap().then((res) => {
                                                    res.success && dispatch(GetJobByStatus({ status: page })).unwrap().then((res) => {
                                                        if (res.success && 'data' in res) {
                                                            setJob(res?.data)
                                                        }
                                                        dispatch(RecruiterProfile())
                                                    })
                                                })
                                        }} style={{ height: responsiveScreenHeight(3), aspectRatio: 1 }}>
                                            <Image source={imagePath.delete} style={{ height: "100%", width: "100%" }} />
                                        </Pressable>
                                    </View>
                                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(1.5) }}>
                                        {
                                            item?.jobType && <Text style={{ backgroundColor: "#E4EEFF", textTransform: "capitalize", borderWidth: 1, borderColor: "#E4EEFF", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{item.jobType}</Text>
                                        }
                                    </View>
                                    <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                                        {
                                            item?.salary && <>

                                                <Text style={{ color: "#494949", fontSize: responsiveScreenFontSize(2.2), fontWeight: "700" }}>{item.salary_currency}{formatSalaryRange(item.salary)}/</Text>
                                                <Text style={{ color: "#494949", flex: 1, marginTop: responsiveScreenHeight(.3), fontWeight: "700" }}>{item?.salary_period.salary_period
                                                }</Text>
                                            </>
                                        }
                                    </View>





                                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), marginVertical: responsiveScreenHeight(1) }}>
                                        <View style={{ height: responsiveScreenHeight(2.5), aspectRatio: 1 }}>
                                            <Image source={imagePath.location3} style={{ height: "100%", width: "100%" }} />
                                        </View>
                                        <Text style={{ color: "#494949", fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.jobLocation}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), marginBottom: responsiveScreenHeight(1) }}>
                                        <View style={{ height: responsiveScreenHeight(2.5), aspectRatio: 1 }}>
                                            <Image source={imagePath.user3} style={{ height: "100%", width: "100%" }} />
                                        </View>
                                        <Text style={{ color: "#494949", fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.candidates_count} Candidates</Text>
                                    </View>
                                    <Text style={{ color: colors.darkGray, fontWeight: "600", fontSize: responsiveScreenFontSize(1.6) }}>{formatDate(item.posted_at)}</Text>
                                    <TouchableOpacity
                                        onPress={() => { navigation.navigate(routes.ACTIVECANDIDATE, { jobId: item?.id }) }}
                                        // onPress={() =>{}}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            marginTop: responsiveScreenHeight(2),
                                            borderRadius: 15,
                                            gap: responsiveScreenWidth(1),
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: colors.primary,
                                            paddingHorizontal: responsiveScreenWidth(3),
                                            paddingVertical: responsiveScreenHeight(1.5),
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.white,
                                                fontSize: responsiveScreenFontSize(1.8),
                                            }}
                                        >
                                            Candidate
                                        </Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )} />
                    </>
                }
            </ScrollView>
        </NavigationBar >
    )
}
const formatDate = (isoDate) => {
    const date = new Date(isoDate);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
};
export const EmptyComp =
    ({bottom, heading = "No results found", text = "Content will appear once it becomes available" }) => {
        const { colors } = useContext(ThemeContext)

        return (<View style={{marginHorizontal:"auto", width: responsiveScreenWidth(90), height: responsiveScreenHeight(70), zIndex: 100, top: 0, right: 0, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: responsiveScreenFontSize(3), fontWeight: "700" }}>{heading}</Text>
            <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.darkGrayNatural, width: "80%", textAlign: "center", fontWeight: "600" }}>{text}</Text>
            {
                bottom&& bottom()
            }
        </View>)
    }
const styles = StyleSheet.create({})