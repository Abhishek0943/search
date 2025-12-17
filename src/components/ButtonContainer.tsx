import React from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, ViewStyle } from "react-native";
import { fonts } from "../constants/values";
// import TextContainer from "./TextContainer";

interface CustomButtonProps extends PressableProps {
  label: string;
  style?: ViewStyle;
  textStyle?: object;
  isLoading?: boolean;
}

const ButtonContainer: React.FC<CustomButtonProps> = ({
  label,
  isLoading,
  style,
  textStyle,
  ...props
}) => {


  return (
    <Pressable style={[styles.btnStyle, style]} {...props}>
      {isLoading ? (
        <ActivityIndicator 
        color={'#fff'} 
        />
      ) : (
     
        <Text style={{
          // color: isDarkMode ? theme.colors.black : theme.colors.white,
          color: '#fff',
          fontFamily:fonts.poppinsM,
          ...textStyle,
        }}  >{label}</Text>
      )}
    </Pressable>
  );
};


const styles = StyleSheet.create({
  btnStyle: {
    height: 48,
    backgroundColor: '#000',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,

  }
});

export default React.memo(ButtonContainer);
