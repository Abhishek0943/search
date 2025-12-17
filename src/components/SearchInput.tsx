// components/SearchInput.tsx

import React, { useContext } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import {
  responsiveScreenWidth,
  responsiveScreenHeight,
  responsiveScreenFontSize,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Icon from '../utils/Icon';

interface SearchInputProps {
  /** current text value */
  value: string;
  /** called with the new text on change */
  onChange: (text: string) => void;
  /** placeholder text */
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <Icon
       icon={{type:"Feather",name:"search"}} 
        size={responsiveScreenFontSize(3)}
        style={{ color:value?colors.textPrimary: colors.textDisabled }}
      />

      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        onChangeText={onChange}
      />
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: responsiveScreenWidth(2),
    paddingVertical: responsiveScreenHeight(0.8),
    borderRadius: 15,
  },
  input: {
    fontSize: responsiveScreenFontSize(2),
    width: responsiveScreenWidth(86),
    marginLeft: responsiveScreenWidth(2),
    fontWeight:"500"
  },
});
