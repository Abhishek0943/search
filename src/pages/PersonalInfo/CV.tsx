import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
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
import { Header } from '../Company/Company'
import { useAlert } from '../../context/AlertContext'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'
import Text from '../../components/Text'
import { downloadCV } from '../../recruiter/pages/CandidateProfile/CandidateProfile'

const CV = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch()
    const [cvs, setCvs] = useState([])
    const [active, setActive] = useState(0)
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState(true)

    useFocusEffect(useCallback(
        () => {

            if (user && user.id) {
                dispatch(GetCv({ id: user.id })).unwrap().then(res => {
                    setLoading(false)
                    if (res.success !== false) {
                        setCvs(res.cvs)

                    }
                })
            }
        },
        [user],
    )
    )
    return (
        <NavigationBar navigationBar={false}>
            <View
                style={{
                    flex: 1,
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                      width: responsiveScreenWidth(96),
                }}
            >
                <Header title="CV" />

                <View>

                </View>
                {
                    loading ? <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View> :

                        <>
                            {
                                cvs?.length > 0 ? <>
                                    <FlatList
                                        data={cvs} style={{ flex: 1, width: responsiveScreenWidth(90) }} renderItem={({ item, index }) => {
                                            return (
                                                <>
                                                    <CvCard refresh={() => dispatch(GetCv({ id: user.id })).unwrap().then(res => {
                                                        setCvs(res.cvs)
                                                    })} setActive={setActive} fileUrl={item?.file_url} active={active} id={item.id} title={item.title} dateText={item.created_at} isDefault={item.is_default} />
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
                        </>
                }

            </View>

        </NavigationBar>
    )
}

export default CV
function CvCard({
    title = "Developer",
    isDefault = false,
    dateText = "2025/04/2025",
    setActive, active, id, refresh,
    fileUrl

}) {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(state => state.userStore)
    const { showConfirm } = useAlert();

    return (

        <TouchableWithoutFeedback onPress={() => setActive(0)}>
            <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
                <View style={styles.topRow}>
                    <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.2), fontWeight: "700", color: colors.textPrimary }]} numberOfLines={1}>
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
                                            top: "100%",
                                            borderRadius: 10,
                                            gap: responsiveScreenHeight(1),
                                            paddingHorizontal: responsiveScreenWidth(3),
                                            paddingVertical: responsiveScreenHeight(2)
                                        },
                                    ]}
                                >


                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (user?.id) {

                                                const ok = await showConfirm({
                                                    title: "Delete CV?",
                                                    message: "Are you sure you want to delete this record?",
                                                    okText: "Delete",
                                                    cancelText: "Cancel",
                                                })
                                                if (ok) {
                                                    dispatch(DeleteCv({ id: user?.id, cvid: id })).unwrap().then((res) => {
                                                        refresh()
                                                    })
                                                }
                                            }
                                        }
                                        }
                                        style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}
                                    >
                                        <Image source={imagePath.delete} style={{}} />
                                        <Text style={[{ color: colors.textPrimary }]}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            const ok = await showConfirm({
                                                title: "Download CV?",
                                                message: "Are you sure you want to Download CV?",
                                                okText: "Download",
                                                cancelText: "Cancel",
                                            })
                                            if (ok)
                                                downloadCV(fileUrl)
                                        }}
                                        style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}
                                    >
                                        <Image source={imagePath.download} style={{}} />
                                        <Text style={[{ color: colors.textPrimary }]}>
                                            Download
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            }

                        </Pressable>
                    </View>
                </View>

                <Text style={[styles.subTitle, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "700", marginTop: responsiveScreenHeight(.8) }]}>{isDefault ? "Default" : "Not Default"}</Text>

                <View style={[styles.metaRow, { gap: responsiveScreenWidth(2) }]}>
                    <Image source={imagePath.calendar} />
                    <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "600", }]}>{formatDate(dateText)}</Text>
                </View>
                <View style={[styles.metaRow, { gap: responsiveScreenWidth(2) }]}>
                    <Image source={imagePath.clock} />
                    <Text style={[styles.metaText, { fontSize: responsiveScreenFontSize(1.7), color: colors.textSecondary, fontWeight: "600", }]}>{new Date(dateText).toLocaleTimeString("en", { hour: "numeric", minute: "numeric", hour12: true })}</Text>
                </View>

            </View>
        </TouchableWithoutFeedback>
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
        color: "#111",
        opacity: 0.75,
        fontWeight: "500",
    },
});