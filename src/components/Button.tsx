import React, { useContext } from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Text from './Text';

type ButtonProps = {
  label: string;
  backgroundColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
};

const Button = ({ style = {}, label, backgroundColor, disabled, loading, onPress = () => { } }: ButtonProps) => {
  const { colors } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: responsiveWidth(90),
        aspectRatio: 350 / 56,
        backgroundColor: backgroundColor || colors.primary,
        height: 'auto',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: (disabled || loading) ? 0.8 : 1,
        ...style
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text
          style={{
            color: colors.white,
            fontSize: responsiveFontSize(2),
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
