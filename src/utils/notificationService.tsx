import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
export async function requestUserPermission(): Promise<void> {
  console.log('PermissionsAndroid.RESULTS.GRANTED', PermissionsAndroid.RESULTS.GRANTED);

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await getFCMToken();
      } else {
      }
    } catch (error) {
    }
  } else {
    try {
      const authStatus = await requestPermission(getMessaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await getFCMToken();
      }
    } catch (error) {
    }
  }
}

export const getFCMToken = async (): Promise<null | string> => {
  try {
    const messagingInstance = getMessaging();
    const isRegistered = await isDeviceRegisteredForRemoteMessages(messagingInstance);
    if (!isRegistered) {
      await registerDeviceForRemoteMessages(messagingInstance);
    }
    const token = await getToken(messagingInstance);
    return token
  } catch (error) {
    return null
    console.log('Error during generating FCM token', error);
  }
};
