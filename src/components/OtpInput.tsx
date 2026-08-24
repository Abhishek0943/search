type OTPInputProps = {
  length: number;
  value: Array<string>;
  disabled: boolean;
  onChange(value: Array<string>): void;
  mainColor: string
  secondaryColor: string
};
type Nullable<T> = T | null;
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import React, { useContext, useRef } from 'react';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import { CustomTextInput } from '.';
export const OtpInput: React.FunctionComponent<OTPInputProps> = ({
  length,
  disabled,
  value,
  onChange,
  mainColor,
  secondaryColor
}) => {
  const inputRefs = useRef<Array<Nullable<TextInput>>>([]);
  const { colors } = useContext(ThemeContext)

  const onChangeValue = (text: string, index: number) => {
    const newValue = value.map((item, valueIndex) => {
      if (valueIndex === index) {
        return text;
      }

      return item;
    });

    onChange(newValue);
  };
  const handleChange = (text: string, index: number) => {
    onChangeValue(text, index);

    if (text.length !== 0) {
      return inputRefs?.current[index + 1]?.focus();
    }

    return inputRefs?.current[index - 1]?.focus();
  };

  const handleBackspace = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    const { nativeEvent } = event;

    if (nativeEvent.key === 'Backspace') {
      handleChange('', index);
    }
  };
  return (
    <View style={styles.container}>
      {[...Array(length)].map((_, index) => (
        <CustomTextInput
          key={index}
          style={[
            styles.input,
            { borderWidth: 2, color: secondaryColor, borderColor: value[index] != "" ? mainColor : colors.gray, backgroundColor: value[index] != "" ? colors.white : colors.compPrimaryBg },
          ]}
          ref={ref => {
            if (ref && !inputRefs.current.includes(ref)) {
              inputRefs.current = [...inputRefs.current, ref];
            }
          }}
          maxLength={1}
          contextMenuHidden
          selectTextOnFocus
          placeholder='-'
          placeholderTextColor={colors.gray}
          editable={!disabled}
          keyboardType="decimal-pad"
          testID={`OTPInput-${index}`}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={event => handleBackspace(event, index)}
        />
      ))}
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: responsiveHeight(3),
    gap: responsiveWidth(2),
  },
  input: {
    fontSize: responsiveFontSize(2.4),
    textAlign: 'center',
    fontWeight: "800",
    height: responsiveHeight(7),
    flex: 1,
    borderRadius: 18,
    color: "black"
  },
});
