import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// App Open
export const logAppOpen = async () => {
  await analytics().logAppOpen();
  crashlytics().log('App started');
};

// Screen View Tracking
export const logScreenView = async (screenName, screenClass = screenName) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass,
  });
};

// Custom Event Logging
export const logEvent = async (eventName, params = {}) => {
  await analytics().logEvent(eventName, params);
};

// Error Logging with Crashlytics
export const logError = (error, context = '') => {
  if (context) crashlytics().log(context);
  crashlytics().recordError(error);
};

// Custom key/value
export const setCustomKey = async (key, value) => {
  await crashlytics().setAttribute(key, String(value));
};

// Force crash (testing)
export const triggerCrash = () => crashlytics().crash();
