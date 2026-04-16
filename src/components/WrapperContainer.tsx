import React, { ReactNode, useContext, useEffect } from 'react';
import {
  View,
  ViewStyle,
  StatusBarStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import { useAppDispatch, useAppSelector } from '../store';
import { setMessageCount } from '../reducer/userReducer';
import { onDisplayNotification } from '../utils/notificationService';

interface WrapperContainerProps {
  children: ReactNode;
  statusBarColor?: string;
  barStyle?: StatusBarStyle;
  withModal?: boolean;
}
const WrapperContainer: React.FC<WrapperContainerProps> = ({
  children,
}) => {
  const { colors } = useContext(ThemeContext);
  const { user } = useAppSelector(state => state.userStore);
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.statusBar,
  };
  const insets = useSafeAreaInsets();

  const innerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    // marginTop: insets.top, marginBottom: insets.bottom, marginLeft: insets.left, marginRight: insets.right,
  };

  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!user?.id) return;

    // If you only want this feature on Android, keep this:
    // if (Platform.OS !== "android") return;

    let unsubscribe: undefined | (() => void);

    const start = async () => {
      try {
        // On iOS you should request permission before listening
        if (Platform.OS === "ios") {
          const authStatus = await messaging().requestPermission();
          // optional: you can check authStatus if you want
        }

        unsubscribe = messaging().onMessage(async remoteMessage => {
          const { title, body } = remoteMessage.notification || {}
          const imageUrl = remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.imageUrl || remoteMessage.data?.image;
          if (title && body) {
            onDisplayNotification(title, body, imageUrl as string)
          }
          dispatch(
            setMessageCount({
              messages_count: remoteMessage?.data?.unread_message_count || 0,
            })
          );
        });
      } catch (e) {
      }
    };

    start();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);
  return (
    <View style={[containerStyle,]}>
      <StatusBar hidden={true} />
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
};

export default React.memo(WrapperContainer);
