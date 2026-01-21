// env/EnvProvider.tsx

import React, {
  createContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type EnvMode = 'dev' | 'prod';

interface EnvContextType {
  env: EnvMode;
  setEnv: (mode: EnvMode) => void;
  toggleEnv: () => void;
}

export const EnvContext = createContext<EnvContextType>({
  env: 'prod',
  setEnv: () => {},
  toggleEnv: () => {},
});

interface Props {
  children: ReactNode;
}

export const EnvProvider: React.FC<Props> = ({ children }) => {
  const [env, setEnv] = useState<EnvMode>('prod'); // default prod

  const toggleEnv = () => {
    setEnv(prev => (prev === 'prod' ? 'dev' : 'prod'));
  };

  const value = useMemo(
    () => ({ env, setEnv, toggleEnv }),
    [env]
  );

  return (
    <EnvContext.Provider value={value}>
      {/* Debug toggle */}
      <View
        style={{
          position: 'absolute',
          top: 50,
          right: 0,
          zIndex: 999,
          backgroundColor: '#00000080',
          padding: 8,
          borderBottomLeftRadius: 6,
        }}
      >
        <TouchableOpacity onPress={toggleEnv}>
          <Text style={{ color: '#fff', fontSize: 20 }}>
            ENV: {env.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {children}
    </EnvContext.Provider>
  );
};
