import React, { ReactNode, useContext } from 'react';
import {
  View,
  ViewStyle,
  StatusBarStyle,
  StatusBar,
} from 'react-native';
import { ThemeContext } from '../context/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface WrapperContainerProps {
  children: ReactNode;
  statusBarColor?: string;
  barStyle?: StatusBarStyle;
  withModal?: boolean;
}
const WrapperContainer: React.FC<WrapperContainerProps> = ({
  children,
}) => {
  const { colors } = useContext(ThemeContext);
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.statusBar,
  };
  const insets = useSafeAreaInsets();

  const innerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    // marginTop: insets.top, marginBottom: insets.bottom, marginLeft: insets.left, marginRight: insets.right,
  };
  return (
    <View style={[containerStyle,]}>
      <StatusBar hidden={true}/>
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
};

export default React.memo(WrapperContainer);
