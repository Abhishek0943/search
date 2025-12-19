import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../constants/values'
import { useAppDispatch, useAppSelector } from '../../store'
import { DeleteEducation, DeleteExperience, GetEducation } from '../../reducer/jobsReducer'
import { styles } from './CV'
import { Header } from '../Company/Company'
const Education = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useAppDispatch()
  const [cvs, setCvs] = useState([])
  const [active, setActive] = useState(0)

  useFocusEffect(useCallback(
    () => {
      dispatch(GetEducation()).unwrap().then(res => {
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
     <Header title="Education" />
        <View>

        </View>
        {
          cvs?.length > 0 ? <>
            <FlatList scrollEnabled={false} data={cvs} style={{ flex: 1, width: responsiveScreenWidth(90) }} renderItem={({ item, index }) => {
              return (
                <>
                  <CvCard refresh={() => dispatch(GetEducation()).unwrap().then(res => {
                    if (res.success)
                      setCvs(res.data)
                  })} setActive={setActive} active={active} id={item.id} item={item} />
                </>
              )
            }} />
          </> :
            <Image source={imagePath.workExperience} style={{ resizeMode: "contain", width: "100%" }} />
        }
        <Pressable
          onPress={() => navigation.navigate(routes.EDUCATIONFORM)}
          style={{
            width: '90%',
            justifyContent: 'center',
            marginTop: responsiveScreenHeight(2),
            borderRadius: 6,
            gap: responsiveScreenWidth(1),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingHorizontal: responsiveScreenWidth(3),
            paddingVertical: responsiveScreenHeight(1.5),
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: responsiveScreenFontSize(1.8),
            }}
          >
          Add New Education
          </Text>
        </Pressable>
      </ScrollView>
    </NavigationBar>
  )
}

export default Education
function CvCard({
  item,
  setActive, active, id, refresh

}) {
  const { colors } = useContext(ThemeContext);
  const dispatch = useAppDispatch()

  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => setActive(0)}>
      <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.5), fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
            {item.degree_title}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={() => { navigation.navigate(routes.EDUCATIONFORM, { ...item }) }} hitSlop={10} style={styles.iconBtn}>
              <Image source={imagePath.edit} />
            </Pressable>
            <Pressable onPress={() => setActive(id)} hitSlop={10} style={styles.iconBtn}>
              <Image source={imagePath.threeDot} />
              {
                id === active &&
                <View
                  style={[
                    {
                      backgroundColor: colors.white,
                      position: "absolute",
                      width: responsiveScreenWidth(30),
                      right: 0,
                      top: "90%",
                      borderRadius: 10,
                      gap: responsiveScreenHeight(1),
                      paddingHorizontal: responsiveScreenWidth(3),
                      paddingVertical: responsiveScreenHeight(1)
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {

                      dispatch(DeleteEducation({ id: id, })).unwrap().then((res) => {
                        refresh()
                      })
                    }}
                    style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}
                  >
                    <Image source={imagePath.delete} style={{}} />
                    <Text style={[{ color: colors.textPrimary }]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              }

            </Pressable>
          </View>
        </View>
        <Text style={{ marginTop: responsiveScreenHeight(1) }}>{item.date_completion} - {item.country.country} - {item.state.state}</Text>

        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(1) }]}>
          <Image source={imagePath.education} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.majorSubjects.map((e)=>`${e.name},`)}</Text>
        </View>
        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2),  marginTop: responsiveScreenHeight(.8)}]}>
          <Image source={imagePath.location2} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.country.country} - {item.state.state}</Text>
        </View>
        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2),  marginTop: responsiveScreenHeight(.8) }]}>
          <Image source={imagePath.company3} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{item.institution}</Text>
        </View>
   

      </View>
    </TouchableWithoutFeedback>
  );
}