import React, { ReactNode, useContext, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeProvider';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { routes } from '../../constants/values';
import Icon from '../../utils/Icon';
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imagePath from '../../assets/imagePath';

export const SOCIAL_PROVIDERS: {
  name: string;
  logo: ImageSourcePropType;
}[] = [
    { name: 'Google', logo: imagePath.googleLogo },
  ];

export const SocialButton = React.memo(
  ({ logo, children, height = "auto" }: { logo: ImageSourcePropType; children?: ReactNode, height?: number | "auto" }) => {
    const { colors } = useContext(ThemeContext);
    return (
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.lightBlue, maxHeight: height }]}>
        <Image source={logo} style={styles.socialLogo} />
        {
          children &&
          <Text style={[styles.socialText, { color: colors.textPrimary }]}>
            {children}
          </Text>
        }
      </TouchableOpacity>
    );
  }
);

export const OrSeparator = React.memo(({ text = "OR" }: { text?: string }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={styles.orContainer}>
      <View style={[styles.line, { borderTopColor: colors.gray }]} />
      <Text style={[styles.orText, { color: colors.textSecondary, borderWidth: 1, borderColor: "white" }]}>{text}</Text>
      <View style={[styles.line, { borderTopColor: colors.gray }]} />
    </View>
  );
});

const WelcomeTwo = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const [role, setRole] = useState<"seeker" | "recruiter">()
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary, marginTop: responsiveScreenHeight(6) }]}>
        What is your Role?
      </Text>
      <Text style={[{
        textAlign: 'left',
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '600',
        textTransform: 'capitalize', color: colors.textSecondary
      }]}>
        select your role to personalize your journey and unlock more features.
      </Text>
      <View style={{ marginTop: responsiveScreenHeight(2), backgroundColor:  colors.surfaces, borderRadius: 15, paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(4), borderColor:role === "seeker"?colors.primary:colors.surfaces, borderWidth:2  }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.title, { marginTop: 0, color: colors.textPrimary, fontSize: responsiveScreenFontSize(2), }]}>
            Job seeker
          </Text>
          {
            role === "seeker" ?
              <Icon icon={{ type: "Ionicons", name: "radio-button-on" }} style={{ color: colors.primary, fontSize: responsiveScreenFontSize(2.4) }} /> : <Icon onPress={() => {
                AsyncStorage.setItem("role", "seeker")
                setRole("seeker")
              }} icon={{ type: "Ionicons", name: "radio-button-off" }} style={{ color: colors.mediumGray, fontSize: responsiveScreenFontSize(2.4) }} />
          }
        </View>
        <Text style={[{
          textAlign: 'left',
          fontSize: responsiveScreenFontSize(1.7),
          fontWeight: '600',
          textTransform: 'capitalize', color: colors.textSecondary
        }]}>
          Join as a Job Seeker to explore opportunities, connect with employers, and build your successful career.
        </Text>
      </View>
      <View style={{ marginTop: responsiveScreenHeight(2),borderColor:role === "recruiter"?colors.primary:colors.surfaces, borderWidth:2  , backgroundColor: colors.surfaces, borderRadius: 15, paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(4) }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.title, { marginTop: 0, color: colors.textPrimary, fontSize: responsiveScreenFontSize(2), }]}>
            Recruiter
          </Text>
          {
            role === "recruiter" ?
              <Icon icon={{ type: "Ionicons", name: "radio-button-on" }} style={{ color: colors.primary, fontSize: responsiveScreenFontSize(2.4) }} />
              :
              <Icon onPress={() => {
                AsyncStorage.setItem("role", "recruiter")

                setRole("recruiter")
              }} icon={{ type: "Ionicons", name: "radio-button-off" }} style={{ color: colors.mediumGray, fontSize: responsiveScreenFontSize(2.4) }} />
          }</View>
        <Text style={[{
          textAlign: 'left',
          fontSize: responsiveScreenFontSize(1.7),
          fontWeight: '600',
          textTransform: 'capitalize', color: colors.textSecondary
        }]}>
          Join as a Recruiter to discover top talent, streamline hiring, and grow your organization effortlessly.
        </Text>
      </View>
      <View style={{ flex: 1 }}></View>
      <Button label='Next' isActive={role ? true : false} onPress={() => { role ==="seeker"?navigation.navigate(routes.HOME): role&& navigation.navigate(routes.LOGIN) }} style={{ marginBottom: responsiveScreenHeight(9), }} />
    </View>
  );
};

export default WelcomeTwo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: responsiveScreenWidth(6),
  },

  headerImage: {
    width: '100%',
    height: responsiveScreenHeight(30),
    backgroundColor: 'red', marginTop: responsiveScreenHeight(2)
  },

  title: {
    marginTop: responsiveScreenHeight(5),
    textAlign: 'left',
    fontSize: responsiveScreenFontSize(3.4),
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveScreenWidth(3),
    paddingVertical: responsiveScreenHeight(1.2),
    paddingHorizontal: responsiveScreenWidth(6),
    borderRadius: 10,
    marginTop: responsiveScreenHeight(2),
  },
  socialLogo: {
    width: responsiveScreenWidth(7),
    height: responsiveScreenWidth(7),
  },
  socialText: {
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '700',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveScreenWidth(3),
    marginVertical: responsiveScreenHeight(4),
  },
  line: {
    flex: 1,
    borderTopWidth: 0.5,
    height: 0,
  },
  orText: {
    fontSize: responsiveScreenFontSize(1.6),
    textTransform: "capitalize",
  },
  passwordButton: {
    marginVertical: 0, // reset any default
    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: responsiveScreenHeight(2),
    paddingHorizontal: responsiveScreenWidth(6),
    borderRadius: 100,

  },
  passwordText: {
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '500',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: responsiveScreenHeight(2),
  },
  signupPrompt: {
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '500',
  },
  signupLink: {
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: '700',
  },
});
