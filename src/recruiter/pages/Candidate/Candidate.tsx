import { View,  ScrollView, TouchableHighlight, Image, FlatList, Pressable } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { ThemeContext } from '../../../context/ThemeProvider'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../../../store'
import { GetCandidates } from '../../../reducer/recruiterReducer'
import imagePath from '../../../assets/imagePath'
import Text from '../../../components/Text'
const data = [
  ""
]
const Candidate = () => {
  const { colors } = useContext(ThemeContext);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [cvs, setCvs] = useState([])
  const dispatch = useAppDispatch()
  useFocusEffect(useCallback(
    () => {
      dispatch(GetCandidates()).unwrap().then(res => {
        console.log(res)
        if (res.success !== false) {
          setCvs(res.data.users)
        }
      })
    },
    [],
  )
  )
  return (
    <NavigationBar name={routes.ACTIVECANDIDATE}>
      <ScrollView style={{ flex: 1, }} contentContainerStyle={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'relative',
            alignItems: 'center',
            borderBottomColor: colors.textDisabled,
            borderBottomWidth: 0.5,
            paddingBottom: responsiveScreenHeight(2),
            width: responsiveScreenWidth(100),
            paddingHorizontal: responsiveScreenWidth(5),
          }}
        >
          <Text
            style={{
              flex: 1,
              textAlign: 'left',
              fontSize: responsiveScreenFontSize(2),
              color: colors.textPrimary,
              fontWeight: '600',
            }}
          >
            Candidates
          </Text>

        </View>
        <FlatList
          data={cvs}
          numColumns={2}
          style={{ paddingHorizontal: responsiveScreenWidth(5), marginBottom: responsiveScreenHeight(2), paddingVertical: responsiveScreenHeight(2) }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 10, width:responsiveScreenWidth(43), backgroundColor: colors.lightGrayNatural,  paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.5), borderRadius: 10, position: "relative" }}>
              <View style={{ borderRadius: 100,borderWidth:1, borderColor:colors.primary,padding:2,backgroundColor:colors.white, overflow: "hidden", height: responsiveScreenHeight(8), aspectRatio: 1, marginHorizontal: "auto" }}>
                <Image source={{ uri: item.image }} style={{ borderRadius: 100, height: "100%", backgroundColor: "white", }} />
              </View>
              <Text style={{textTransform: "capitalize", textAlign: "center", marginTop: responsiveScreenHeight(.5), fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ textAlign: "center", marginTop: responsiveScreenHeight(.5), color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>Health Care Provider</Text>
              <Text style={{ textAlign: "center", marginTop: responsiveScreenHeight(.5), color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>Experienced Professional</Text>
              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: responsiveScreenWidth(.5), marginTop: responsiveScreenHeight(.5) }}>
                <Image source={imagePath.location} style={{ transform: [{ scale: 0.8 }] }} />
                <Text style={{ textAlign: "center",  color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>Melbourne</Text>
              </View>
              <Pressable
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: responsiveScreenHeight(2),
                  borderRadius: 12,
                  gap: responsiveScreenWidth(1),
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  paddingVertical: responsiveScreenHeight(1),
                }}
              >
                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                  View Profile
                </Text>
              </Pressable>
            </View>
          )}
        />

      </ScrollView>
    </NavigationBar>
  )
}

export default Candidate