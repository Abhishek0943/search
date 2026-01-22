import { View, Text, FlatList, Image, Pressable, Alert, TouchableWithoutFeedback, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { NavigationBar, PageHeaderOne } from '../../components';
import { routes } from '../../constants/values';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useConfirm } from '../../ConfirmContext';
import { ThemeContext } from '../../context/ThemeProvider';
import imagePath from '../../assets/imagePath';
import { useAppDispatch } from '../../store';
import { DeleteNotification, GetCv, GetNotification } from '../../reducer/jobsReducer';
import { Header } from '../Company/Company';
import { useAlert } from '../../context/AlertContext';

const Notification = () => {
  const [data, setData] = useState([...new Array(10)]);
  const navigation = useNavigation();
  const { colors } = useContext(ThemeContext);

  const dispatch = useAppDispatch();
  const [cvs, setCvs] = useState<any[]>([]);
  const [active, setActive] = useState(0)
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
  const {showConfirm} = useAlert()
  useFocusEffect(
    useCallback(() => {
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
  return (
    <>
      <NavigationBar navigationBar={false}>
        <TouchableWithoutFeedback>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              width: responsiveScreenWidth(100),
              alignSelf: 'center',
              alignItems: 'center',
              flex: 1,
              paddingBottom: responsiveScreenHeight(3),
            }}
          >
            <Header title="Notifications" />
            {
              !loading ? <>
                <FlatList data={cvs}
                  ListEmptyComponent={() => (<View style={{ flex: 1, justifyContent: "center" }}>
                    <Image source={imagePath.notificationEmptyImage} />
                  </View>)}
                  contentContainerStyle={{ flexGrow: 1 }}
                  style={{ flex: 1 }}
                  renderItem={({ item }) => {
                    return (
                      <View style={{ backgroundColor: colors.white, elevation: 5, borderWidth: 1, borderColor: "transparent", borderRadius: 16, overflow: "hidden", paddingVertical: responsiveScreenHeight(1.4), paddingHorizontal: responsiveScreenWidth(3), margin: 10, width: responsiveScreenWidth(90), gap: responsiveScreenWidth(2), flexDirection: "row" }}>
                        <View style={{ borderRadius: 6, height: responsiveScreenHeight(4.9), padding: 10, overflow: "hidden", backgroundColor: "#CECECE38" }}>
                          <Image source={{uri:item.from.image}} resizeMode='contain' style={{ height: "100%", aspectRatio: 1 }} />
                        </View>
                        <View style={{ flex: 1, }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2) }}>
                            <Text numberOfLines={1} style={{maxWidth:responsiveScreenWidth(30), fontWeight: "700", textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.9) }}>{item.job.title}</Text>
                            <View style={{ borderRadius: 6, aspectRatio: 1, height: responsiveScreenHeight(.5), overflow: "hidden", backgroundColor: "#91E1DD" }}>
                            </View>
                            <Text numberOfLines={1}  style={{maxWidth:responsiveScreenWidth(30), fontWeight: "400", textTransform: "capitalize", color: colors.darkGrayNatural, fontSize: responsiveScreenFontSize(1.9) }}>{item.from.name}</Text>

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
                        </View>
                        <Pressable onPress={() => setActive(item.id)} style={{ position: "relative", backgroundColor: "white" }}>

                          <Image source={imagePath.dots2} />
                          {
                            item.id === active &&
                            <View
                              style={[
                                {
                                  backgroundColor: colors.white,
                                  position: "absolute",
                                  elevation: 10,
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
                                      title: "Delete CV?",
                                      message: "Are you sure you want to delete this record?",
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
                    )
                  }}
                />
              </> : <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size={responsiveScreenFontSize(3)} />
              </View>
            }
          </ScrollView>
        </TouchableWithoutFeedback>
      </NavigationBar>
    </>
  );
};

export default Notification;
