import React from "react";
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
enableScreens(true);

const AppContent: React.FC = React.memo(() => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <WrapperContainer >
        <Routes />
      </WrapperContainer>
    </SafeAreaProvider>
  );
});

const App: React.FC = () => (
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
);

export default App;
