import React, { useContext, useState } from 'react';
import { KeyboardType, Pressable, StyleSheet, TextInput, View, ViewStyle, } from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Icon from '../utils/Icon';
import { CustomTextInput } from '.';
import Text from './Text';
interface TextInputCompProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureText?: boolean;
  label: string;
  isRequired?: boolean | (() => React.ReactNode);
  rightIcon?: () => React.ReactNode;
  sideOption?: () => React.ReactNode;
  options?: string[];
  type?: "text" | "radio" | "date" | "number";
  keyboardType?: KeyboardType
  inputAlternate?: () => React.ReactNode;
  max?: number
  mainColor: string
  secondaryColor: string
  inputContainerStyle?: ViewStyle
}
const InputWithLabel: React.FC<TextInputCompProps> = ({
  value,
  onChangeText,
  placeholder = '',
  label,
  secureText = false,
  rightIcon = () => null,
  options,
  type = "text",
  keyboardType = "default",
  inputAlternate,
  sideOption = () => null,
  max,
  mainColor,
  secondaryColor,
  isRequired,
  inputContainerStyle
}) => {
  const { colors } = useContext(ThemeContext);
  const [activeColor, setActiveColor] = useState(colors.surfaces);
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const elem = () => {
    switch (type) {
      case "text":
        return (
          <>
            <View style={[styles.inputContainer, { marginBottom: responsiveHeight(2), borderColor: activeColor || colors.surfaces }, inputContainerStyle]}>
              <CustomTextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                secureTextEntry={secureText}
                keyboardType={keyboardType}
                onFocus={() => setActiveColor(mainColor)}
                onBlur={() => setActiveColor(colors.surfaces)}
              />
              {rightIcon()}
            </View>
          </>
        )
      case "radio":
        return (
          <>
            <View style={{ flexDirection: "row", gap: responsiveWidth(3), marginTop: responsiveHeight(1.3), alignItems: "center" }}>
              {
                options?.map((e) => {
                  return (
                    <Pressable onPress={() => onChangeText && onChangeText(e)} style={{ flexDirection: "row", alignItems: "center", gap: responsiveWidth(1) }}>
                      <Icon style={{ fontSize: responsiveFontSize(2.4), color: value === e ? colors.primary : colors.textPrimary }} icon={{ type: 'MaterialIcons', name: value === e ? "radio-button-checked" : "radio-button-off" }} />
                      <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: "400" }}>{e}</Text>
                    </Pressable>
                  )
                })
              }
            </View>
          </>
        )
      case "date":

        return (
          <>

          </>
        )
      case "number":
        return (
          <>
            <View style={[styles.inputContainer, { marginBottom: responsiveHeight(2), borderColor: colors.mediumGray }]}>
              <CustomTextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                maxLength={max || 10}


                placeholderTextColor={colors.placeholder}
                keyboardType='decimal-pad'
                secureTextEntry={secureText}
                onFocus={() => setActiveColor(colors.primary)}
                onBlur={() => setActiveColor(colors.secondary)}
              />
              {rightIcon()}
            </View>
          </>
        )
    }
  }
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: responsiveWidth(2) }}>
            <Text style={[styles.label, { color: secondaryColor || colors.textPrimary, marginBottom: responsiveHeight(.5) }]}>
              {label}
            </Text>
            {typeof (isRequired) == "function" ? isRequired() : isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
          </View>
          {sideOption()}
        </View>
        {inputAlternate && inputAlternate()}
      </View>
      {elem()}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    marginTop: responsiveHeight(1)
  },
  requiredAsterisk: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 15,

    height: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
  },
  input: {
    flex: 1,
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
    paddingVertical: 0,
  },
});

export default InputWithLabel;


