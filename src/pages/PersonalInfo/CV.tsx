import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../constants/values'
import { DeleteCv, GetCv } from '../../reducer/jobsReducer'
import { useAppDispatch, useAppSelector } from '../../store'
import { formatDate } from './PersonalInfo'

const CV = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch()
    const [cvs, setCvs] = useState([])
    const [active, setActive] = useState(0)
    const { user } = useAppSelector(state => state.userStore)
    useFocusEffect(useCallback(
        () => {

            if (user && user.id) {
                dispatch(GetCv({ id: user.id })).unwrap().then(res => {
                    if (res.success !== false) {
                        setCvs(res.cvs)

                    }
                    console.log(res)
                })
            }
        },
        [user],
    )
    )
    return (
        <NavigationBar navigationBar={false}>
            <TouchableWithoutFeedback onPress={()=>setActive(0)}>
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
                    <Pressable onPress={() => navigation.goBack()}>
                        <Image source={imagePath.backIcon} style={{ resizeMode: 'contain' }} />
                    </Pressable>
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'center',
                            fontSize: responsiveScreenFontSize(2),
                            color: colors.textPrimary,
                            fontWeight: '600',
                        }}
                    >
                        CV
                    </Text>
                    {/* Invisible icon to balance layout */}
                    <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
                </View>
                <View>

                </View>
                {
                    cvs?.length > 0 ? <>
                        <FlatList data={cvs} style={{ flex: 1, width: responsiveScreenWidth(90) }} renderItem={({ item, index }) => {
                            return (
                                <>
                                    <CvCard refresh={() => dispatch(GetCv({ id: user.id })).unwrap().then(res => {
                                        setCvs(res.cvs)
                                        console.log(res.cvs)
                                    })} setActive={setActive} active={active} id={item.id} title={item.title} dateText={item.created_at} isDefault={item.is_default} />
                                </>
                            )
                        }} />
                    </> :
                        <Image source={imagePath.workExperience} style={{ resizeMode: "contain", width: "100%" }} />
                }
                <Pressable
                    onPress={() => navigation.navigate(routes.CVADD)}
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
                        Add New CV
                    </Text>
                </Pressable>
            </ScrollView>
            </TouchableWithoutFeedback>
        </NavigationBar>
    )
}

export default CV
function CvCard({
    title = "Developer",
    isDefault = false,
    dateText = "2025/04/2025",
    setActive, active, id, refresh

}) {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(state => state.userStore)

    return (
        

        <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
            <View style={styles.topRow}>
                <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.5), fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
                    {title}
                </Text>

                <View style={styles.actions}>
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
                                    }}
                                    style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}
                                >
                                    <Image source={imagePath.download} style={{}} />
                                    <Text style={[{ color: colors.textPrimary }]}>
                                        Download
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        if (user?.id)
                                            dispatch(DeleteCv({ id: user?.id, cvid: id })).unwrap().then((res) => {
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

            <Text style={[styles.subTitle, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", marginTop: responsiveScreenHeight(.8) }]}>{isDefault ? "Default" : "Not Default"}</Text>

            <View style={[styles.metaRow, { gap: responsiveScreenWidth(2) }]}>
                <Image source={imagePath.calendar} />
                <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{formatDate(dateText)}</Text>
            </View>
            <View style={[styles.metaRow, { gap: responsiveScreenWidth(2) }]}>
                <Image source={imagePath.clock} />
                <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", }]}>{new Date(dateText).toLocaleTimeString("en", { hour: "numeric", minute: "numeric", hour12: true })}</Text>
            </View>

        </View>
        
    );
}

export const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: 14,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    title: {
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconBtn: {
        position: "relative"
    },
    subTitle: {
        fontWeight: "500",
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: responsiveScreenHeight(.8),
    },
    metaIcon: {
        marginRight: 10,
        color: "#111",
        opacity: 0.9,
    },
    metaText: {
        fontSize: 13,
        color: "#111",
        opacity: 0.75,
        fontWeight: "500",
    },
});