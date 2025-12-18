import { View, Text, ScrollView, TouchableHighlight, Image } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { routes } from '../../../constants/values'
import { ThemeContext } from '../../../context/ThemeProvider'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../../../store'
import { GetCandidates } from '../../../reducer/recruiterReducer'
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
            setCvs(res.data)
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
        <View>
          
        </View>
      </ScrollView>
    </NavigationBar>
  )
}

export default Candidate