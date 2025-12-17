import React, {useState} from 'react';
import {
  I18nManager,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import CountryPicker, {Country, Flag} from 'react-native-country-picker-modal';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import imagePath from '../constants/imagePath';
import {fonts, lightColors} from '../constants/values';

interface PhoneNumberInputProps {
  cca2?: string;
  callingCode?: string;
  onChangePhone: (text: string) => void;
  onCountryChange: (country: Country) => void;
  phoneNumber: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  color?: string;
  autoFocus?: boolean;
  showCountryCode?: boolean;
  TxtInputStyle?: TextStyle;
  flagSize?: number;
  downArrowStyle?: object;
  require?: boolean;
  maxLength?: number;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  cca2 = '',
  callingCode = '',
  onChangePhone,
  onCountryChange,
  phoneNumber,
  placeholder,
  containerStyle,
  color,
  autoFocus = false,
  showCountryCode = true,
  TxtInputStyle,
  flagSize = 20,
  downArrowStyle,
  require = false,
  maxLength = 15,
}) => {
  const [countryPickerModalVisible, setCountryPickerModalVisible] =
    useState<boolean>(false);
  const colors = lightColors;
  const _onCountryChange = (data: Country) => {
    setCountryPickerModalVisible(false);
    onCountryChange(data);
  };

  const _openCountryPicker = () => {
    setCountryPickerModalVisible(true);
  };

  const _onCountryPickerModalClose = () => {
    setCountryPickerModalVisible(false);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        // borderRadius: 12,
        borderRadius: responsiveScreenHeight(0.5),
        height: responsiveScreenHeight(6),
        borderWidth: 1,
        ...containerStyle,
      }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: responsiveScreenWidth(16),
        }}
        onPress={_openCountryPicker}>
        {showCountryCode && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                color: 'black',
                fontSize: responsiveScreenFontSize(1.5),
              }}>
              +
            </Text>
            <Text
              style={{
                fontFamily: fonts.poppinsM,
                color: 'black',
                marginTop: 4,
                marginHorizontal: 2,
              }}>
              {callingCode}
            </Text>
          </View>
        )}

        {/* <Flag countryCode={'AU'} flagSize={24} /> */}
      </TouchableOpacity>
      <TextInput
        maxLength={maxLength}
        selectionColor={'black'}
        placeholder={placeholder}
        keyboardType="numeric"
        value={phoneNumber}
        placeholderTextColor={color || 'black'}
        onChangeText={onChangePhone}
        style={{
          width: responsiveScreenWidth(80),
          borderLeftWidth: 1,
          fontFamily: fonts.poppinsM,
          color: 'black',
          fontSize: responsiveScreenFontSize(1.8),
          borderLeftColor: 'black',
          paddingTop: 0,
          paddingBottom: 0,
          marginVertical: 8,
          paddingHorizontal: 10,
          textAlign: I18nManager.isRTL ? 'right' : 'left',
          ...TxtInputStyle,
        }}
        autoFocus={autoFocus}
      />
      {countryPickerModalVisible && (
        <CountryPicker
          withCallingCode
          visible={countryPickerModalVisible}
          withFlagButton={false}
          withFilter
          withFlag={true}
          countryCode={cca2}
          onClose={_onCountryPickerModalClose}
          onSelect={_onCountryChange}
          closeButtonImage={imagePath.cross}
        />
      )}
    </View>
  );
};

export default React.memo(PhoneNumberInput);
