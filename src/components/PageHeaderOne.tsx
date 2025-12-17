import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native'
import React, { ReactNode, useContext } from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import Icon, { IconProps } from '../utils/Icon';
import { ThemeContext } from '../context/ThemeProvider';
interface PageHeaderOneProps {
  heading?: String;
  rightIcon?:  () => React.ReactNode,
  // leftIcon?: React.FC<IconProps>;
  // rightClick?: () => void
  // leftClick?: () => void
  onPress?: () => void
  // isRightIcon?: boolean
  style?: ViewStyle

}
const PageHeaderOne: React.FC<PageHeaderOneProps> = ({ heading, onPress, style, rightIcon }) => {
  const { colors } = useContext(ThemeContext)

  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <View style={{ ...styles.container, ...style, borderBottomColor: colors.surfaces, elevation: 10, backgroundColor: colors.background, borderBottomWidth: .5 }}>
      <Icon onPress={!!onPress ? onPress : () => navigation.goBack()} icon={{ type: "Feather", name: 'arrow-left' }} size={responsiveScreenFontSize(3.3)} style={{ flex: 1, color: colors.textPrimary }} />
      {
        heading &&
        <Text style={[styles.heading, { color: colors.textPrimary }]}>{heading}</Text>
      }

      <View style={{ flex: 1 }} >
        {rightIcon && rightIcon()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: responsiveScreenWidth(100),
    paddingVertical: responsiveScreenHeight(1.5),
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

  },
  leftIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: responsiveScreenWidth(8),
    aspectRatio: 1,
    borderRadius: 100
  },
  leftIcon: {
    height: "80%",
    width: "80%",
  },
  heading: {
    fontSize: responsiveScreenFontSize(2),
    textAlign: "center",
    fontWeight: "400",
    flex: 1
  },
  rightIconWrapper: {
    height: responsiveScreenWidth(5),
    aspectRatio: 1,
  },
  rightIcon: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
});

export default PageHeaderOne