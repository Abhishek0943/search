import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidStyle, AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
  getAPNSToken,
} from '@react-native-firebase/messaging';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
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
const sleep = (ms: number) => new Promise(res => setTimeout(() => res(null), ms));


export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging();

    // 1) Register
    const registered = await isDeviceRegisteredForRemoteMessages(messaging);
    if (!registered) await registerDeviceForRemoteMessages(messaging);

    // 2) Request notification permission (iOS & Android)
    let permissionStatus = await checkNotifications();
    console.log("Current permission status:", permissionStatus);

    // Keep asking until user denies permanently
    while (permissionStatus.status !== 'granted' && permissionStatus.status !== 'blocked') {
      const result = await requestNotifications(['alert', 'sound', 'badge']);
      permissionStatus = result;
      console.log("Permission result:", permissionStatus);

      // If user denied, ask again (except if blocked/permanently denied)
      if (permissionStatus.status === 'denied') {
        console.log("User denied, asking again...");
        await sleep(500);
        continue;
      }

      // If granted, exit loop
      if (permissionStatus.status === 'granted') {
        break;
      }
    }

    const enabled = permissionStatus.status === 'granted';
    console.log("Final permission status:", permissionStatus.status);

    if (!enabled) {
      console.log("Notification permission not granted");
      return null;
    }

    // 3) iOS must have APNs token
    if (Platform.OS === "ios") {
      let apns = await getAPNSToken(messaging);
      if (!apns) {
        await sleep(800);
        apns = await getAPNSToken(messaging);
      }
      console.log("APNs token:", apns);

      if (!apns) return null;
    }

    const token = await getToken(messaging);
    console.log("FCM token:", token);
    return token || null;
  } catch (e: any) {
    console.log("getFCMToken error:", e?.message ?? e);
    return null;
  }
};

export const onDisplayNotification = async (title: string, body: string, imageUrl?: string) => {
  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.DEFAULT,
  });

  const finalImageUrl = imageUrl || "https://picsum.photos/200";

  // Display a notification
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      style: {
        type: AndroidStyle.BIGPICTURE,
        picture: finalImageUrl,
      },
      pressAction: {
        id: 'default',
      },
    },
  });
};