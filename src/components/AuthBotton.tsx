import {View, Text, Pressable, ActivityIndicator} from 'react-native';
import React from 'react';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import {fonts, lightColors} from '../constants/values';
import { verticalScale } from '../styles/scaling';
const colors = lightColors;

const AuthBotton = ({loading, text, onPress}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: responsiveScreenHeight(1),
        backgroundColor: colors.blue,
        borderRadius: 7,
        paddingHorizontal: responsiveScreenWidth(3),
        paddingVertical: verticalScale(8),
        width: 'auto',
      }}>
      {loading ? (
        <ActivityIndicator style={{height:verticalScale(20)}} size='small' color="white" />
      ) : (
        <Text
          style={{
            fontSize: responsiveScreenFontSize(2),
            fontFamily: fonts.poppinsM,
            textAlign: 'center',
            color: colors.btnText,
            width: 'auto',
            marginTop: responsiveScreenHeight(0.4),
          }}>
          {text}
        </Text>
      )}
    </Pressable>
  );
};

export default AuthBotton;
