import React, { ReactNode, useContext, useEffect } from 'react';
import {
  View,
  ViewStyle,
  StatusBarStyle,
  StatusBar,
} from 'react-native';
import { ThemeContext } from '../context/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import { useAppDispatch } from '../store';
import { setMessageCount } from '../reducer/userReducer';

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
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage)
      dispatch(setMessageCount({ messages_count: remoteMessage?.data?.unread_message_count || 0 }))
    });
    return unsubscribe;
  }, []);
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
