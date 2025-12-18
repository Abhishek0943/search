import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { useNavigation } from '@react-navigation/native'

const AddJob = () => {
      const { colors } = useContext(ThemeContext);
      const navigation = useNavigation();
    
  return (
     <NavigationBar navigationBar={false}>


      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: responsiveScreenWidth(96),
          alignSelf: 'center',
          alignItems: 'center',
          paddingBottom: responsiveScreenHeight(3),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: "relative",
            alignItems: 'center',
            borderBottomColor: colors.textDisabled,
            borderBottomWidth: 0.5,
            paddingBottom: responsiveScreenHeight(2),
            width: responsiveScreenWidth(100),
            paddingHorizontal: responsiveScreenWidth(5)
          }}
        >
          {/* <Pressable onPress={() => navigation.goBack()}>
            <Image source={imagePath.backIcon} style={{ resizeMode: 'contain' }} />
          </Pressable> */}
          <Text
            style={{
              flex: 1,
              textAlign: 'left',
              fontSize: responsiveScreenFontSize(2),
              color: colors.textPrimary,
              fontWeight: '600',
            }}
          >
            Post a job
          </Text>
          {/* Invisible icon to balance layout */}
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>
        </ScrollView>
    </NavigationBar>
  )
}

export default AddJob

const styles = StyleSheet.create({})