import { View, Text, FlatList, Image, Pressable, Alert, TouchableWithoutFeedback, ScrollView } from 'react-native';
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
import { GetCv, GetNotification } from '../../reducer/jobsReducer';
import { Header } from '../Company/Company';

const Notification = () => {
  const [data, setData] = useState([...new Array(10)]);
  const navigation = useNavigation();
  const { colors } = useContext(ThemeContext);

 const dispatch = useAppDispatch();
  const [cvs, setCvs] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      
        dispatch(GetNotification())
          .unwrap()
          .then(res => {
            if (res.success !== false) {
              setCvs(res.data);
            }
            console.log(res);
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
              width: responsiveScreenWidth(90),
              alignSelf: 'center',
              alignItems: 'center',
              flex: 1,
              paddingBottom: responsiveScreenHeight(3),
            }}
          >
           <Header title="Notifications" />
            {
              cvs.length>0?<></>:<>
              <View style={{flex:1, justifyContent:"center"}}>
                <Image source={imagePath.notificationEmptyImage}/>
              </View>
              </>
            }
          </ScrollView>
        </TouchableWithoutFeedback>
      </NavigationBar>
    </>
  );
};

export default Notification;
