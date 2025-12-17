import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  requestPermission,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

/**
 * Request Notification Permission from the user
 */
export async function requestUserPermission(): Promise<void> {
  console.log('PermissionsAndroid.RESULTS.GRANTED', PermissionsAndroid.RESULTS.GRANTED);

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      console.log('Notification permission granted status:', granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.log('Error requesting notification permission', error);
    }
  } else {
    try {
      const authStatus = await requestPermission(getMessaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await getFCMToken();
      }
    } catch (error) {
      console.log('Error requesting FCM permission', error);
    }
  }
}

/**
 * Get FCM Token and store it locally
 */
const getFCMToken = async (): Promise<void> => {
  try {
    const messagingInstance = getMessaging();

    const isRegistered = await isDeviceRegisteredForRemoteMessages(messagingInstance);
    if (!isRegistered) {
      await registerDeviceForRemoteMessages(messagingInstance);
    }

    const fcmToken = await AsyncStorage.getItem('fcm_token');
    if (fcmToken) {
      console.log('OLD FCM_TOKEN FOUND:', fcmToken);
    } else {
      const token = await getToken(messagingInstance);
      await AsyncStorage.setItem('fcm_token', token);
      console.log('NEW FCM_TOKEN GENERATED:', token);
    }
  } catch (error) {
    console.log('Error during generating FCM token', error);
  }
};
