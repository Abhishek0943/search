import { View, Text, FlatList, Image, Pressable, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Loading, PageHeaderOne } from '../../components';
import { fonts, lightColors, routes } from '../../constants/values';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { deteleApiCall, getApiCall } from '../../api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { height } from '../../styles/scaling';
import imagePath from '../../constants/imagePath';
import { useNavigation } from '@react-navigation/native';
import { useConfirm } from '../../ConfirmContext';

const Notification = () => {
  const colors = lightColors;
  const [data, setData] = useState([...new Array(10)]);
  const navigation = useNavigation();
  const fetchNotifications = async () => {
    const response = await getApiCall('/get-notifications');

    if (response.success) {
      setData(response.data);
    }
  };
  useEffect(() => {

    fetchNotifications();
  }, []);
  const deleteNotification = async (id: any) => {
    const response = await deteleApiCall('notification-delete/' + id);
    console.log(response, 'response');
    if (response.success) {
      fetchNotifications();
    }
  }
  const clearNotification = async () => {
    const response = await getApiCall('/notification-clear');

    if (response.success) {
      fetchNotifications();
    }
  };
  const confirm = useConfirm()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <PageHeaderOne
        style={{ paddingVertical: responsiveScreenHeight(0.2), borderBottomWidth: 0.5 }}
        heading={'Notification'}
        rightClick={() => {
          confirm({
            message: "Are you sure you want to clear all notifications?",
            onConfirm: () => clearNotification()
          })

        }}
      />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        // contentContainerStyle={{
        //   paddingTop: responsiveScreenHeight(1),
        // }}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={() => (
          <View
            style={{
              height: height,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: responsiveScreenFontSize(3),
                fontWeight: '900',
                color: colors.black,
              }}>
              You don't have notifications
            </Text>
            <Text
              style={{
                fontSize: responsiveScreenFontSize(2),
                color: Colors.secondaryText,
                textAlign: 'center',
              }}>
              No data found
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 1,
              backgroundColor: colors.lightGray,
              width: '100%',
            }}
          />
        )}
        renderItem={({ item, index }) => {
          if (!item) {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: responsiveScreenWidth(2.5),
                  paddingVertical: responsiveScreenHeight(1.5),
                  gap: responsiveScreenWidth(3),
                }}>
                <Loading
                  style={{
                    width: responsiveScreenWidth(22),
                    borderRadius: 100,
                    aspectRatio: 1,
                  }}
                />
                <View style={{ flex: 1, gap: responsiveScreenHeight(1) }}>
                  <Loading style={{ width: '100%' }} />
                  <Loading style={{ width: '100%' }} />
                  <Loading style={{ width: '100%' }} />
                </View>
              </View>
            );
          }
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: responsiveScreenWidth(2.5),
                paddingVertical: responsiveScreenHeight(1.5),
                gap: responsiveScreenWidth(3),
              }}>
              <View
                style={{
                  width: responsiveScreenWidth(14),
                  aspectRatio: 1,
                  borderRadius: 100,
                  overflow: 'hidden',
                }}>
                <Image
                  source={{
                    uri: item?.user?.profile_image,
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'cover',
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => {
                    navigation.navigate(routes.PAGE, { id: item?.user?.id });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: responsiveScreenWidth(0.1),
                  }}>
                  <Text
                    style={{
                      fontSize: responsiveScreenFontSize(1.8),
                      fontFamily: fonts.poppinsB,
                      color: colors.maintext,
                      textTransform: 'capitalize',
                    }}>
                    {item?.user?.name}
                  </Text>
                  {(item?.user?.tick === 'blue' || item?.user?.tick === 'red') && (
                    <View
                      style={{
                        width: responsiveScreenWidth(4),
                        maxWidth: 25,
                        aspectRatio: 1,
                        borderRadius: 100,
                      }}>
                      <Image
                        source={imagePath.blueTick}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                          tintColor:
                            item?.user?.tick === 'blue'
                              ? colors.blue
                              : item?.user?.tick === 'red'
                                ? colors.red
                                : undefined,
                        }}
                      />
                    </View>
                  )}

                </Pressable>
                <Text
                  style={{
                    fontSize: responsiveScreenFontSize(1.8),
                    fontFamily: fonts.poppins,
                    color: colors.maintext,
                  }}>
                  {item?.message}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveScreenFontSize(1.4),
                    fontFamily: fonts.poppinsSM,
                    color: colors.secondaryText,
                    marginTop: responsiveScreenHeight(0.5),
                  }}>
                  {item?.created_at}
                </Text>
              </View>
              <Pressable
                style={{
                  height: responsiveScreenHeight(3),
                  width: responsiveScreenWidth(5),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() =>
                  confirm({
                    message: "Are you sure you want to delete this notification?",
                    onConfirm: () => deleteNotification(item?.id)
                  })

                }
              >
                <Image source={imagePath.threeDot} style={{ resizeMode: "contain",  }} />
              </Pressable>


            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Notification;
