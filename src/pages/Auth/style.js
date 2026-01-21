import {StyleSheet} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import {fonts, lightColors} from '../../constants/values';
import { scale } from '../../styles/scaling';
const colors = lightColors;

export const AuthStyle = StyleSheet.create({
  container: {
    backgroundColor: colors.bgMain,
    flex: 1,
    paddingHorizontal: responsiveScreenWidth(3),
  },
  heading: {
    fontSize: scale(32),
    fontFamily: fonts.poppinsB,
    textAlign: 'left',  
    color: colors.activeColor,
    width: responsiveScreenWidth(50), 
    marginTop: responsiveScreenHeight(0.4),
  },
  subHeading: {
    fontSize: responsiveScreenFontSize(2),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
    width: responsiveScreenWidth(80),
    marginTop: responsiveScreenHeight(0.4),
  },

  label: {
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: fonts.poppinsM,
    color: colors.gray,
    marginTop: responsiveScreenHeight(1),
  },
  required: {
    fontSize: responsiveScreenFontSize(1.6),
    fontFamily: fonts.poppinsM,
    color: colors.red,
    marginTop: responsiveScreenHeight(1),
  },
  input: {
    borderWidth: 1,
    color: colors.activeColor,
    borderRadius: 10,
    fontSize: responsiveScreenFontSize(1.8),
    paddingHorizontal: responsiveScreenWidth(3),
    paddingVertical: responsiveScreenHeight(1.2),
  },
  phoneContainer: {
    borderWidth: 1,
    borderColor: colors.activeColor,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    borderRightWidth: 1,
    borderRightColor: 'black',
    color: colors.activeColor,
    fontSize: responsiveScreenFontSize(1.8),
    paddingHorizontal: responsiveScreenWidth(2.3),
  },
  countryCodeText: {
    color: colors.activeColor,
    fontSize: responsiveScreenFontSize(1.8),
  },
  phoneInput: {
    flex: 1,
    color: colors.activeColor,
    fontSize: responsiveScreenFontSize(1.8),
    paddingHorizontal: responsiveScreenWidth(3),
    paddingVertical:responsiveScreenHeight(1.2)
  },
  dropdown: {
    top: '80%',
    position: 'absolute',
    borderWidth: 1,
    maxHeight: responsiveScreenHeight(20),
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    zIndex: 100,
  },

  dropdownText: {
    borderRightColor: 'black',
    color: colors.activeColor,
    fontSize: responsiveScreenFontSize(1.8),
    paddingHorizontal: responsiveScreenWidth(2.3),
    textAlign: 'center',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveScreenWidth(2),
  },
  signUpButton: {
    marginTop: responsiveScreenHeight(1),
    backgroundColor: colors.activeColor,
    borderRadius: 7,
    paddingHorizontal: responsiveScreenWidth(3),
    paddingVertical: responsiveScreenHeight(0.5),
    width: 'auto',
  },
  signUpText: {
    fontSize: responsiveScreenFontSize(2),
    fontFamily: fonts.poppinsM,
    textAlign: 'center',
    color: colors.btnText,
    width: 'auto',
    marginTop: responsiveScreenHeight(0.4),
  },
  checkBoxLabel: {
    fontSize: responsiveScreenFontSize(1.6),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
    marginTop: responsiveScreenHeight(0.2),
  },
  orText: {
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
    marginVertical: responsiveScreenHeight(1.5),
    textAlign: 'center',
  },
  socialContainer: {flexDirection: 'row', gap: responsiveScreenWidth(7)},
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveScreenWidth(2),
    padding: 0,
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  signInText: {
    paddingTop: responsiveScreenHeight(0.2),
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: fonts.poppinsM,
    color: colors.secondaryText,
    marginVertical: responsiveScreenHeight(1.5),
    textAlign: 'center',
  },
  checkTick: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    transform: [{rotateZ: '-45deg'}],
    borderColor: colors.bgMain,
    aspectRatio: 2 / 1,
    width: '90%',
    position: 'absolute',
    bottom: 5,
  },
  checkBox: {
    width: responsiveScreenWidth(4),
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
