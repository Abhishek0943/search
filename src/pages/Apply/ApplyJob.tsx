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
import authStyles from '../Auth/styles'

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
  console.log(cvs, "cvs")
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
    dispatch(UploadCV(fd))
  };
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
                Step 1 of 1
              </Text>

              <Text
                style={{
                  color: colors.textSecondary,
                  lineHeight: responsiveFontSize(2.6),
                  fontSize: responsiveFontSize(3),
                  fontWeight: '800',
                }}
              >
                Your answers
              </Text>
            </View>
          </View>
          <Pressable style={[{
            width: responsiveWidth(100),
            marginTop: responsiveHeight(2.5),
            position: 'relative',
            aspectRatio: 350 / 1,
            marginBottom: responsiveHeight(2)
          }]}>
            <Image style={authStyles.bgImage} source={require("../Auth/images/Devider2.png")} />
          </Pressable>
          <ScrollView
            style={{}}
            contentContainerStyle={{
              width: responsiveScreenWidth(90),
              alignSelf: 'center',
              alignItems: 'center',
              paddingBottom: responsiveScreenHeight(3),
            }}
          >
            {
              Object.entries(cvs).map(([key, value]) => (<View style={{
                width: "100%",
              }}>
                {
                  value.type === "yes_no" &&
                  <>
                    <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), }}>
                      <Text style={{
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: '700', color: colors.primary2
                      }}>
                        {value.text} <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.6), }}>{!value.required && '(optional)'}</Text>
                      </Text>
                    </View>

                    <View
                      style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                    >
                      {[{ key: "yes", value: 1 }, { key: "no", value: 0 }].map((key2) => {
                        const isSelected = value.answer == key2.value
                        return (
                          <Pressable
                            key={key2.key}
                            onPress={() => setCvs({ ...cvs, [key]: { ...value, answer: key2.value } })}
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
                              {key2.key.toUpperCase()}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>

                }
                {
                  (value.type === "short_text" || value.type === "number") &&
                  <InPutWithLabel
                    inputContainerStyle={{
                      marginBottom: responsiveHeight(0.5),
                    }}
                    isRequired={value.required}
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
                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.6), }}>{!value.required && '(optional)'}</Text>
                      </Text>
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
                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.6), }}>{!value.required && '(optional)'}</Text>
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
                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.6), }}>{!value.required && '(optional)'}</Text>
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
          </ScrollView >
          <TouchableOpacity
            onPress={() => {
              const answers = Object.fromEntries(
                Object.entries(cvs).map(([key, value]) => [key, value.answer])
              );
              if (!cv?.id) {
                showAlert({ title: "Error", message: "Please upload your CV", })
                return
              }
              dispatch(ApplyJobs({ cv_id: cv.id, job_id: id, answers })).unwrap().then((data) => {
                if (data.success) {
                  showAlert({ title: "Success", message: "You have successfully applied for this job", })
                  navigation.reset({ index: 0, routes: [{ name: routes.HOME }] })
                }
              })
            }}
            style={{
              width: '90%',
              justifyContent: 'center',
              margin: "auto",
              borderRadius: 15,
              gap: responsiveScreenWidth(1),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary,
              paddingHorizontal: responsiveScreenWidth(3),
              paddingVertical: responsiveScreenHeight(2),
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
        </>

      </TouchableWithoutFeedback >
    </NavigationBar >
  );
};

export default ApplyJob;