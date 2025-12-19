import { Image, TouchableOpacity, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../store'
import { GetJob, } from '../../reducer/jobsReducer'
import { WebView } from 'react-native-webview';
import { formatSalaryRange } from '../../utils'
const Jobdetail = () => {
    const { colors } = useContext(ThemeContext)
    const route = useRoute()
    const navigation = useNavigation()
    const { id } = route.params as { id: number }
    const p = "<p></p>"

    const dispatch = useAppDispatch()
    const [job, setJob] = useState<Job>()
    const [pageVal, setPageVal] = useState<"dis" | "company" | "review">("dis")
    useEffect(() => {
        dispatch(GetJob({ id })).unwrap().then((res) => {
            if (res.success) {
                setJob(res.data.jobDetail)
            }
        })
    }, [id])
    console.log("asdfsadfadsfadsf",job)
    if (!job?.id) return
    return (
        <NavigationBar name={routes.HOME}>
            <ScrollView style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(2) }} contentContainerStyle={{ justifyContent: "flex-start" }}>
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
                        Job details
                    </Text>
                    <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
                </View>
                <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin: 10, borderRadius: 15 }}>
                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                            <Image source={{ uri: job.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                        </View>
                        <TouchableOpacity style={{ flex: 1, gap: responsiveScreenHeight(0.5) }}>
                            <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{job.title}</Text>
                            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>
                                <Image source={imagePath.location} />
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.6) }}>{job.jobLocation}</Text>
                            </View>
                        </TouchableOpacity>
                        <View >
                            <Image source={imagePath.bookmark} />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                        {
                            job.jobType && <Text style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{job.jobType}</Text>
                        }
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                            {
                                job.salary && <>
                                    <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{job.salary_currency}{formatSalaryRange(job.salary)} </Text>
                                    <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{job.salary_period}</Text>
                                </>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", margin: 10, borderRadius: 15, gap: responsiveScreenWidth(3) }}>
                    <Text onPress={() => setPageVal("dis")} style={{ color: colors.primary, backgroundColor: "#EEF4FF",borderWidth:1, borderColor:colors.primary, paddingVertical: responsiveScreenHeight(1),flex:1,textAlign:"center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Friend to Email</Text>

                      <Text onPress={() => setPageVal("company")} style={{ color: "#FF383C", backgroundColor: "#FFE5E6",borderWidth:1, borderColor:"#FF383C", paddingVertical: responsiveScreenHeight(1),flex:1,textAlign:"center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Report Abuse</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: "#EEF4FF", flexDirection: "row", justifyContent: "space-between", margin: 10, borderRadius: 15 }}>
                    <Text onPress={() => setPageVal("dis")} style={{ color: pageVal === "dis" ? colors.white : "#478BFF75", backgroundColor: pageVal === "dis" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Job Description</Text>
                    <Text onPress={() => setPageVal("company")} style={{ color: pageVal === "company" ? colors.white : "#478BFF75", backgroundColor: pageVal === "company" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Company</Text>
                    <Text onPress={() => setPageVal("review")} style={{ color: pageVal === "review" ? colors.white : "#478BFF75", backgroundColor: pageVal === "review" ? colors.primary : colors.white, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), borderRadius: 6, fontSize: responsiveScreenFontSize(1.8) }}>Review</Text>
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
                                                        <View style={{ flexDirection: "row", marginHorizontal: 10, alignItems: "center" }}>
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
                <TouchableOpacity
                    //   onPress={() => navigation.navigate(routes.WORKEXPERIENCEFORM)}
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
                </TouchableOpacity>
            </ScrollView>
        </NavigationBar>
    )
}
export function AutoHeightWebView({ html, margin = 10 }: { html: string }) {
    const [height, setHeight] = useState(50);
    const { colors } = useContext(ThemeContext)

    const wrappedHtml = (content: string) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-size:    ${responsiveScreenFontSize(2)};          /* 👈 Change this to match your app font size */
          margin:  0 ${margin}px;
          padding: 0;
        }

        p, span, div {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          color:${colors.textSecondary}
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
     <script>
          setTimeout(function() {
            var h = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(String(h));
          }, 100);
        </script>
  </html>
`;
    return (
        <WebView
            source={{ html: wrappedHtml(html) }}
            onMessage={(event) => {
                setHeight(Number(event.nativeEvent.data) || 50);
            }}
            style={{
                width: "100%",
                height,
                backgroundColor: "transparent",
            }}
            scrollEnabled={false}
        />
    );
}
export default Jobdetail

const styles = StyleSheet.create({})