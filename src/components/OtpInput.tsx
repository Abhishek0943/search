type OTPInputProps = {
  length: number;
  value: Array<string>;
  disabled: boolean;
  onChange(value: Array<string>): void;
};
type Nullable<T> = T | null;
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import React, {useContext, useRef} from 'react';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
export const OtpInput: React.FunctionComponent<OTPInputProps> = ({
  length,
  disabled,
  value,
  onChange,
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
    const {nativeEvent} = event;

    if (nativeEvent.key === 'Backspace') {
      handleChange('', index);
    }
  };
  return (
    <View style={styles.container}>
      {[...Array(length)].map((_, index) => (
        <TextInput
          key={index} 
          style={[
            styles.input,
            {borderWidth: 1, borderColor: colors.secondary, backgroundColor:colors.white},
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
    marginTop: responsiveScreenHeight(1),
    gap: responsiveScreenWidth(4),
  },
  input: {
    fontSize: responsiveScreenFontSize(2.2),
    textAlign: 'center',
    fontWeight:"500",
    height: responsiveScreenHeight(7),
    width: responsiveScreenWidth(12),
    borderRadius: 6,
    color:"black"
  },
});
