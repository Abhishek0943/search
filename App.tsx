import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from "./src/navigation/Routes";
import { WrapperContainer } from "./src/components";
import { enableScreens } from 'react-native-screens';

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
      <ThemeProvider key={1}>
        <AppContent />
      </ThemeProvider>
  </Provider>
);

export default App;
