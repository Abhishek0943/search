import { StatusBarStyle } from "react-native";
const commonColors = {
  transparent: "rgba(0, 0 , 0, .5)",
  white: "#FFF",
  red: "#ff4747ff",
  mediumGray: "#BEBEBE",
  gray: "#DEDEDE",
  darkGray: "#494949",
  darkGrayNatural: "#a9a9a9",
  hardGray: "#222222",
  lightBlue: "#EEF4FF",
  black: "black",
  lightGrayNatural: "#F5F5F5",
  lightGray: "#ECECEC",
  mediumGrayNatural: "#BEBEBE",
}
export const lightColors: ColorPalette = {
  // Brand colors
  primary: "#1A5FA8",
  primary2: "#455A75",
  onPrimary: "#0057E0",
  secondary: "#EDF1F7",
  // Backgrounds & surfaces
  background: '#FFF',
  backgroundSecondary: '#f5f5f5',
  surfaces: '#D4DFEC',
  // Text
  textPrimary: '#0E1F3D',
  textSecondary: '#7B8CA3',
  textDisabled: "#d0cfce",
  placeholder: "#A7A7A7",



  statusBar: '#2b2323ff',
  statusBarStyle: 'dark-content',
  ...commonColors
};

export const darkColors: ColorPalette = {
  primary: "#1A5FA8",
  primary2: "#455A75",

  onPrimary: "#0057E0",
  background: '#000',
  textPrimary: '#0E1F3D',
  textSecondary: '#7B8CA3',
  surfaces: '#D4DFEC',
  backgroundSecondary: "#080808",
  statusBar: '#000',
  statusBarStyle: 'light-content',
  secondary: "#35383f",
  textDisabled: "#cdcdcdff",
  placeholder: "",
  ...commonColors
};

export interface ColorPalette {
  background: string;
  primary: string;
  primary2: string;
  onPrimary: string;
  hardGray: string;
  darkGray: string;
  darkGrayNatural: string;
  surfaces: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  lightBlue: string;
  mediumGray: string;
  gray: string;
  placeholder: string;
  statusBar: string;
  backgroundSecondary: string;
  statusBarStyle: StatusBarStyle;
  white: string;
  red: string;
  transparent: string;
  black: string;
  lightGrayNatural: string;
  mediumGrayNatural: string,
  lightGray: string,


}

// export interface ColorPalette {
//   // Brand colors
//   primary: string;
//   onPrimary: string;
//   secondary: string;
//   onSecondary: string;

//   // Backgrounds & surfaces
//   background: string;
//   surface: string;
//   onBackground: string;
//   onSurface: string;

//   // Text
//   textPrimary: string;
//   textSecondary: string;
//   textDisabled: string;
//   placeholder: string;

//   // Dividers, overlays, etc.
//   divider: string;
//   backdrop: string;
//   notification: string;

//   // Status bar
//   statusBar: string;
//   statusBarStyle: StatusBarStyle;
// }