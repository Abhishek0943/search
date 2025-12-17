import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { InPutWithLable, PageHeaderOne } from '../../components';
import OtpInput from '../../components/OtpInput';
import { fonts, lightColors } from '../../constants/values';
import usePostData from '../../hooks/usePostData';
import { GetProfile } from '../../reducer/userReducer';
import { useAppDispatch, useAppSelector } from '../../store';
import { showError, showSuccess } from '../../utils/helperFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleError } from '../Home/Home';

const colors = lightColors;

const ChangeEmail = () => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [otpCurrent, setOtpCurrent] = useState(Array(6).fill(''));
  const [otpNew, setOtpNew] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const { user } = useAppSelector(state => state.userStore);
  const handleOtpChange = (newOtp: Array<string>) => {
    if (step === 2) setOtpCurrent(newOtp);
    else if (step === 4) setOtpNew(newOtp);
  };
  const { mutate: postCurrentEmailOtp } = usePostData('/sendOtp', 'post', {
    onSuccess: res => {
      setLoading(false);
      showSuccess(res?.message);
      setStep(2);
    },
    onError: error => {
      setLoading(false);
      handleError(error)

    },
  });

  const sendOtpCurrentEmail = () => {
    const data = { email: user?.email };
    setLoading(true);
    postCurrentEmailOtp(data);
  };

  const { mutate: verifyCurrentEmailOtp } = usePostData(
    '/verifyOtpAUth',
    'post',
    {
      onSuccess: res => {
        setLoading(false);
        showSuccess(res?.message);
        setOtpCurrent(Array(6).fill(''));
        setStep(3);
      },
      onError: error => {
        setLoading(false);
        handleError(error)
      },
    },
  );

  const verifyCurrentOtp = () => {
    const data = {
      email: user?.email,
      otp: otpCurrent.join(''),
    };
    setLoading(true);
    verifyCurrentEmailOtp(data);
  };

  const { mutate: postNewEmailOtp } = usePostData('/sendOtpNewEmal', 'post', {
    onSuccess: res => {
      setLoading(false);
      showSuccess(res?.message);
      setStep(4);
    },
    onError: error => {
      setLoading(false);
      handleError(error)
    },
  });

  const sendOtpNewEmail = () => {
    const data = { email: newEmail };
    setLoading(true);
    postNewEmailOtp(data);
  };

  const { mutate: verifyNewEmailOtp } = usePostData(
    '/verifyOtpAUthNewEmail',
    'post',
    {
      onSuccess: res => {
        setLoading(false);
        dispatch(GetProfile());
        showSuccess(res?.message);
        setStep(1);
        setNewEmail('');
        setOtpCurrent(Array(6).fill(''));
        setOtpNew(Array(6).fill(''));
      },
      onError: error => {
        setLoading(false);
        console.log("========", error)
        handleError(error)

      },
    },
  );

  const verifyNewOtp = () => {
    const data = {
      email: newEmail,
      otp: otpNew.join(''),
    };
    setLoading(true);
    console.log(data, "=======new mail")

    verifyNewEmailOtp(data);
  };

  const handleButtonPress = () => {
    if (step === 1) sendOtpCurrentEmail();
    else if (step === 2) verifyCurrentOtp();
    else if (step === 3) sendOtpNewEmail();
    else if (step === 4) verifyNewOtp();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <PageHeaderOne heading={'Change Email'} rightIcon={' '} />
      <View
        style={{
          marginTop: responsiveScreenHeight(1),
          marginHorizontal: responsiveScreenWidth(3),
        }}>
        {step === 1 && (
          <>
            <InPutWithLable
              value={user?.email}
              editable={false}
              label="Current Email"
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>
              Enter OTP sent to your current email
            </Text>
            <OtpInput
              length={6}
              value={otpCurrent}
              disabled={false}
              onChange={handleOtpChange}
            />
          </>
        )}

        {step === 3 && (
          <>
            <InPutWithLable
              value={newEmail}
              label="New Email"
              isRequired
              placeholder="Enter new email"
              onChangeText={setNewEmail}
            />
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.label}>Enter OTP sent to your new email</Text>
            <OtpInput
              length={6}
              value={otpNew}
              disabled={false}
              onChange={handleOtpChange}
            />
          </>
        )}
      </View>

      <View style={{ flex: 1 }} />
      <Pressable onPress={handleButtonPress} style={styles.btn}>
        <Text style={styles.btnText}>
          {step === 1 && 'Send OTP to Current Email'}
          {step === 2 && 'Verify Current OTP'}
          {step === 3 && 'Send OTP to New Email'}
          {step === 4 && 'Verify New OTP'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = {
  label: {
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
    marginTop: responsiveScreenHeight(1),
  },
  btn: {
    marginVertical: responsiveScreenHeight(1),
    marginHorizontal: responsiveScreenWidth(3),
    backgroundColor: colors.blue,
    borderRadius: 7,
    paddingHorizontal: responsiveScreenWidth(3),
    paddingVertical: responsiveScreenHeight(1),
  },
  btnText: {
    fontSize: responsiveScreenFontSize(2),
    fontFamily: fonts.poppinsM,
    textAlign: 'center',
    color: colors.btnText,
  },
};

export default ChangeEmail;
