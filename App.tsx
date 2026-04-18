import React, { useEffect, useState, useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from "./src/navigation/Routes";
import { WrapperContainer } from "./src/components";
import { enableScreens } from 'react-native-screens';
import { AlertProvider } from "./src/context/AlertContext";
import { StripeProvider } from '@stripe/stripe-react-native'
import { SocketProvider } from "./src/context/SocketProvider";
import ErrorBoundary from "./src/components/ErrorBoundary";
enableScreens(true);
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
} from "sp-react-native-in-app-updates";

let configured = false;
const inAppUpdates = new SpInAppUpdates(false);

export async function initRevenueCat(appUserId?: string | null) {
  if (configured) return;

  if (Platform.OS !== "ios") {
    configured = true;
    return;
  }
  // Put your RevenueCat iOS Public SDK Key here (starts with "appl_")
  const IOS_API_KEY = "appl_dqiZtBzrbZSAYRmwUwEQdHnpuNO";
  if (!IOS_API_KEY || !IOS_API_KEY.startsWith("appl_")) {
    throw new Error("RevenueCat iOS API key missing or invalid");
  }
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({
    apiKey: IOS_API_KEY,
    appUserID: appUserId ?? undefined,
  });
  configured = true;
}

export async function rcLogin(appUserId: string) {
  await initRevenueCat(); // make sure it’s configured
  await Purchases.logIn(appUserId);
}

export async function rcLogout() {
  await initRevenueCat(); // make sure it’s configured
  await Purchases.logOut();
}


const AppContent: React.FC = React.memo(() => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== "ios") {
          return;
        }
        await initRevenueCat(null);
      } catch (e) {
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // In-app updates (android only)
  const checkForUpdates = useCallback(async () => {
    if (Platform.OS !== "android") return;
    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      if (!result.shouldUpdate) return;
      const options: StartUpdateOptions = { updateType: IAUUpdateKind.IMMEDIATE };
      await inAppUpdates.startUpdate(options);
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const listener = (status: any) => {
      if (status.status === IAUInstallStatus.DOWNLOADED) {
        inAppUpdates.installUpdate();
      }
    };
    inAppUpdates.addStatusUpdateListener(listener);

    return () => {
      inAppUpdates.removeStatusUpdateListener(listener);
    };
  }, []);

  if (!ready) return null;
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <WrapperContainer >
        <Routes />
      </WrapperContainer>
    </SafeAreaProvider>
  );
});
const App: React.FC = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <StripeProvider
        merchantIdentifier="merchant.com.searchtalent.app"
        publishableKey="pk_live_51RYRHEKzQ210P9pldkRm88H5hzMQQuTDgU0Q2gON2YuTb5bVZkkoX0G9Mvizl2uYMxXmNTgIXALn8rRx2bOcQtZh002vm5EeQV">
        <ThemeProvider key={1}>
          <SocketProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </SocketProvider>
        </ThemeProvider>
      </StripeProvider>
    </Provider>
  </ErrorBoundary>
);
export default App;
