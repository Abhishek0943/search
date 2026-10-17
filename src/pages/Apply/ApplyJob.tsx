import { View, TouchableWithoutFeedback, ScrollView, Image, TouchableOpacity, ActivityIndicator, Pressable, TextInput } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { ApplyJobs, GetCv, GetJobQuastions, setAppliedJobId, UploadCV } from '../../reducer/jobsReducer'
import { InPutWithLabel, NavigationBar } from '../../components'
import imagePath from '../../assets/imagePath'
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import { routes } from '../../constants/values'
import Text from '../../components/Text'
import { useAlert } from '../../context/AlertContext'
import ResumeCard from '../../components/ResumeCard'
import { SectionHeader } from '../Profile/Profile'
import { openBrowser } from '../Resume/Resume'
import { pick, types } from '@react-native-documents/picker'

const ApplyJob = () => {
  const { user } = useAppSelector(state => state.userStore);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute()
  const id = route?.params?.id
  const [loading, setLoading] = useState(false)
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [cvs, setCvs] = useState<any[]>([]);
  const [cv, setCv] = useState('');
  const [loadIngForCV, setLoadIngForCV] = useState(true)
  useFocusEffect(
    useCallback(() => {
      if (user && user.id) {
        setLoadIngForCV(true)
        dispatch(GetJobQuastions({ id: id }))
          .unwrap()
          .then(res => {
            if (res.success !== false) {
              setCvs(res.data.questions);
            }
            setLoadIngForCV(false)
          });
      }
    }, [id, dispatch]),
  );
  useEffect(() => {
    if (user && user.id) {
      dispatch(GetCv({ id: user.id })).unwrap().then(res => {
        if (res.success) {
          setCv(res.data);
        }

      })
    }
  }, [user])
  const { showAlert } = useAlert();
  const [success, setSuccess] = useState(false)
  const handleApply = () => {
    if (!selectedCvId) return;
    if (!id) return
    dispatch(GetJobQuastions({ job_id: id })).unwrap().then(res => {
      console.log(res, "skfjsdf")
      if (res.success) {
        setSuccess(true)
        dispatch(setAppliedJobId(id))
      }
      else {
        showAlert({
          title: "Error",
          message: res.message,
        });
      }
    })
  };
  const [loadingCV, setLoadingCV] = useState<boolean>(false)

  const normalizeFileUri = (u?: string) => {
    if (!u) return '';
    if (u.startsWith('/')) return `file://${u}`;
    return u;
  };
  const pickResume = async () => {
    const [doc] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
      mode: 'import',
    });
    const uri = normalizeFileUri((doc as any).fileCopyUri || doc.uri);
    const file = { uri, name: doc.name ?? 'resume.pdf', type: doc.type || 'application/pdf' };
    const fd = new FormData();
    fd.append('title', '');
    fd.append('is_default', '1');
    fd.append('cv_file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    setLoadingCV(true)
    dispatch(UploadCV(fd)).unwrap().then(res => {
      if (res.success) {
        // dispatch(setUser({ user: { ...user, cv: res.data } }))
      }
    }).finally(() => {
      setLoadingCV(false)
    })
  };
  const [step, setStep] = useState(1)
  return (
    <NavigationBar navigationBar={false}>
      <TouchableWithoutFeedback>
        <>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: responsiveWidth(4),
              marginHorizontal: responsiveWidth(5),
            }}
          >
            <Pressable
              onPress={() => setStep(1)}
              style={{
                width: responsiveWidth(2.8),
                aspectRatio: 1 / 2,
              }}
            >
              <Image
                style={{
                  height: '100%',
                  width: '100%',
                }}
                source={imagePath.leftAngle}
              />
            </Pressable>

            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: responsiveFontSize(1.8),
                  fontWeight: '800',
                }}
              >
                Step 1 of 2
              </Text>

              <Text
                style={{
                  color: colors.textSecondary,
                  lineHeight: responsiveFontSize(2.6),
                  fontSize: responsiveFontSize(3),
                  fontWeight: '800',
                }}
              >
                Your venue
              </Text>
            </View>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              width: responsiveScreenWidth(90),
              alignSelf: 'center',
              alignItems: 'center',
              flex: 1,
              paddingBottom: responsiveScreenHeight(3),
            }}
          >
            {
              Object.entries(cvs).map(([key, value]) => (<View style={{
                width: "100%",
              }}>
                {
                  value.type === "yes_no" && <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: responsiveWidth(2),
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: responsiveScreenWidth(2),
                    paddingVertical: responsiveScreenHeight(1),
                  }}>
                    <TouchableOpacity style={{
                      width: responsiveWidth(12),
                      aspectRatio: 1,
                    }}>
                      <Text>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                      width: responsiveWidth(12),
                      aspectRatio: 1,
                    }}>
                      <Text>No</Text>
                    </TouchableOpacity>
                  </View>
                }
                {
                  (value.type === "short_text" || value.type === "number")&&
                  <InPutWithLabel
                    inputContainerStyle={{
                      marginBottom: responsiveHeight(0.5),
                    }}
                    mainColor={colors.primary}
                    secondaryColor={colors.primary2}
                    label={value.text}
                    value={value?.answer}
                    onChangeText={text => { setCvs({ ...cvs, [key]: { ...value, answer: text } }) }}
                    placeholder="Job Title"
                  />
                }
                {value.type === "long_text" &&
                  <>
                    <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), }}>
                      <Text style={{
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: '700', color: colors.primary2
                      }}>
                        {value.text}
                      </Text>
                      <Text style={{
                        fontSize: responsiveFontSize(1.2),
                        fontWeight: "400",
                        lineHeight: responsiveFontSize(1.9),
                        color: colors.textSecondary,
                        flexWrap: "wrap",
                      }}>(Optional)</Text>
                    </View>
                    <View style={{
                      borderWidth: 1.5,
                      borderRadius: 12,
                      borderColor: colors.primary,
                      paddingHorizontal: responsiveWidth(4),
                      marginBottom: responsiveHeight(2),
                      minHeight: responsiveHeight(12),
                    }}>
                      <TextInput
                        multiline
                        maxLength={200}
                        value={value?.answer}
                        onChangeText={(t) => setCvs({ ...cvs, [key]: { ...value, answer: t } })}
                        placeholder="Type two lines, or skip it."
                        placeholderTextColor={colors.placeholder}
                        style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                      />
                      <Text style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(1), color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                        {(value?.answer || '').length} / 200
                      </Text>
                    </View>
                  </>
                }
                {
                  value.type === "single_select" &&
                  <>
                    <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                      <Text style={{
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: '700', color: colors.primary2,
                      }}>
                        {value.text}
                      </Text>

                      <View
                        style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                      >
                        {Object.entries(value.options).map(([key2, value2]) => {
                          const isSelected = value.answer === key2
                          return (
                            <Pressable
                              key={key2}
                              onPress={() => setCvs({ ...cvs, [key]: { ...value, answer: key2 } })}
                              style={{
                                backgroundColor: isSelected ? colors.primary : colors.white,
                                borderWidth: isSelected ? 0 : 1.5,
                                borderColor: isSelected ? colors.primary : colors.gray,
                                borderRadius: 24,
                                paddingHorizontal: responsiveWidth(5),
                                paddingVertical: responsiveHeight(1),
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{
                                color: isSelected ? colors.white : colors.textPrimary,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '600',
                              }}>
                                {value2}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </>
                }
                {
                  value.type === "multi_select" &&
                  <>
                    <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                      <Text style={{
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: '700', color: colors.primary2,
                      }}>
                        {value.text}
                      </Text>

                      <View
                        style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                      >
                        {Object.entries(value.options).map(([key2, value2]) => {
                          const isSelected = value.answer.includes(key2)
                          return (
                            <Pressable
                              key={key2}
                              onPress={() => {
                                if (isSelected) {
                                  setCvs({ ...cvs, [key]: { ...value, answer: value.answer.filter((item: string) => item !== key2) } })
                                } else {
                                  setCvs({ ...cvs, [key]: { ...value, answer: [...value.answer, key2] } })
                                }
                              }}
                              style={{
                                backgroundColor: isSelected ? colors.primary : colors.white,
                                borderWidth: isSelected ? 0 : 1.5,
                                borderColor: isSelected ? colors.primary : colors.gray,
                                borderRadius: 24,
                                paddingHorizontal: responsiveWidth(5),
                                paddingVertical: responsiveHeight(1),
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{
                                color: isSelected ? colors.white : colors.textPrimary,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '600',
                              }}>
                                {value2}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </>
                }
              </View>
              ))
            }

            <View style={{ width: responsiveWidth(90), }}>
              <SectionHeader titleColor={colors.textSecondary} title="RESUME" onAction={() => navigation.navigate(routes.RESUME)} actionText="Optional" actionColor={colors.primary} />
              {
                cv?.cv_url ? (
                  <ResumeCard
                    fileName={user.cv?.cv_file}
                    subtitle={cv?.uploaded_at}
                    onView={() => { user.cv?.cv_url && openBrowser(cv.cv_url, colors.primary) }}
                    onReplace={pickResume}
                  />
                ) :
                  <Pressable
                    onPress={pickResume}
                    style={{ width: '100%', aspectRatio: 350 / 91, marginVertical: responsiveHeight(0), }}
                  >
                    {
                      loadingCV ? (
                        <View style={{ width: '100%', height: '100%', borderWidth: 2, borderRadius: 12, borderStyle: "dashed", borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                          <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                        </View>
                      ) :
                        <Image source={require("./ResumeUpload.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                    }
                  </Pressable>
              }
            </View>
            <TouchableOpacity
              onPress={() => {
                const answers = Object.fromEntries(
                  Object.entries(cvs).map(([key, value]) => [key, value.answer])
                );
                console.log({ cv_id: cv.id, job_id: id, answers })
                dispatch(ApplyJobs({ cv_id: cv.id, job_id: id, answers })).unwrap().then((data) => {
                  if (data.success) {
                    showAlert({ title: "Success", message: "You have successfully applied for this job", })
                    navigation.goBack()
                  }
                })
              }}
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
                Apply
              </Text>
            </TouchableOpacity>
            {/* {
              success ? <>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Image source={imagePath.success} />
                  <Text style={{ fontSize: responsiveScreenFontSize(3), marginTop: responsiveScreenHeight(3), textAlign: "center", fontWeight: "600" }}>You’ve Applied</Text>
                  <Text style={{ fontSize: responsiveScreenFontSize(2), textTransform: "capitalize", color: colors.textSecondary, marginTop: responsiveScreenHeight(.2), textAlign: "center", fontWeight: "600" }}>You have successfully applied to this job vacancy.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate(routes.HOME)}
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
                    Back Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.replace(routes.APPLYJOB)}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: responsiveScreenHeight(2),
                    borderRadius: 15,
                    gap: responsiveScreenWidth(1),
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: "#BBD4FF8C",
                    paddingHorizontal: responsiveScreenWidth(3),
                    paddingVertical: responsiveScreenHeight(1.5),
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: responsiveScreenFontSize(1.8),
                    }}
                  >
                    See Applied Job
                  </Text>
                </TouchableOpacity>


              </> :
                <>
                  {
                    loadIngForCV ?
                      <ActivityIndicator style={{ marginTop: responsiveScreenHeight(40), }} size={responsiveScreenFontSize(3)} /> : <>

                        <>
                          <View
                            style={{
                              width: '100%',
                              marginTop: responsiveScreenHeight(2),
                            }}
                          >
                            <Text
                              style={{
                                fontSize: responsiveScreenFontSize(2),
                                fontWeight: '600',
                                color: colors.textPrimary,
                                marginBottom: responsiveScreenHeight(1),
                              }}
                            >
                              Select a Resume
                            </Text>
                          </View>

                          <View
                            style={{
                              width: '100%',
                              gap: responsiveScreenHeight(1.5),
                              flex: 1
                            }}
                          >

                            {cvs && cvs.length > 0 ? (
                              cvs.map(cv => (
                                <TouchableOpacity
                                  key={cv.id}
                                  onPress={() => setSelectedCvId(cv.id)}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: responsiveScreenHeight(1.5),
                                    paddingHorizontal: responsiveScreenWidth(3),
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor:
                                      selectedCvId === cv.id
                                        ? colors.primary
                                        : colors.textDisabled,
                                  }}
                                >
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor:
                  selectedCvId === cv.id
                    ? colors.primary
                    : colors.textDisabled,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: responsiveScreenWidth(3),
              }}
            >
              {selectedCvId === cv.id && (
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveScreenFontSize(1.8),
                  fontWeight: '500',
                  color: colors.textPrimary,
                }}
                numberOfLines={1}
              >
                {cv.title || cv.name || 'My Resume'}
              </Text>
              {cv.updatedAt && (
                <Text
                  style={{
                    fontSize: responsiveScreenFontSize(1.4),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  Last updated: {cv.updatedAt}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          ))
          ) : (

                            )}
        </View>
        <View style={{ flex: 1 }}></View>
        {
          cvs.length > 0 ? <TouchableOpacity
            onPress={handleApply}
            disabled={!selectedCvId}
            style={{
              marginTop: responsiveScreenHeight(3),
              width: '100%',
              alignSelf: 'center',
              paddingVertical: responsiveScreenHeight(1.8),
              borderRadius: 15,
              backgroundColor: selectedCvId
                ? colors.primary
                : colors.textDisabled,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {
              loading ? <ActivityIndicator color={colors.white} /> : <Text
                style={{
                  color: '#fff',
                  fontSize: responsiveScreenFontSize(1.8),
                  fontWeight: '600',
                }}
              >
                Apply with resume
              </Text>
            }
          </TouchableOpacity> :
            
        }


      </>

    </>

                  }
                </>

            }
 */}

          </ScrollView >

        </>

      </TouchableWithoutFeedback >
    </NavigationBar >
  );
};

export default ApplyJob;