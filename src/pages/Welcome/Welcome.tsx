import React, { useCallback, useContext } from 'react';
import {
  View,
  BackHandler,
  Image,
  Pressable,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useNavigation, NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import Text from '../../components/Text';
import { ThemeContext } from '../../context/ThemeProvider';
import { routes } from '../../constants/values';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
const Welcome = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { colors } = useContext(ThemeContext)
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      )
      return () => backHandler.remove()
    }, [])
  )

  const insets = useSafeAreaInsets();
  return (
    <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), flex: 1, }}>
      <Image style={{ height: "100%", width: "100%", }} source={require("./Wellcome.png")} />
      <View style={{ width: responsiveWidth(100), gap: responsiveHeight(2), maxHeight: responsiveHeight(35), position: "absolute", bottom: insets.bottom }}>
        <Pressable style={{ aspectRatio: 4.375, margin: "auto", width: responsiveWidth(90), }}
        >
          <Image style={{ height: "100%", width: "100%", }} source={require("./ExploreOption.png")} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate(routes.WELCOME2)} style={{ aspectRatio: 4.375, margin: "auto", width: responsiveWidth(90), }} >
          <Image style={{ height: "100%", width: "100%", }} source={require("./LoginOption.png")} />
        </Pressable>
        <Text style={{ textAlign: "center", fontSize: responsiveFontSize(1.6), marginBottom: responsiveHeight(2), marginTop: responsiveHeight(1.5), maxWidth: responsiveWidth(60), margin: "auto", color: colors.textSecondary }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>

  );
};
export default Welcome;
