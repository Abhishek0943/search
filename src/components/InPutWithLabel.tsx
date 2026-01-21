import React, { useContext, useState } from 'react';
import { KeyboardType, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Icon from '../utils/Icon';
interface TextInputCompProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureText?: boolean;
  label: string;
  isRequired?: boolean;
  rightIcon?: (color: string) => React.ReactNode;
  options?: string[];
  type?: "text" | "radio" | "date" | "number";
  keyboardType?: KeyboardType
  inputAlternate?: () => React.ReactNode;
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
  max
}) => {
  const { colors } = useContext(ThemeContext);
  const [activeColor, setActiveColor] = useState(colors.secondary);
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const elem = () => {
    switch (type) {
      case "text":
        return (
          <>
            <View style={[styles.inputContainer, { borderColor: colors.mediumGray }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                secureTextEntry={secureText}
                keyboardType={keyboardType}
                onFocus={() => setActiveColor(colors.primary)}
                onBlur={() => setActiveColor(colors.secondary)}
              />
              {rightIcon(activeColor)}
            </View>
          </>
        )
      case "radio":
        return (
          <>
            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(3), marginTop: responsiveScreenHeight(1.3), alignItems: "center" }}>
              {
                options?.map((e) => {
                  return (
                    <Pressable onPress={() => onChangeText && onChangeText(e)} style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
                      <Icon style={{ fontSize: responsiveScreenFontSize(2.4), color: value === e ? colors.primary : colors.textPrimary }} icon={{ type: 'MaterialIcons', name: value === e ? "radio-button-checked" : "radio-button-off" }} />
                      <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }}>{e}</Text>
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
            <View style={[styles.inputContainer, { borderBottomColor: activeColor }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                maxLength={max|| 10}
                  

                placeholderTextColor={colors.placeholder}
                keyboardType='decimal-pad'
                secureTextEntry={secureText}
                onFocus={() => setActiveColor(colors.primary)}
                onBlur={() => setActiveColor(colors.secondary)}
              />
              {rightIcon(activeColor)}
            </View>
          </>
        )
    }
  }
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[styles.label, { color: colors.textPrimary, marginBottom: responsiveScreenHeight(.5) }]}>
          {label}
        </Text>
        {inputAlternate&& inputAlternate()}
      </View>
      {elem()}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '600',
  },
  requiredAsterisk: {
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom:responsiveScreenHeight(2),
    height: responsiveScreenHeight(6),
    paddingHorizontal: responsiveScreenWidth(4),
  },
  input: {
    flex: 1,
    fontSize: responsiveScreenFontSize(2.2),
    fontWeight: '400',
    paddingVertical: 0,
  },
});

export default InputWithLabel;


