import { View, Text, FlatList, Image, Pressable, Alert, TouchableWithoutFeedback, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { NavigationBar } from '../../components';
import { routes } from '../../constants/values';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeProvider';
import imagePath from '../../assets/imagePath';
import { useAppDispatch } from '../../store';
import { DeleteNotification, GetCv, GetNotification } from '../../reducer/jobsReducer';
import { Header } from '../Company/Company';
import { useAlert } from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notification = () => {
  const navigation = useNavigation();
  const { colors } = useContext(ThemeContext);
  const dispatch = useAppDispatch();
  const [cvs, setCvs] = useState<any[]>([]);
  const [active, setActive] = useState(0)
  const [role, setRole] = useState("seeker")
  const [loading, setLoading] = useState(true)
  const refresh = () => {
    dispatch(GetNotification())
      .unwrap()
      .then(res => {
        if (res.success !== false) {
          setCvs(res.data.notifications);
        }
        setLoading(false)
      });
  }
  const { showConfirm } = useAlert()

  useFocusEffect(
    useCallback(() => {
      const a = async () => {
        const r = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
        setRole(r)
      }
      a()
      dispatch(GetNotification())
        .unwrap()
        .then(res => {
          if (res.success !== false) {
            setCvs(res.data.notifications);
          }
          setLoading(false)
        });
    }, []),
  );
  const openURL = (url: any) => {
    if (!url) return;
    if (url === "https://searchtalents.co/creator-dashboard") {
      navigation.navigate(routes.BLOGPAGE as never, { isFavorite: true } as never);
    } else {
      navigation.navigate(routes.BROWSER as never, { url } as never);
    }
  };
  return (
    <>
      <NavigationBar navigationBar={false}>
        <View
          style={{
            flex: 1,


            alignSelf: 'center',
            alignItems: 'center',
            paddingBottom: responsiveScreenHeight(3),
          }}

        >
          <Header title="Notifications" />
          {
            !loading ? <>
              <FlatList data={cvs}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                ListEmptyComponent={() => (<View style={{ flex: 1, marginTop: responsiveScreenHeight(40), justifyContent: "center" }}>
                  <Image source={imagePath.notificationEmptyImage} />
                </View>)}
                // contentContainerStyle={{ flexGrow: 1 }}
                // style={{ }}
                renderItem={({ item }) => {
                  return (
                    <TouchableWithoutFeedback onPress={() => setActive(0)} >
                      <View style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray, marginTop: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 16, overflow: "hidden", paddingVertical: responsiveScreenHeight(1.4), width: responsiveScreenWidth(90), gap: responsiveScreenWidth(2), flexDirection: "row" }}>
                        <View style={{ borderRadius: 6, height: responsiveScreenHeight(4.9), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                          <Image source={{ uri: item?.from?.image }} resizeMode='cover' style={{ height: "100%", aspectRatio: 1, }} />
                        </View>
                        <TouchableOpacity onPress={() => {
                          setActive(0)
                          console.log(item)
                          if (item.type === "blog_rejected" || item.type === "creator_request_status" || item.type === "blog_published" || item.type === "blog_approved") {
                            openURL(item.redirect)
                          }
                          else if (item.job?.id || item.application_id) {
                            if (role === "seeker") {
                              item?.job?.id && navigation.navigate(routes.JOBDETAIL, { id: item.job.id })
                            } else {
                              navigation.navigate(routes.CANDIDATEPROFILE, { application_id: item.application_id, })
                            }
                          } else if (item.type === "chat" || item.type === "message" || item.chat_id) {
                            const partnerId = item.sender_id || item.seeker_id || item.company_id || item.chat_id || item.from?.id;
                            const partnerName = item.sender_name || item.from?.name || "Chat";
                            if (partnerId) {
                              navigation.navigate(routes.MESSAGE, { id: Number(partnerId), name: partnerName })
                            } else {
                              navigation.navigate(routes.CHAT)
                            }
                          } else {
                            navigation.goBack()
                          }
                        }} style={{ flex: 1, }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2) }}>
                            <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(30), fontWeight: "700", textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.9) }}>{item?.job?.title}</Text>
                            <View style={{ borderRadius: 6, aspectRatio: 1, height: responsiveScreenHeight(.5), overflow: "hidden", backgroundColor: "#91E1DD" }}>
                            </View>
                            <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(30), fontWeight: "400", textTransform: "capitalize", color: colors.darkGrayNatural, fontSize: responsiveScreenFontSize(1.9) }}>{item?.from?.name}</Text>
                          </View>
                          <Text
                            style={{
                              fontWeight: "400",
                              textTransform: "capitalize",
                              color: colors.darkGrayNatural,
                              fontSize: responsiveScreenFontSize(1.9),
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text numberOfLines={2}>
                              {item.message}{" "}
                            </Text>
                            <Text style={{ fontSize: responsiveScreenFontSize(2.5), color: "#F6FF73" }}>
                              •
                            </Text>
                            {" "}{item?.created_at?.split("T")[0]}
                          </Text>
                        </TouchableOpacity>
                        <Pressable onPress={() => setActive(item.id)} style={{ position: "relative", backgroundColor: "white" }}>
                          <Image source={imagePath.dots2} />
                          {
                            item.id === active &&
                            <View
                              style={[
                                {
                                  backgroundColor: colors.white,
                                  position: "absolute",
                                  borderWidth: 1,
                                  borderColor: colors.lightGray,
                                  width: responsiveScreenWidth(30),
                                  right: 0,
                                  top: "30%",
                                  zIndex: 100,
                                  borderRadius: 10,
                                  gap: responsiveScreenHeight(1),
                                  paddingHorizontal: responsiveScreenWidth(3),
                                  paddingVertical: responsiveScreenHeight(2)
                                },
                              ]}
                            >


                              <TouchableOpacity
                                onPress={async () => {
                                  if (item?.id) {
                                    const ok = await showConfirm({
                                      title: "Delete notification?",
                                      message: "Are you sure you want to delete this notification?",
                                      okText: "Delete",
                                      cancelText: "Cancel",
                                    })
                                    if (ok) {
                                      dispatch(DeleteNotification({ id: item?.id })).unwrap().then((res) => {
                                        refresh()
                                      })
                                    }
                                  }
                                }
                                }
                                style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}
                              >
                                <Image source={imagePath.delete} style={{}} />
                                <Text style={[{ color: colors.textPrimary }]}>
                                  Delete
                                </Text>
                              </TouchableOpacity>

                            </View>
                          }
                        </Pressable>
                      </View>
                    </TouchableWithoutFeedback>
                  )
                }}
              />
            </> : <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size={responsiveScreenFontSize(3)} />
            </View>
          }
        </View>
      </NavigationBar>
    </>
  );
};

export default Notification;
