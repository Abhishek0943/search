import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Text from './Text';
import { deleteApiCall } from '../api';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser } from '../reducer/userReducer';
type ResumeCardProps = {
    fileName?: string;
    subtitle?: string;
    onView?: () => void;
    onReplace?: () => void;
};
const ResumeCard = ({
    fileName = 'resume.pdf',
    subtitle = 'Added recently',
    onView,
    onReplace,
}: ResumeCardProps) => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.userStore)
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const removeResume = async () => {
        setDeleteLoading(true);
        try {
            const res: any = await deleteApiCall('/jobseekers/cv-delete');
            if (res.success) {
                dispatch(setUser({ user: { ...user, cv: null } }));
            } else {
                Alert.alert('Delete Failed', res?.message || 'Something went wrong');
            }
        } catch (e) {
            Alert.alert('Delete Failed', 'Network error. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };
    return (
        <View
            style={{
                borderRadius: 15,
                paddingHorizontal: responsiveWidth(4),
                borderWidth: 1,
                borderColor: colors.gray,
                paddingTop: responsiveHeight(1.8),
                paddingBottom: responsiveHeight(1.4),
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                    style={{
                        width: responsiveWidth(10),
                        height: responsiveWidth(12),
                        borderRadius: 10,
                        backgroundColor: colors.primary50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: responsiveWidth(3),
                    }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <View
                            style={{
                                width: responsiveWidth(4.5),
                                height: 2,
                                backgroundColor: colors.primary,
                                borderRadius: 1,
                                marginBottom: 3,
                            }}
                        />
                        <View
                            style={{
                                width: responsiveWidth(4.5),
                                height: 2,
                                backgroundColor: colors.primary,
                                borderRadius: 1,
                                marginBottom: 3,
                            }}
                        />
                        <View
                            style={{
                                width: responsiveWidth(3),
                                height: 2,
                                backgroundColor: colors.primary,
                                borderRadius: 1,
                            }}
                        />
                    </View>
                </View>

                <View style={{ flex: 1 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: responsiveFontSize(1.8),
                            fontWeight: '700',
                            color: colors.textPrimary,
                        }}
                    >
                        {fileName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: responsiveFontSize(1.6),
                            color: colors.textSecondary,
                            fontWeight: "500"
                        }}
                    >
                        {subtitle}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: responsiveHeight(.2),
                            gap: responsiveWidth(4),
                        }}
                    >
                        {onView && (
                            <TouchableOpacity onPress={onView} activeOpacity={0.7}>
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '700',
                                        color: colors.primary,
                                    }}
                                >
                                    View
                                </Text>
                            </TouchableOpacity>
                        )}
                        {onReplace && (
                            <TouchableOpacity onPress={onReplace} activeOpacity={0.7}>
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '700',
                                        color: colors.primary,
                                    }}
                                >
                                    Replace
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={removeResume} activeOpacity={0.7} disabled={deleteLoading}>
                            {deleteLoading ? (
                                <ActivityIndicator size={responsiveFontSize(2)} color={colors.primary} />
                            ) : (
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '700',
                                        color: colors.primary,
                                    }}
                                >
                                    Remove
                                </Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </View>
    );
};

export default ResumeCard;
