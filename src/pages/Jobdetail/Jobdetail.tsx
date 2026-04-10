import { Image, TouchableOpacity, ScrollView, StyleSheet, View, ActivityIndicator, Pressable, Share, Platform } from 'react-native'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { Bookmark, GetJob, ReportJob, } from '../../reducer/jobsReducer'
import { WebView } from 'react-native-webview';
import { formatSalaryRange } from '../../utils'
import Text from '../../components/Text'
import { Header } from '../Company/Company'
import { useAlert } from '../../context/AlertContext'
const Jobdetail = () => {
    const { colors } = useContext(ThemeContext)
    const route = useRoute()
    const { id } = route.params as { id: number }
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState(true)
    const dispatch = useAppDispatch()
    const [job, setJob] = useState<Job>()
    const [pageVal, setPageVal] = useState<"dis" | "company" | "review">("dis")
    useEffect(() => {
        dispatch(GetJob({ id })).unwrap().then((res) => {
            if (res.success) {
                setJob(res.data.jobDetail)
                console.log(res.data.jobDetail)
            }
            setLoading(false)
        })
    }, [id])
    const shareJobPost = async (job) => {
        try {
            const shareUrl = `${job.jobUrl}`;
            await Share.share({
                message: `🔥 New Job Opportunity!\n\nApply here:\n${shareUrl}`,
                url: shareUrl,
                title: "Search Talent",
            });
        } catch (error) {
        }
    };
    const { showConfirm, showAlert } = useAlert();
    return (
        <NavigationBar navigationBar={false} name={routes.HOME}>
            <ScrollView style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(2), }} contentContainerStyle={{ justifyContent: "flex-start" }}>
                <Header title="Job details" />
                {
                    loading ? <View style={{ marginTop: responsiveScreenHeight(40) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View> :
                        <>
                            <TouchableOpacity style={{ position: "relative", paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin: 10, borderRadius: 15 }}>
                                <Image source={imagePath.circle4} style={{ position: "absolute", top: 0, right: 0 }} />
                                <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "center" }}>
                                    <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                                        <Image source={{ uri: job?.company_info?.image }} style={{ height: "100%", aspectRatio: 1 }} />
                                    </View>
                                    <TouchableOpacity style={{ flex: 1, gap: responsiveScreenHeight(1) }}>
                                        <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{job?.title}</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1), }}>
                                            <Image source={imagePath.box} />
                                            <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(45), color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{job.company_info.name}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
                                            <Image source={imagePath.location} />
                                            <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{job?.jobLocation}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                                    {
                                        job.jobType && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{job?.jobType}</Text>
                                    }
                                    {
                                        job.functionalArea && <Text numberOfLines={1} style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{job?.functionalArea}</Text>
                                    }
                                </View>
                                <View style={{ flexDirection: "row" }}>
                                    <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                                        {
                                            job.salary && <>
                                                <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{job.salary_currency}{formatSalaryRange(job.salary)}/</Text>
                                                <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{job.salary_period}</Text>
                                            </>
                                        }
                                        {
                                            user?.id &&
                                            <TouchableOpacity onPress={() => dispatch(Bookmark({ id: job.id })).unwrap().then((res) => {
                                                if (res.success) {
                                                    dispatch(GetJob({ id })).unwrap().then((res) => {
                                                        if (res.success) {
                                                            setJob(res.data.jobDetail)
                                                        }
                                                    })
                                                }
                                                else {
                                                    showAlert({
                                                        title: "Validation",
                                                        message: res.message,
                                                    })
                                                }
                                            })}>
                                                <Image source={job.is_favorited ? imagePath.activeBookmark : imagePath.bookmark} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <Pressable style={{ flexDirection: "row", justifyContent: "space-between", margin: 10, borderRadius: 15, gap: responsiveScreenWidth(3) }}>
                                {
                                    job.expired ? <>
                                        <Text onPress={async () => {
                                        }} style={{ color: "#FF383C", backgroundColor: "#FFE5E6", borderWidth: 1, borderColor: "#FF383C", paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Expired</Text>
                                    </> : <>
                                        <Text onPress={() => shareJobPost(job)} style={{ color: colors.primary, backgroundColor: "#EEF4FF", borderWidth: 1, borderColor: colors.primary, paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Share To Friend</Text>
                                        {
                                            user?.id &&
                                            <Text onPress={async () => {
                                                const ok = await showConfirm({
                                                    title: "Report this job",
                                                    message: "Are you sure you want to report this job?",
                                                    okText: "Report",
                                                    cancelText: "Cancel",
                                                    waitForOk: true,
                                                    onOkPress: async () => {
                                                        const res = await dispatch(
                                                            ReportJob({ your_email: user.email, your_name: user.name, job_url: job.jobUrl })
                                                        ).unwrap();

                                                        showAlert({
                                                            title: res.success ? "Success message" : "Error message",
                                                            message: res.message,
                                                        });

                                                        return true; // ✅ close confirm modal now
                                                    },
                                                })
                                                // if (ok) {
                                                //     dispatch(ReportJob({ your_email: user.email, your_name: user.name, job_url: job.jobUrl })).unwrap().then(res => {
                                                //         showAlert({
                                                //             title: res.success ? "Success message" : "error message",
                                                //             message: res.message
                                                //         })
                                                //     })
                                                // }
                                            }} style={{ color: "#FF383C", backgroundColor: "#FFE5E6", borderWidth: 1, borderColor: "#FF383C", paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Report Abuse</Text>
                                        }
                                    </>
                                }
                            </Pressable>
                            <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: "#EEF4FF", flexDirection: "row", justifyContent: "space-between", margin: 10, borderRadius: 15 }}>
                                <Text onPress={() => setPageVal("dis")} style={{ color: pageVal === "dis" ? colors.white : "#478BFF75", backgroundColor: pageVal === "dis" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Job Description</Text>
                                <Text onPress={() => setPageVal("company")} style={{ color: pageVal === "company" ? colors.white : "#478BFF75", backgroundColor: pageVal === "company" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Company</Text>
                                {/* <Text onPress={() => setPageVal("review")} style={{ color: pageVal === "review" ? colors.white : "#478BFF75", backgroundColor: pageVal === "review" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Review</Text> */}
                            </TouchableOpacity>
                            {
                                pageVal === "dis" && <>
                                    {
                                        job.job_description && job.job_description.map((e) => {
                                            return (
                                                <>
                                                    <Text style={{ marginHorizontal: 10, fontSize: responsiveScreenFontSize(2.1), textTransform: "capitalize", fontWeight: "700" }}>{e.title}</Text>
                                                    {
                                                        typeof e.data === "string" && <AutoHeightWebView html={e.data} />
                                                    }
                                                    {
                                                        typeof e.data === "object" && <>
                                                            {e.data.map((i) => {
                                                                return (
                                                                    <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(1), marginHorizontal: 10, alignItems: "center" }}>
                                                                        <Image source={imagePath.circle} />
                                                                        <Text style={{ marginHorizontal: 10, fontSize: responsiveScreenFontSize(2), color: colors.textSecondary, textTransform: "capitalize" }}>{i.skill}</Text>
                                                                    </View>
                                                                )
                                                            })}
                                                        </>
                                                    }
                                                </>
                                            )
                                        })
                                    }
                                </>
                            }
                            {
                                pageVal === "company" && <>
                                    {
                                        job?.company_info?.description &&
                                        <>
                                            <Text style={{ marginHorizontal: 10, fontSize: responsiveScreenFontSize(2.1), textTransform: "capitalize", fontWeight: "700" }}>About This Company</Text>
                                            <AutoHeightWebView html={job.company_info.description} />
                                        </>
                                    }
                                </>
                            }
                            {
                                pageVal === "review" && <>
                                    <Image source={require("./review.png")} style={{ margin: "auto", height: responsiveScreenWidth(177), resizeMode: "cover", width: responsiveScreenWidth(90) }} />
                                </>
                            }
                            {
                                !job.expired && <>
                                    {
                                        !job?.is_applied ?
                                            <TouchableOpacity
                                                onPress={() => { user?.id ? navigation.navigate(routes.APPLY, { id: job.id }) : navigation.navigate(routes.LOGIN) }}
                                                style={{
                                                    width: '96%',
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: responsiveScreenHeight(2),
                                                    borderRadius: 15,
                                                    gap: responsiveScreenWidth(1),
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: responsiveScreenHeight(2),
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
                                                    Apply This Job
                                                </Text>
                                            </TouchableOpacity> : <View
                                                style={{
                                                    width: '96%',
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: responsiveScreenHeight(2),
                                                    borderRadius: 15,
                                                    gap: responsiveScreenWidth(1),
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: responsiveScreenHeight(2),
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
                                                    {job?.is_applied ? "Applied" : "Apply This Job"}
                                                </Text>
                                            </View>
                                    }
                                </>
                            }


                        </>
                }
            </ScrollView>
        </NavigationBar>
    )
}
export function AutoHeightWebView({ html, margin = 10 }) {
    const [height, setHeight] = useState(50);
    const { colors } = useContext(ThemeContext);
    const wrapped = useMemo(() => {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <style>
    @font-face {
      font-family: 'AppFont';
      font-weight: normal;
      font-style: normal;
    }

    :root {
      --text: ${colors.textSecondary};
      --primary: ${colors.primary};
    }

    body {
      margin: 0 ${margin}px;
      padding: 0;
      font-family: 'AppFont';
      font-size: ${responsiveScreenFontSize(2)}px;
      line-height: 1.6;
      color: var(--text);
      padding-bottom:10px;
      background: transparent;
      word-break: break-word;
    }

    h1,h2,h3,h4,h5,h6 {
      font-family: 'AppFont';
      font-weight: 700;
      margin: 12px 0 6px;
    }

    p, span, div, li {
      font-family: 'AppFont';
      color: var(--text);
    }

    a { color: var(--primary); text-decoration: none; }
    img { max-width: 100%; height: auto; border-radius: 10px; margin: 8px 0; }

    ul, ol { padding-left: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td, th { border: 1px solid rgba(0,0,0,0.15); padding: 8px; }
  </style>
</head>

<body>
  ${html}
</body>

<script>
  function updateHeight() {
    //var h =  document.body.scrollHeight;
    var h = Math.ceil(document.body.getBoundingClientRect().height);
    window.ReactNativeWebView.postMessage(String(h));
  }
  window.onload = function(){ setTimeout(updateHeight, 50); };
  setInterval(updateHeight, 300);
</script>
</html>
`   }, [html, margin, colors.textSecondary, colors.primary])
    const source = useMemo(() => ({ html: wrapped }), [wrapped]);
    return (
        <WebView
            source={source}
            onMessage={(e) => setHeight(Number(e.nativeEvent.data) || 50)}
            style={{ width: "100%", height, backgroundColor: "transparent" }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
        />
    );
}
export default Jobdetail

const styles = StyleSheet.create({})