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
    const registered = await isDeviceRegisteredForRemoteMessages(messaging);
    if (!registered) await registerDeviceForRemoteMessages(messaging);
    let permissionStatus = await checkNotifications();
    while (permissionStatus.status !== 'granted' && permissionStatus.status !== 'blocked') {
      const result = await requestNotifications(['alert', 'sound', 'badge']);
      permissionStatus = result;
      if (permissionStatus.status === 'denied') {
        await sleep(500);
        continue;
      }
      if (permissionStatus.status === 'granted') {
        break;
      }
    }

    const enabled = permissionStatus.status === 'granted';
    if (!enabled) {
      return null;
    }
    if (Platform.OS === "ios") {
      let apns = await getAPNSToken(messaging);
      if (!apns) {
        await sleep(800);
        apns = await getAPNSToken(messaging);
      }
      if (!apns) return null;
    }

    const token = await getToken(messaging);
    return token || null;
  } catch (e: any) {
    return null;
  }
};

export const onDisplayNotification = async (title: string, body: string, imageUrl?: string) => {
  await notifee.requestPermission();
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.DEFAULT,
  });

  const finalImageUrl = imageUrl || "https://picsum.photos/200";
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