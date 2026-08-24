import React, { useContext } from 'react';
import {TouchableOpacity} from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Text from './Text';

type ButtonProps = {
  label: string;
  backgroundColor?: string;
    onPress?: () => void;
};

const Button = ({ label, backgroundColor, onPress = () => {} }: ButtonProps) => {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: responsiveWidth(90),
        aspectRatio: 350 / 56,
        backgroundColor: backgroundColor || colors.primary,
        height: 'auto',
        borderRadius: 15,
      }}
    >
      <Text
        style={{
          color: colors.white,
          fontSize: 19,
          fontWeight: 'bold',
          textAlign: 'center',
          paddingVertical: 15,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
