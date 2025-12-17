import { firebase } from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const firebaseConfig = {
  apiKey: "your apiKey",
  authDomain: "your authDomain",
  databaseURL: "your databaseURL",
  projectId: "your projectId",
  storageBucket: "your storage bucket",
  messagingSenderId: "your messaginId",
  appId: Platform.OS === 'ios'
    ? "your ios appid"
    : "your_android_app_id",
  measurementId: "G-measurement-id",
};

console.log('Initializing Firebase...');
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized');
} else {
  console.log('Firebase already initialized');
}


// Initialize Firebase Analytics and Crashlytics
analytics().logAppOpen();
crashlytics().log('App started.');

// Screen View Tracking
export const logScreenView = (screenName, screenClass) => {
  analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass,
  });
};

// Custom Event Logging
export const logEvent = (eventName, params = {}) => {
  analytics().logEvent(eventName, params);
};

// Error Logging with Crashlytics
export const logError = (error, context = '') => {
  if (context) {
    crashlytics().log(context);
  }
  crashlytics().recordError(error);
};

// Setting Custom Keys for Crashlytics
export const setCustomKey = (key, value) => {
  crashlytics().setAttribute(key, value);
};

// Force a Crash (Useful for testing)
export const triggerCrash = () => {
  crashlytics().crash();
};

export { firebaseAnalytics, firebaseCrashlytics };
export default firebase;