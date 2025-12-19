import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { ThemeContext } from '../../context/ThemeProvider'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { routes } from '../../constants/values'
import { DeleteCv, DeleteUserSkill, GetCv, GetUserSkill } from '../../reducer/jobsReducer'
import { useAppDispatch, useAppSelector } from '../../store'
import { formatDate } from './PersonalInfo'
import { Header } from '../Company/Company'

const CV = () => {
    const { colors } = useContext(ThemeContext);
    const { user } = useAppSelector(state => state.userStore)
    const navigation = useNavigation();
    const dispatch = useAppDispatch()
    const [cvs, setCvs] = useState([])
    const [active, setActive] = useState(0)
    useFocusEffect(useCallback(
        () => {

            if (user && user.id) {
                dispatch(GetUserSkill()).unwrap().then(res => {
                    if (res.success !== false) {
                        setCvs(res.data)

                    }
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
            <Header title="Skills"  />
                <View>

                </View>
                {
                    cvs?.length > 0 ? <>
                        <FlatList data={cvs} style={{ flex: 1, width: responsiveScreenWidth(90) }} renderItem={({ item, index }) => {
                            return (
                                <>
                                    <CvCard refresh={() => dispatch(GetUserSkill()).unwrap().then(res => {
                                        if(res.success){
                                            setCvs(res.data)

                                        }
                                    })}item={item} id={item.id} title={item.skill_name}  isDefault={item.experience_label} />
                                </>
                            )
                        }} />
                    </> :
                        <Image source={imagePath.workExperience} style={{ resizeMode: "contain", width: "100%" }} />
                }
                <Pressable
                    onPress={() => navigation.navigate(routes.SKILLFORM)}
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
                        Add New Skill
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
    id, refresh, 
    item

}) {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(state => state.userStore)
    const navigation = useNavigation();

    return (
        

        <View style={[styles.card, { marginTop: responsiveScreenHeight(2), borderColor: colors.surfaces, backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), borderWidth: 1 }]}>
            <View style={styles.topRow}>
                <Text style={[styles.title, { fontSize: responsiveScreenFontSize(2.5), fontWeight: "600", color: colors.textPrimary }]} numberOfLines={1}>
                    {title}
                </Text>

                <View style={styles.actions}>
                     <Pressable onPress={() => { navigation.navigate(routes.SKILLFORM, { ...item }) }} hitSlop={10} style={styles.iconBtn}>
                        <Image source={imagePath.edit} style={{height:"98%"}}/>
                    </Pressable>
                    <Pressable onPress={() => dispatch(DeleteUserSkill({id:id})).unwrap().then((e)=>{if(e.success){refresh()}})} hitSlop={10} style={styles.iconBtn}>
                        <Image source={imagePath.delete} style={{height:"100%"}} />
                    </Pressable>
                </View>
            </View>

            <Text style={[styles.subTitle, { fontSize: responsiveScreenFontSize(1.8), color: colors.textSecondary, fontWeight: "600", marginTop: responsiveScreenHeight(.8) }]}>{isDefault}</Text>

            

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
        gap: responsiveScreenWidth(3),
        height:responsiveScreenHeight(3)

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