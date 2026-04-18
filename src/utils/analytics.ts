import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Log a screen view event to Firebase Analytics.
 * Called automatically from Routes.tsx — no per-page calls needed.
 */
export const logScreen = async (screenName: string): Promise<void> => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (e) {
    // silently ignore — analytics should never crash the app
  }
};

/**
 * Set the current user context on both Analytics and Crashlytics.
 * Call this after a successful login.
 *
 * @param userId   - Unique user identifier
 * @param attrs    - Optional key/value attributes (e.g. { role: 'recruiter' })
 */
export const setAnalyticsUser = async (
  userId: string,
  attrs?: Record<string, string>,
): Promise<void> => {
  try {
    await analytics().setUserId(userId);
    await crashlytics().setUserId(userId);

    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        await analytics().setUserProperty(key, value);
        await crashlytics().setAttribute(key, value);
      }
    }
  } catch (e) {
    // silently ignore
  }
};

/**
 * Clear user context (call on logout).
 */
export const clearAnalyticsUser = async (): Promise<void> => {
  try {
    await analytics().setUserId(null);
    await crashlytics().setUserId('');
  } catch (e) {
    // silently ignore
  }
};

/**
 * Log a custom event to Firebase Analytics.
 *
 * @param name   - Event name (snake_case, max 40 chars)
 * @param params - Optional event parameters
 */
export const logEvent = async (
  name: string,
  params?: Record<string, any>,
): Promise<void> => {
  try {
    await analytics().logEvent(name, params);
  } catch (e) {
    // silently ignore
  }
};

/**
 * Record a JavaScript error in Firebase Crashlytics.
 * Used inside the ErrorBoundary and for caught errors you want to report.
 *
 * @param error   - The Error object
 * @param context - Optional human-readable context string
 */
export const recordError = (error: Error, context?: string): void => {
  try {
    if (context) crashlytics().log(context);
    crashlytics().recordError(error);
  } catch (e) {
    // silently ignore
  }
};
