import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import React, { useContext, useState } from 'react';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
    useResponsiveWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import { Alert } from 'react-native';
import Text from '../../components/Text';
import { useAppSelector, useAppDispatch } from '../../store';
import { setUser } from '../../reducer/userReducer';
import { postApiCall } from '../../api';
const Links = () => {
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const dispatch = useAppDispatch()
    const [link, setLink] = useState(user?.portfolio_link || "")
    const [loading, setLoading] = useState(false)

    const saveLink = async () => {
        setLoading(true);
        try {
            const res: any = await postApiCall('/jobseekers/user/profile/update', {
                portfolio_link: link,
            });
            if (res.success) {
                dispatch(setUser({ user: { ...user, portfolio_link: link } }));
            } else {
                Alert.alert('Error', res?.message || 'Something went wrong');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    if (!user) return <ActivityIndicator />
    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                <Header title="Link intro" subtitle="30 seconds. Employers watch these first." />
                {
                    user.portfolio_link ?
                        <View style={{
                            borderWidth: 1.5,
                            borderColor: colors.surfaces,
                            borderRadius: 12,
                            flex: 1,
                            width: "100%",
                            paddingHorizontal: useResponsiveWidth(4),
                            height: responsiveHeight(6.5),
                            justifyContent: 'center',
                            marginTop: responsiveHeight(2),
                            flexDirection: "row",
                            alignItems: "center",
                            gap: responsiveWidth(2),

                        }}>
                            <View style={{ justifyContent: "center", alignItems: "center", width: responsiveHeight(2.5), aspectRatio: 1 }}>
                                <Image source={require("./LinkIcon.png")} style={{ resizeMode: "contain", width: "100%", height: "100%" }} />
                            </View>
                            <TextInput
                                value={link}
                                onChangeText={(t) => setLink(t)}
                                placeholder="e.g. Small Batch Coffee"
                                placeholderTextColor={colors.placeholder}
                                style={{ fontSize: responsiveFontSize(1.9), flex: 1, color: colors.textPrimary }}
                            />
                            {
                                user.portfolio_link === link ? (
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '700',
                                        color: colors.primary,
                                    }}>
                                        Open
                                    </Text>
                                ) : loading ? (
                                    <ActivityIndicator size={responsiveFontSize(2)} color={colors.primary} />
                                ) : (
                                    <Text onPress={saveLink} style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '700',
                                        color: colors.primary,
                                    }}>
                                        Save
                                    </Text>
                                )
                            }

                        </View> :
                        <View style={{
                            borderWidth: 1.5,
                            borderColor: colors.surfaces,
                            borderRadius: 12,
                            marginTop: responsiveHeight(2),
                            flex: 1,
                            width: "100%",
                            paddingHorizontal: useResponsiveWidth(4),
                            height: responsiveHeight(6.5),
                            justifyContent: 'center',
                            flexDirection: "row",
                            alignItems: "center",
                            gap: responsiveWidth(4),
                        }}>

                            <TextInput
                                value={link}
                                onChangeText={(t) => setLink(t)}
                                placeholder="e.g. Small Batch Coffee"
                                placeholderTextColor={colors.placeholder}
                                style={{ fontSize: responsiveFontSize(1.9), flex: 1, color: colors.textPrimary }}
                            />
                            {loading ? (
                                <ActivityIndicator size={responsiveFontSize(2)} color={colors.primary} />
                            ) : (
                                <Text onPress={saveLink} style={{
                                    fontSize: responsiveFontSize(1.5),
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}>
                                    Submit
                                </Text>
                            )}
                        </View>
                }

                <Pressable
                    style={{ width: '100%', aspectRatio: 350 / 408.5, }}
                >
                    <Image source={require("./LinkStatic.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                </Pressable>
            </ScrollView>
        </NavigationBar>
    );
};
export default Links;