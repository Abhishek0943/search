import { View, Text, TouchableWithoutFeedback, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { ApplyJobs, GetCv } from '../../reducer/jobsReducer'
import { NavigationBar } from '../../components'
import imagePath from '../../assets/imagePath'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import { Header } from '../Company/Company'

const ApplyJob = () => {
  const { user } = useAppSelector(state => state.userStore);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute()
  const id = route?.params?.id
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [cvs, setCvs] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user && user.id) {
        dispatch(GetCv({ id: user.id }))
          .unwrap()
          .then(res => {
            if (res.success !== false) {
              setCvs(res.cvs);
            }
            console.log(res);
          });
      }
    }, [user, dispatch]),
  );
  const [success, setSuccess] = useState(false)
  const handleApply = () => {
    if (!selectedCvId) return;
    if (!id) return
    dispatch(ApplyJobs({ job_id: id, cv_id: selectedCvId })).unwrap().then(res => {
      if (res.success) {
        setSuccess(true)
      }
    })
  };

  return (
    <NavigationBar navigationBar={false}>
      <TouchableWithoutFeedback>
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
          <Header title={
                success ? "Success" : "Apply Job"
              } />
          {
            success ? <>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Image source={imagePath.success} />
                <Text style={{ fontSize: responsiveScreenFontSize(3), marginTop: responsiveScreenHeight(3), textAlign: "center", fontWeight: "600" }}>You’ve Applied</Text>
                <Text style={{ fontSize: responsiveScreenFontSize(2),textTransform:"capitalize", color: colors.textSecondary, marginTop: responsiveScreenHeight(.2), textAlign: "center", fontWeight: "600" }}>You have successfully applied to this job vacancy.</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
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
                onPress={() => navigation.goBack()}
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
                        {/* Radio Button */}
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

                        {/* CV Info */}
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
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(1.6),
                        color: colors.textSecondary,
                        marginTop: responsiveScreenHeight(1),
                      }}
                    >
                      No resumes found. Please upload a CV first.
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}></View>
                <TouchableOpacity
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
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: responsiveScreenFontSize(1.8),
                      fontWeight: '600',
                    }}
                  >
                    Apply with resume
                  </Text>
                </TouchableOpacity>

              </>
          }

        </ScrollView>
      </TouchableWithoutFeedback>
    </NavigationBar>
  );
};

export default ApplyJob;