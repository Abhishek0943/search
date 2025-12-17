import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { InPutWithLable } from '../../components';
import WrapperContainer from '../../components/WrapperContainer';
import imagePath from '../../constants/imagePath';
import { fonts, lightColors } from '../../constants/values';
import usePostData from '../../hooks/usePostData';
import { useAppDispatch, useAppSelector } from '../../store';
import { requestCameraPermission, showError, showSuccess } from '../../utils/helperFunctions';
import { GetProfile } from '../../reducer/userReducer';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import ImageCropPicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from '../../styles/scaling';

const colors = lightColors;

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.userStore);
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<null | {
    uri: string;
    name: string;
    type: string;
  }>(null);

  const [userData, setUserData] = useState({
    name: user?.name || '',
    username: user?.user_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    bio: user?.bio || '',
    website: user?.website || 'https://yourwebsite.com',
  });

  const { mutate: postUpload } = usePostData<Error>('/update-profile', 'post', {
    onSuccess: async res => {
      setLoading(false);
      dispatch(GetProfile());
      showSuccess(res?.message);
      navigation.goBack();
    },
    onError: async (error: any) => {
      setLoading(false);
      console.error('Update Error:===>', error);
      showError(error?.message);
    },
  });

  const handleSave = () => {
    if (
      !userData.email ||
      !userData.name ||
      !userData.username ||
      !userData.phone
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('country_code', state.callingCode);
    formData.append('user_name', userData.username);
    formData.append('phone_number', userData.phone);
    formData.append('country_id', '1');
    formData.append('bio', userData.bio);
    formData.append('website', userData.website);
    if (image) {
      formData.append('cover_image', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    }
    setLoading(true);
    postUpload(formData);
  };

  const handlePhoneChange = (phoneNumber: string) => {
    const onlyNumbers = phoneNumber.replace(/[^0-9]/g, '');
    updateState({ phoneNumber: onlyNumbers });
    setUserData(prev => ({ ...prev, phone: onlyNumbers }));
  };

  const handleLaunchCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    try {
      const result = await ImageCropPicker.openCamera({
        width: 160*4,
        height: 58*4,
        cropping: true,
        includeBase64: false,
      });

      setImage({
        uri: result.path,
        name: result.filename || 'profile.jpg',
        type: result.mime,
      });
    } catch (error) {
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const result = await ImageCropPicker.openPicker({
        width: 160*4,
        height: 58*4,
        cropping: true,
        includeBase64: false,
      });

      setImage({
        uri: result.path,
        name: result.filename || 'profile.jpg',
        type: result.mime,
      });
    } catch (error) {
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Select Image', 'Choose image source', [
      { text: 'Camera', onPress: handleLaunchCamera },
      { text: 'Gallery', onPress: handleLaunchGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const [state, setState] = useState({
    callingCode: user?.country_code,
    cca2: 'AU',
    phoneNumber: '',
  });

  const updateState = (data: any) => setState(prev => ({ ...prev, ...data }));

  const _onCountryChange = (data: any) => {
    updateState({ cca2: data.cca2, callingCode: data.callingCode[0] });
    setUserData(prev => ({ ...prev, country_code: data.callingCode[0] }));
  };

  return (
    <SafeAreaView style={{ flex: 1,}}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, }}>
          <View >

        <ScrollView style={{  }} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={imagePath.cross} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave}>
              <Image source={imagePath.tick_black} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={handleImagePicker}
            style={styles.profileImageContainer}>
            <Image
              source={{ uri: image?.uri || user?.cover_image }}
              style={styles.profileImage}
            />
          </Pressable>

          <View style={styles.form}>
            <InPutWithLable
              value={userData.name}
              onChangeText={e => setUserData({ ...userData, name: e })}
              label="Name"
            />
            <InPutWithLable
              value={userData.username}
              onChangeText={e => setUserData({ ...userData, username: e })}
              label="Username"
              editable={false}
            />
            <InPutWithLable
              value={userData.email}
              onChangeText={e => setUserData({ ...userData, email: e })}
              label="Email Address"
              isRequired
              editable={false}
            />
            <Text style={styles.label}>
              Phone<Text style={styles.required}>*</Text>
            </Text>

            <PhoneNumberInput
              onCountryChange={_onCountryChange}
              onChangePhone={handlePhoneChange}
              maxLength={11}
              cca2={state.cca2}
              phoneNumber={userData.phone}
              callingCode={state.callingCode}
              require={true}
              keyboardType={'phone-pad'}
            />
            <InPutWithLable
              value={userData.bio}
              onChangeText={e => setUserData({ ...userData, bio: e })}
              label="Bio"
            />
            <InPutWithLable
              value={userData.website}
              onChangeText={e => setUserData({ ...userData, website: e })}
              label="Website"
            />
          </View>
        </ScrollView>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  scroll: {
    padding: responsiveScreenHeight(1.5),
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveScreenHeight(2.2),
  },
  title: {
    fontSize: responsiveScreenFontSize(2),
    fontFamily: fonts.poppinsM,
  },
  icon: {
    width: responsiveScreenWidth(6),
    height: responsiveScreenHeight(3),
    resizeMode: 'contain',
  },
  profileImageContainer: {
    alignSelf: 'center',
    width: moderateScale(90),
    height:verticalScale(70),
    overflow: 'hidden',
    borderRadius: moderateScale(16),
    backgroundColor:colors.lightGray
  },
  profileImage: {
    height: '100%',
    width: '100%',
    resizeMode:"contain"
  },
  form: {
    gap: 6,
  },
  label: {
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
  },
  required: {
    fontSize: responsiveScreenFontSize(1.6),
    fontFamily: fonts.poppinsM,
    color: colors.red,
    marginTop: responsiveScreenHeight(1),
  },
});
