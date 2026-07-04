/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { onDisplayNotification } from './src/utils/notificationService';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const title = remoteMessage.data?.title || remoteMessage.notification?.title;
  const body = remoteMessage.data?.body || remoteMessage.notification?.body;
  const imageUrl = remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.imageUrl || remoteMessage.data?.image;

  if (title && body && !remoteMessage.notification) {
    await onDisplayNotification(title, body, imageUrl, remoteMessage.data);
  }
});

AppRegistry.registerComponent("SearchTalent", () => App);
