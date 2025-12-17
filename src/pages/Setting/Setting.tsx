import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import React, { useContext } from 'react';
import { useAppDispatch } from '../../store';
import { Text, View } from 'react-native';
import { ThemeContext } from '../../context/ThemeProvider';
import { PageHeaderOne } from '../../components';
import SettingOption from '../../components/SettingOption';
import { routes } from '../../constants/values';
import { responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from '../../utils/Icon';


const Setting = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useContext(ThemeContext)


  return (

    <>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PageHeaderOne heading={"Settings"} />
        <View style={{ gap: responsiveScreenHeight(1), paddingVertical: responsiveScreenHeight(1.5) }}>
          <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'user' }} size={responsiveScreenFontSize(2.8)} style={{ color: colors.textSecondary }} />}
            label="Your account"
            height={responsiveScreenWidth(12)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            discription='See information about your account, download an acrhive of your data or learn about your account deactivation options.'
          />

          <View style={{ borderTopColor: colors.surfaces, borderTopWidth: .5 }}></View>
          <Text style={{fontSize:responsiveScreenFontSize(1.4), color:colors.textSecondary, marginLeft:responsiveScreenWidth(3), fontWeight:"500"}}>Your account activity</Text>
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'bookmark' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Bookmark"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
          <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "AntDesign", name: 'history' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Archive"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
            <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Lucide", name: 'square-activity' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Your activity"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Lucide", name: 'bell' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Notification"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />

          <View style={{ borderTopColor: colors.surfaces, borderTopWidth: .5 }}></View>
          <Text style={{fontSize:responsiveScreenFontSize(1.4), color:colors.textSecondary, marginLeft:responsiveScreenWidth(3), fontWeight:"500"}}>Security and Privacy</Text>
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Lucide", name: 'lock' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Account privacy"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Entypo", name: 'block' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Blocked"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
          <View style={{ borderTopColor: colors.surfaces, borderTopWidth: .5 }}></View>

          <Text style={{fontSize:responsiveScreenFontSize(1.4), color:colors.textSecondary, marginLeft:responsiveScreenWidth(3), fontWeight:"500"}}>About us and support</Text>
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Ionicons", name: 'chatbox-outline' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Feedback and support"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Octicons", name: 'unverified' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="FAQ"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
          <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Lucide", name: 'lock' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Privacy policy"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Lucide", name: 'newspaper' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Term and conditions"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
           <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'info' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="About Loopin"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
            <SettingOption
            icon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'share-2' }} size={responsiveScreenFontSize(2.4)} style={{alignSelf:"flex-end", color: colors.textSecondary }} />}
            label="Share app"
            height={responsiveScreenWidth(8)}
            gap={responsiveScreenWidth(2)}
            onPress={() => navigation.navigate(routes.NOTIFICATIONSETTING)}
            rightIcon={() => <Icon onPress={() => navigation.navigate(routes.SETTING)} icon={{ type: "Feather", name: 'chevron-right' }} size={responsiveScreenFontSize(2.4)} style={{ marginRight: responsiveScreenWidth(2), color: colors.textSecondary }} />}
            
          />
        </View>

      </View>
    </>
  );
};

export default Setting;
