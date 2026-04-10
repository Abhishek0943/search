import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
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
import { useAlert } from '../../context/AlertContext'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'
import Text from '../../components/Text'
const Education = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useAppDispatch()
  const [cvs, setCvs] = useState([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)
  useFocusEffect(useCallback(
    () => {
      dispatch(GetEducation()).unwrap().then(res => {
        setLoading(false)
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
          loading ? <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View> : <>

            {
              cvs?.length > 0 ? <>
                <FlatList
                  scrollEnabled={false} data={cvs} style={{ flex: 1, width: responsiveScreenWidth(90) }} renderItem={({ item, index }) => {
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
          </>
        }
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
  const { showConfirm } = useAlert();

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => ""}>
      <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.2), fontWeight: "700", color: colors.textPrimary }]} numberOfLines={1}>
            {item.degree_title}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={() => { navigation.navigate(routes.EDUCATIONFORM, { ...item }) }} hitSlop={10} style={styles.iconBtn}>
              <Image source={imagePath.edit} />
            </Pressable>
            <Pressable onPress={async () => {
              const ok = await showConfirm({
                title: "Delete Education?",
                message: "Are you sure you want to delete this record?",
                okText: "Delete",
                cancelText: "Cancel",
              });
              if (ok) {
                dispatch(DeleteEducation({ id: id, })).unwrap().then((res) => {
                  refresh()
                })
              }
            }
            } hitSlop={10} style={styles.iconBtn}>
              <Image source={imagePath.delete} style={{transform:[{scale:1.2}]}} />
            </Pressable>
            
           
          </View>
        </View>
        <Text style={{ marginTop: responsiveScreenHeight(.8), fontSize: responsiveScreenFontSize(1.7), }}>{item.date_completion} - {item.country.country} - {item.state.state}</Text>

        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(1) }]}>
          <Image source={imagePath.education} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "700", }]}>{item.majorSubjects.map((e) => `${e.name},`)}</Text>
        </View>
        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.8) }]}>
          <Image source={imagePath.location2} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "700", }]}>{item.country.country} - {item.state.state}</Text>
        </View>
        <View style={[styles.metaRow, { gap: responsiveScreenWidth(2), marginTop: responsiveScreenHeight(.8) }]}>
          <Image source={imagePath.company3} />
          <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "700", }]}>{item.institution}</Text>
        </View>


      </View>
    </TouchableWithoutFeedback>
  );
}