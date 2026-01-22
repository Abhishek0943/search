import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
  getAPNSToken,
  setAPNSToken,
} from '@react-native-firebase/messaging';
import { getApps, initializeApp } from '@react-native-firebase/app';
export async function requestUserPermission(): Promise<void> {
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
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
export const getFCMToken = async (): Promise<null | string> => {
  try {
    if (getApps().length === 0) {
      console.log("No Firebase apps found. Native config missing (plist/json).");
      return null;
    }

    const messaging = getMessaging();

    // 1) Make sure remote messages registration is done
    const registered = await isDeviceRegisteredForRemoteMessages(messaging);
    if (!registered) {
      await registerDeviceForRemoteMessages(messaging);
    }

    // 2) Request notification permission (iOS needs it; Android 13+ also)
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("Notification permission not granted:", authStatus);
      return null;
    }

    // 3) iOS: ensure APNs token exists before FCM token
    if (Platform.OS === "ios") {
      let apns = await getAPNSToken(messaging);
      if (!apns) {
        // give iOS a moment to generate it
        await sleep(800);
        apns = await getAPNSToken(messaging);
      }

      // Some setups need explicitly setting the APNs token (safe to do)
      if (apns) {
        await setAPNSToken(messaging, apns);
      } else {
        console.log("APNs token not ready yet. Try again after app restart.");
        // Not always fatal, but often FCM token won't come without APNs
        // return null;
      }
    }

    // 4) Retry getToken (sometimes first call throws unregistered)
    for (let i = 0; i < 3; i++) {
      try {
        const token = await getToken(messaging);
        if (token) return token;
      } catch (e: any) {
        console.log(`getToken attempt ${i + 1} failed:`, e?.message ?? e);
        await sleep(500);
      }
    }

    console.log("FCM token not available.");
    return null;
  } catch (error) {
    console.log("getFCMToken error:", error);
    return null;
  }
};