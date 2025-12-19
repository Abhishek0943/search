import React from 'react';
import {
  Text as RNText,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { Fonts } from '../assets/imagePath';

export default function Text({ style, ...props }: TextProps) {
  const flatStyle = StyleSheet.flatten(style) as TextStyle;
  let fontFamily = Fonts.GilroyRegular;
  switch (flatStyle?.fontWeight) {
    case '500':
    case '600':
      fontFamily = Fonts.GilroyMedium;
      break;

    case '700':
    case 'bold':
      fontFamily = Fonts.GilroyBold;
      break;

    case '800':
    case '900':
      fontFamily = Fonts.GilroyBold;
      break;

    default:
      fontFamily = Fonts.GilroyRegular;
  }

  const { fontWeight, ...restStyle } = flatStyle || {};

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        { fontFamily },
        restStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    color: '#000',
  },
});
