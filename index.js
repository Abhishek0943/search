/**
 * @format
 */

import { AppRegistry, Dimensions } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import App from './App';
// import { onDisplayNotification } from './src/utils/notificationService';

// Polyfill for Dimensions.removeEventListener which was removed in React Native 0.70
const dimensionsSubscriptions = new Map();
const originalAddEventListener = Dimensions.addEventListener;
Dimensions.addEventListener = (type, handler) => {
  const subscription = originalAddEventListener(type, handler);
  dimensionsSubscriptions.set(handler, subscription);
  return {
    remove: () => {
      subscription.remove();
      dimensionsSubscriptions.delete(handler);
    }
  };
};

if (typeof Dimensions.removeEventListener === 'undefined') {
  Dimensions.removeEventListener = (type, handler) => {
    const subscription = dimensionsSubscriptions.get(handler);
    if (subscription) {
      subscription.remove();
      dimensionsSubscriptions.delete(handler);
    }
  };
}

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   const title = remoteMessage.data?.title || remoteMessage.notification?.title;
//   const body = remoteMessage.data?.body || remoteMessage.notification?.body;
//   const imageUrl = remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.imageUrl || remoteMessage.data?.image;

//   if (title && body && !remoteMessage.notification) {
//     await onDisplayNotification(title, body, imageUrl, remoteMessage.data);
//   }
// });

AppRegistry.registerComponent("SearchTalent", () => App);
