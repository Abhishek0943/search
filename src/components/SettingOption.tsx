import React, { useContext } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';


interface SettingOptionProps {
  icon: () => React.ReactNode;
  rightIcon?: () => React.ReactNode;
  label: string;
  onPress: () => void;
  height?: number;
  gap?: number;

  discription?: string
}

const SettingOption: React.FC<SettingOptionProps> = ({gap= responsiveScreenWidth(3), icon, label, discription, onPress, rightIcon, height = responsiveScreenWidth(6) }) => {
  const { colors } = useContext(ThemeContext)

  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", gap}}
    >
      <View style={{ height, justifyContent: "center", alignItems: "center", aspectRatio: 1 }}>
        {icon()}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: responsiveScreenFontSize(1.5),
            color: colors.textPrimary,
            fontWeight: "400"
          }}>
          {label}
        </Text>
        {
          discription &&
          <Text
            style={{
              fontSize: responsiveScreenFontSize(1.5),
              color: colors.textSecondary,
            }}>
            {discription}
          </Text>
        }

      </View>


      {rightIcon && rightIcon()}
    </Pressable>
  );
};

export default SettingOption;
