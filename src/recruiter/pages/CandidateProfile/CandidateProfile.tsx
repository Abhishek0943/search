import { CustomTextInput } from '../../../components';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, BackHandler, Image, ImageBackground, KeyboardAvoidingView, Linking, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { NavigationBar } from '../../../components'
import { routes } from '../../../constants/values'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import Text from '../../../components/Text'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../../store'
import { CandidateProf, CandidateProfileData, SendMessage, UpdateStatus } from '../../../reducer/recruiterReducer'
import RNFS from "react-native-fs";
import { useAlert } from '../../../context/AlertContext'
function CandidateProfile() {
  const { colors } = useContext(ThemeContext);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const route = useRoute();
  const id = route.params?.candidateId;
  const application = route.params?.application_id;
  const dispatch = useAppDispatch()
  const [cvs, setCvs] = useState([])
  const [data, setData] = useState("")
  const [loading, setLoading] = useState(true)
  const [isMsgModalVisible, setIsMsgModalVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendMsgLoading, setSendMsgLoading] = useState(false);
  const [isDownloadingCV, setIsDownloadingCV] = useState(false);
  const { showAlert } = useAlert()
  useFocusEffect(useCallback(
    () => {
      const onBackPress = () => {
        if (!navigation.canGoBack()) {
          (navigation as any).replace(routes.RECRUITERHOME);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      if (id) {
        setLoading(true)
        dispatch(CandidateProfileData({ id: id })).unwrap().then(res => {
          if (res.success !== false) {
            setCvs(res.data)
          }
          setLoading(false)
        })
      }
      else if (application) {
        setLoading(true)

        dispatch(CandidateProf({ id: application })).unwrap().then(res => {
          if (res.success !== false) {
            setCvs(res.data.user)
            setData(res.data.status)
          }
          setLoading(false)

        })
      }

      return () => {
        subscription.remove();
      }
    },
    [id, application, navigation],
  )
  )
  return (
    <NavigationBar navigationBar={false} >
      <>
        <ScrollView style={{ flex: 1, }} contentContainerStyle={{}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              position: 'relative',
              alignItems: 'center',
              borderBottomColor: colors.textDisabled,
              borderBottomWidth: 0.5,
              paddingBottom: responsiveScreenHeight(2),
              width: responsiveScreenWidth(100),
              paddingHorizontal: responsiveScreenWidth(5),
              gap: responsiveScreenWidth(2),
            }}
          >
            <TouchableOpacity onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                (navigation as any).replace(routes.RECRUITERHOME);
              }
            }}>
              <Image source={imagePath.backIcon} style={{ resizeMode: 'contain', transform: [{ scale: 1.1 }] }} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'left',
                fontSize: responsiveScreenFontSize(2),
                color: colors.textPrimary,
                fontWeight: '800',
              }}
            >
              {cvs?.name ? cvs.name : "Candidates"}
            </Text>

          </View>
          {
            loading ?
              <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}>
                <ActivityIndicator size={responsiveScreenFontSize(3)} style={{}} />
              </View>
              :
              <>
                <ImageBackground source={{ uri: cvs?.cover_image }} style={{ width: responsiveScreenWidth(100), height: responsiveScreenHeight(20), justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                  <View style={{ width: responsiveScreenWidth(30), height: responsiveScreenWidth(30), borderRadius: responsiveScreenWidth(15), borderWidth: 3, borderColor: "white", elevation: 2, marginHorizontal: responsiveScreenWidth(5), marginBottom: -responsiveScreenWidth(15), overflow: 'hidden' }}>
                    <Image source={{ uri: cvs?.image }} style={{ width: '100%', height: '100%' }} />
                  </View>
                </ImageBackground>
                <Text style={{ marginTop: responsiveScreenWidth(18), fontSize: responsiveScreenFontSize(2.5), fontWeight: '700', color: colors.textPrimary, textAlign: 'left', marginHorizontal: responsiveScreenWidth(5) }}>{cvs?.name}</Text>
                {
                  cvs?.location &&
                  <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.5), marginHorizontal: responsiveScreenWidth(5) }}>
                    <Image source={imagePath.location} style={{ width: responsiveScreenWidth(4), height: responsiveScreenWidth(4), }} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: '500', color: colors.darkGray, textAlign: 'left', }}>{cvs.location}</Text>
                  </View>
                }
                {
                  cvs?.member_since &&
                  <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.5), marginHorizontal: responsiveScreenWidth(5) }}>
                    <Image source={imagePath.time} style={{ width: responsiveScreenWidth(4), height: responsiveScreenWidth(4), }} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: '500', color: colors.darkGray, textAlign: 'left', }}>{formatMemberSince(cvs.member_since)}</Text>
                  </View>
                }
                {
                  cvs?.phone &&
                  <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.5), marginHorizontal: responsiveScreenWidth(5) }}>
                    <Image source={imagePath.phone} style={{ width: responsiveScreenWidth(4), height: responsiveScreenWidth(4), }} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: '500', color: colors.darkGray, textAlign: 'left', }}>{cvs.phone}</Text>
                  </View>
                }
                {
                  cvs?.email &&
                  <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.5), marginHorizontal: responsiveScreenWidth(5) }}>
                    <Image source={imagePath.email} style={{ width: responsiveScreenWidth(4), height: responsiveScreenWidth(4), }} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: '500', color: colors.darkGray, textAlign: 'left', }}>{cvs.email}</Text>
                  </View>
                }

                {
                  application &&
                  <Selection data={data} application_id={application} />
                }
                {/* <AboutMeCard /> */}
                {
                  cvs?.skills?.length > 0 &&
                  <SkillCard data={cvs.skills} />
                }
                {
                  cvs?.languages?.length > 0 &&
                  <LanguageCard data={cvs.languages} />
                }
                {
                  cvs?.profile_education?.length > 0 &&
                  <EducationCard data={cvs.profile_education} />
                }

                <Text style={{ paddingHorizontal: responsiveScreenWidth(5), fontWeight: "600", color: colors.textPrimary, fontSize: responsiveScreenFontSize(2.6), marginTop: responsiveScreenHeight(2), marginBottom: 0 }}>Company details</Text>

                <View style={{ flexDirection: "row", rowGap: responsiveScreenHeight(3), marginTop: responsiveScreenHeight(2), marginHorizontal: responsiveScreenWidth(5), flexWrap: "wrap", justifyContent: "space-between", }}>
                  {
                    cvs?.is_verified &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.verify} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Verified</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>Yes</Text>
                    </View>
                  }

                  <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                    <Image source={imagePath.hand} style={{ transform: [{ scale: 1.3 }], }} />
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Ready for hire</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>Yes</Text>
                  </View>
                  {
                    cvs?.date_of_birth &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.cake} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Date of Birth</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.date_of_birth}</Text>
                    </View>
                  }

                  {
                    cvs?.gender?.gender &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.gender} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Gender</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.gender.gender}</Text>
                    </View>
                  }

                  {
                    cvs?.job_experience &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.bag} tintColor={colors.primary} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Experience</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.job_experience.job_experience}</Text>
                    </View>
                  }
                  {
                    cvs?.career_level &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.careerlevel} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Career level</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.career_level.career_level}</Text>
                    </View>
                  }
                  {
                    cvs?.location &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.location4} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Location</Text>
                      <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.location}</Text>
                    </View>
                  }
                  {
                    cvs?.current_salary &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.coin} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Current Salary</Text>
                      <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.salary_currency} {cvs.current_salary}</Text>
                    </View>
                  }
                  {
                    cvs?.expected_salary &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.coin} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Expected salary</Text>
                      <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{cvs.salary_currency} {cvs.expected_salary}</Text>
                    </View>
                  }
                  {
                    cvs?.organizationType &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.company2} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Organization
                        Type</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.organizationType}</Text>
                    </View>
                  }
                  {
                    cvs?.no_of_offices &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.company2} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Total Offices</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.no_of_offices}</Text>
                    </View>
                  }
                  {
                    cvs?.openJobs &&
                    <View style={{ gap: responsiveScreenHeight(.5), width: "33%" }}>
                      <Image source={imagePath.bag2} style={{ transform: [{ scale: 1.3 }], }} />
                      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>Opened Jobs</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(2), }}>{job.openJobs}</Text>
                    </View>
                  }
                </View>
                <View style={{ gap: responsiveScreenWidth(2), marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", justifyContent: "center" }}>
                  {
                    cvs?.cv &&
                    <TouchableOpacity
                      disabled={isDownloadingCV}
                      onPress={async () => {
                        setIsDownloadingCV(true);
                        await downloadCV(cvs.cv);
                        setIsDownloadingCV(false);
                      }}
                      style={{ width: "90%", marginVertical: responsiveScreenHeight(2), marginHorizontal: "auto", backgroundColor: "#E2ECFF", borderWidth: 1, borderColor: colors.primary, paddingVertical: responsiveScreenHeight(1), flex: 1, paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, justifyContent: "center", alignItems: "center", opacity: isDownloadingCV ? 0.6 : 1 }}
                    >
                      {isDownloadingCV ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                      ) : (
                        <Text style={{ color: colors.primary, textAlign: "center", fontSize: responsiveScreenFontSize(1.8) }}>Download CV</Text>
                      )}
                    </TouchableOpacity>
                  }
                  <Text onPress={() => setIsMsgModalVisible(true)} style={{ color: colors.primary, width: "90%", marginVertical: responsiveScreenHeight(2), marginHorizontal: "auto", backgroundColor: "#E2ECFF", borderWidth: 1, borderColor: colors.primary, paddingVertical: responsiveScreenHeight(1), flex: 1, textAlign: "center", paddingHorizontal: responsiveScreenWidth(4), borderRadius: 15, fontSize: responsiveScreenFontSize(1.8) }}>Send Message</Text>
                </View>
              </>
          }

        </ScrollView>
        {isMsgModalVisible && (

          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              paddingHorizontal: responsiveScreenWidth(5),
              zIndex: 999,
            }}
          >
            <KeyboardAvoidingView
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
                alignItems: "center",
                paddingHorizontal: responsiveScreenWidth(5),
                zIndex: 999,
              }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <Pressable
                onPress={() => {
                  if (!sendMsgLoading) setIsMsgModalVisible(false);
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />

              <View
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 18,
                  marginVertical: "auto",
                  padding: responsiveScreenWidth(5),
                  zIndex: 1000,
                }}
              >
                <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "700" }}>
                  Send Message
                </Text>

                <Text
                  style={{
                    marginTop: responsiveScreenHeight(0.8),
                    color: colors.gray,
                    fontSize: responsiveScreenFontSize(1.6),
                  }}
                >
                  Write your message below and submit.
                </Text>

                <CustomTextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Type your message..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  editable={!sendMsgLoading}
                  style={{
                    marginTop: responsiveScreenHeight(1.5),
                    borderWidth: 1,
                    borderColor: "#D9D9D9",
                    borderRadius: 14,
                    padding: responsiveScreenWidth(4),
                    height: responsiveScreenHeight(18),
                    fontSize: responsiveScreenFontSize(1.7),
                    color: "#111",
                    backgroundColor: "#FAFAFA",
                  }}
                />

                {/* Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: responsiveScreenWidth(3),
                    marginTop: responsiveScreenHeight(2),
                  }}
                >
                  <Pressable
                    disabled={sendMsgLoading}
                    onPress={() => setIsMsgModalVisible(false)}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#D9D9D9",
                      paddingVertical: responsiveScreenHeight(1.2),
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor: "#FFF",
                    }}
                  >
                    <Text style={{ color: "#111", fontSize: responsiveScreenFontSize(1.8) }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={sendMsgLoading || messageText.trim().length < 2}
                    onPress={async () => {
                      const msg = messageText.trim();
                      if (msg.length < 2) return;

                      try {
                        setSendMsgLoading(true);
                        dispatch(SendMessage({ seeker_id: cvs.id, message: messageText })).unwrap().then((res) => { })
                        setMessageText("");
                        setIsMsgModalVisible(false);
                        showAlert({
                          title: "Success",
                          message: "Message sent successfully.",
                        });
                      } catch (e) {
                        showAlert({
                          title: "Failed",
                          message: "Could not send message. Please try again.",
                        });
                      } finally {
                        setSendMsgLoading(false);
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: responsiveScreenHeight(1.2),
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor:
                        sendMsgLoading || messageText.trim().length < 2
                          ? "#B7C7FF"
                          : colors.primary,
                    }}
                  >
                    {sendMsgLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontSize: responsiveScreenFontSize(1.8) }}>
                        Submit
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

      </>

    </NavigationBar>
  )
}
async function requestStoragePermission() {
  if (Platform.OS !== "android") return true;

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const result = await PermissionsAndroid.request(permission);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Alert.alert(
      "Permission required",
      "Storage permission is permanently denied. Please enable it from app settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
    return false;
  }

  Alert.alert("Permission denied");
  return false;
}


export async function downloadCV(cv: string) {
  try {
    // if (Platform.OS === "android") {
    //   const hasPermission = await requestStoragePermission();
    //   if (!hasPermission) {
    //     Alert.alert("Permission denied");
    //     return;
    //   }
    // }

    // 2️⃣ Build file path
    const fileName = `candidate_cv_${Date.now()}.pdf`;

    const downloadPath =
      Platform.OS === "android"
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;


    const { statusCode } = await RNFS.downloadFile({
      fromUrl: cv,
      toFile: downloadPath,
    }).promise;
    if (statusCode === 200) {
      Alert.alert(
        "Download complete",
        Platform.OS === "android"
          ? "Saved in Downloads folder"
          : "Saved in app documents"
      );
    } else {
      Alert.alert("Download failed");
    }
  } catch (err) {
    Alert.alert("Error downloading file");
  }
}
function AboutMeCard({ }) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.card, { backgroundColor: colors.lightGrayNatural }]}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>About Me</Text>
        <Pressable
          onPress={() => { }}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          hitSlop={10}
        >
          <Text style={styles.chevron}>⌃</Text>
        </Pressable>
      </View>

      <View style={{ borderBottomColor: colors.mediumGrayNatural, borderBottomWidth: 1, borderStyle: "dashed", marginVertical: responsiveScreenHeight(1) }} />
      <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: '600' }}>
        Highly qualified residential care officer with a background in community
        health and service management. experienced in aged care supervision,
        health promotion, and client advocacy. committed to ensuring the safety
        and wellbeing of residents through evidence-based practices.
      </Text>
    </View>
  );
}
function SkillCard({ data }) {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[styles.card, { backgroundColor: colors.lightGrayNatural, marginTop: responsiveScreenHeight(2) }]}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Skills</Text>

      </View>

      <View style={{ borderBottomColor: colors.mediumGrayNatural, borderBottomWidth: 1, borderStyle: "dashed", marginVertical: responsiveScreenHeight(1) }} />
      {
        data.map((item, index) => (
          <View key={index} style={{ backgroundColor: colors.lightGray, borderRadius: 10, paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), marginBottom: responsiveScreenHeight(1) }}>
            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '700', }}>{item.skill_name}</Text>
            <Text style={{ fontSize: responsiveScreenFontSize(1.6), fontWeight: '600', color: colors.darkGray, marginTop: responsiveScreenHeight(1) }}>{item.experience_label}</Text>
          </View>
        ))
      }
      {/* <View style={{ backgroundColor: colors.lightGray, borderRadius: 10, paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4) }}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '700', }}>Patient Care</Text>
        <Text style={{ fontSize: responsiveScreenFontSize(1.6), fontWeight: '600', color: colors.darkGray, marginTop: responsiveScreenHeight(1) }}>Fresher</Text>
      </View> */}
    </View>
  );
}
function LanguageCard({ data }) {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[styles.card, { backgroundColor: colors.lightGrayNatural, marginTop: responsiveScreenHeight(2) }]}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Languages</Text>

      </View>

      <View style={{ borderBottomColor: colors.mediumGrayNatural, borderBottomWidth: 1, borderStyle: "dashed", marginVertical: responsiveScreenHeight(1) }} />
      {
        data.map((item, index) => (
          <View key={index} style={{ backgroundColor: colors.lightGray, borderRadius: 10, paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(4), marginBottom: responsiveScreenHeight(1) }}>
            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '700', }}>{item.language}</Text>
            <Text style={{ fontSize: responsiveScreenFontSize(1.6), fontWeight: '600', color: colors.darkGray, marginTop: responsiveScreenHeight(1) }}>{item.language_level}</Text>
          </View>
        ))
      }
    </View>
  );
}
function EducationCard({ data }) {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[styles.card, { backgroundColor: colors.lightGrayNatural, marginTop: responsiveScreenHeight(2) }]}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Education</Text>

      </View>

      <View style={{ borderBottomColor: colors.mediumGrayNatural, borderBottomWidth: 1, borderStyle: "dashed", marginTop: responsiveScreenHeight(1) }} />
      {
        data.map((item, index) => (
          <View style={[{
            width: "100%",
            borderRadius: 14,
            marginTop: responsiveScreenHeight(2)
          }]}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.5), fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
                {item.degree_title}
              </Text>
            </View>
            <Text style={{ marginTop: responsiveScreenHeight(1) }}>{item.date_completion} - {item.country.country} - {item.state.state}</Text>
            <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(1) }]}>
              <Image source={imagePath.education} />
              <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.majorSubjects.map((e) => `${e.name},`)}</Text>

            </View>
            <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.8) }]}>
              <Image source={imagePath.location2} />
              <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.country.country} - {item.state.state}</Text>
            </View>
            <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.8) }]}>
              <Image source={imagePath.company3} />
              <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.institution}</Text>
            </View>
          </View>
        ))
      }

    </View>
  );
}
function Selection({ data, application_id }) {

  const { colors } = useContext(ThemeContext);
  const [status, setStatus] = useState(data)
  const dispatch = useAppDispatch()
  useEffect(() => {
    setStatus(data)
  }, [data])

  useEffect(() => {
    dispatch(UpdateStatus({ status: status, application_id: application_id })).unwrap().then((res) => { })
  }, [status])
  return (
    <View style={[styles.card, { backgroundColor: colors.lightGrayNatural, marginTop: responsiveScreenHeight(2) }]}>
      <View style={styles.headerRow}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Select Option</Text>

      </View>

      <View style={{ borderBottomColor: colors.mediumGrayNatural, borderBottomWidth: 1, borderStyle: "dashed", marginVertical: responsiveScreenHeight(1) }} />
      <Pressable onPress={() => setStatus("shortlist")} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveScreenHeight(1) }}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Short List</Text>
        {
          status === "shortlist" ? <Image source={imagePath.checkActive} /> :
            <Image source={imagePath.checkInactive} />
        }
      </Pressable>
      <Pressable onPress={() => setStatus("hired")} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveScreenHeight(1.5) }}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Hired this Candidate</Text>
        {
          status === "hired" ? <Image source={imagePath.checkActive} /> :
            <Image source={imagePath.checkInactive} />
        }
      </Pressable>
      <Pressable onPress={() => setStatus("rejected")} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveScreenHeight(1.5) }}>
        <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: '800' }}>Rejected</Text>
        {
          status === "rejected" ? <Image source={imagePath.checkActive} /> :
            <Image source={imagePath.checkInactive} />
        }

      </Pressable>

    </View>
  );
}
const styles = StyleSheet.create({
  card: {

    borderRadius: 14,
    marginHorizontal: responsiveScreenWidth(5),
    paddingHorizontal: responsiveScreenWidth(4),
    paddingVertical: responsiveScreenHeight(2),
    elevation: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveScreenHeight(.8),
  },
  metaIcon: {
    marginRight: 10,
    color: "#111",
    opacity: 0.9,
  },
  metaText: {
    fontSize: 13,
    color: "#111",
    opacity: 0.75,
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  chevron: {
    fontSize: 16,
    color: "#9CA3AF",
    lineHeight: 16,
    marginTop: -1, // tiny visual nudge
  },
  dashedDivider: {
    marginTop: 10,
    marginBottom: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
  },
});
export default CandidateProfile
const formatMemberSince = (isoDate) => {
  const date = new Date(isoDate);

  return `Member Since, ${date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })}`;
};