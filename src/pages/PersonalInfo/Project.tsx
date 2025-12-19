import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../constants/values'
import { useAppDispatch, useAppSelector } from '../../store'
import { GetEducation, GetProject } from '../../reducer/jobsReducer'
import { styles } from './CV'
import {  formatDisplayDate } from './WorkExperience'
import { Header } from '../Company/Company'
const Education = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch()
    const [cvs, setCvs] = useState([])
    const [active, setActive] = useState(0)
    useFocusEffect(useCallback(
        () => {
            dispatch(GetProject()).unwrap().then(res => {

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
                <Header title="Project" />
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
                    onPress={() => navigation.navigate(routes.PROJECTFORM)}
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
                        Add New Project
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
    const { user } = useAppSelector(state => state.userStore)
    const navigation = useNavigation();

    return (
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => setActive(0)}>
            <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
                <View style={styles.topRow}>
                    <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.5), fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
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

                                            dispatch(DeleteExperience({ id: id, })).unwrap().then((res) => {
                                              console.log("hiiii", res)
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

                <View style={[styles.metaRow, { gap: responsiveScreenWidth(1), marginTop: responsiveScreenHeight(1) }]}>
                    <Image source={imagePath.calendar} />
                    <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}> {formatDateRange(item.date_start, item.date_end)}</Text>
                </View>
                {
                    item.description &&
                <View style={[styles.metaRow, { gap: responsiveScreenWidth(1), marginTop: responsiveScreenHeight(1) }]}>
                    {/* <Image source={imagePath.calendar} /> */}
                    <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}> {item.description}</Text>
                </View>
                
                }
                    {/* <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>  {formatDateRange(item.date_start, item.date_end)}</Text> */}

            </View>
        </TouchableWithoutFeedback>
    );
}
 const formatDateRange = (
  date_start?: string | null,
  date_end?: string | null
) => {
  if (!date_start) return '';

  const start = formatDisplayDate(date_start);

  if (!date_end) {
    return `${start} - Working`;
  }

  const end = formatDisplayDate(date_end);

  return `${start} - ${end}`;
};