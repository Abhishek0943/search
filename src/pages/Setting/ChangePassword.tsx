import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';
import { InPutWithLable, PageHeaderOne } from '../../components';
import { fonts, lightColors, } from '../../constants/values';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';

import { postApiCall } from '../../api';
import { showError, showSuccess } from '../../utils/helperFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';
const colors = lightColors;
const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <PageHeaderOne heading={'Change Password'} rightIcon={' '} />
      <View style={{ marginHorizontal: responsiveScreenWidth(2) }}>
        <InPutWithLable
          label="Password"
          isRequired
          value={email}
          onChangeText={e => setEmail(e)}
          placeholder={'Enter your password'}
        />

        <InPutWithLable
          value={password}
          onChangeText={e => setPassword(e)}
          label="New password"
          isRequired
          placeholder="Enter new password"
        />
      </View>
      <View style={{ flex: 1 }}></View>
      <Pressable
        onPress={async () => {
          const a = await postApiCall<UserResponse>('change-password', {
            current_password: email,
            new_password: password,
          });
          if (!a.success) {
            showError(a.message)
          }else{
            showSuccess(a.message)
            setEmail("")
            setPassword("")
          }
        }}
        style={{
          marginVertical: responsiveScreenHeight(1),
          marginHorizontal: responsiveScreenWidth(3),
          backgroundColor: colors.blue,
          borderRadius: 7,
          // paddingHorizontal: responsiveScreenWidth(3),
          paddingVertical: responsiveScreenHeight(1),
          width: 'auto',
        }}>
        <Text
          style={{
            fontSize: responsiveScreenFontSize(2),
            fontFamily: fonts.poppinsM,
            textAlign: 'center',
            color: colors.btnText,
            width: 'auto',
            // marginTop: responsiveScreenHeight(0.4),
          }}>
          Reset Password
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ChangePassword;
