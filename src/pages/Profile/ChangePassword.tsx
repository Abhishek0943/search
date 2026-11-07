import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NavigationBar from '../../components/NavigationBar';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel } from '../../components';
import Button from '../../components/Button';
import { useAppDispatch } from '../../store';
import { useAlert } from '../../context/AlertContext';
import { ChangePasswordApi } from '../../reducer/userReducer';
import { PasswordStrengthIndicator } from '../Auth/CompSingUp';
import imagePath from '../../assets/imagePath';
import { Header } from '../Company/Company';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePassword = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();

    const [userType, setUserType] = useState<'jobSeeker' | 'company'>(
        route?.params?.user_type || 'jobSeeker'
    );

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [hideOldPassword, setHideOldPassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            if (route?.params?.user_type) {
                setUserType(route.params.user_type);
                return;
            }
            try {
                const role = await AsyncStorage.getItem('role');
                setUserType(role === 'recruiter' ? 'company' : 'jobSeeker');
            } catch (e) {
                // Default fallback
                setUserType('jobSeeker');
            }
        };
        checkRole();
    }, [route?.params?.user_type]);

    const handleSubmit = async () => {
        if (!oldPassword.trim()) {
            showAlert({
                title: 'Validation',
                message: 'Please enter your current password.',
            });
            return;
        }

        if (!newPassword.trim()) {
            showAlert({
                title: 'Validation',
                message: 'Please enter your new password.',
            });
            return;
        }

        if (newPassword.length < 8) {
            showAlert({
                title: 'Validation',
                message: 'New password must be at least 8 characters long.',
            });
            return;
        }

        if (oldPassword === newPassword) {
            showAlert({
                title: 'Validation',
                message: 'New password must be different from your current password.',
            });
            return;
        }

        if (!confirmPassword.trim()) {
            showAlert({
                title: 'Validation',
                message: 'Please confirm your new password.',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert({
                title: 'Validation',
                message: 'New password and confirmation do not match.',
            });
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            const payload = {
                user_type: userType,
                old_password: oldPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            };

            const res: any = await dispatch(ChangePasswordApi(payload)).unwrap();
            console.log('Change password response:', res);

            if (res?.success) {
                showAlert({
                    title: 'Success',
                    message: res?.message || 'Password changed successfully.',
                });
                navigation.goBack();
            } else {
                showAlert({
                    title: 'Error',
                    message: res?.message || 'Failed to change password. Please check your current password.',
                });
            }
        } catch (error: any) {
            showAlert({
                title: 'Error',
                message: error?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    <Header
                        title="Change Password"
                        subtitle="Update your password to keep your account safe and secure."
                    />

                    <View style={styles.formContainer}>
                        {/* Current Password */}
                        <InPutWithLabel
                            label="Current Password"
                            placeholder="Enter current password"
                            secureText={hideOldPassword}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1.5) }}
                            rightIcon={() => (
                                <TouchableOpacity
                                    onPress={() => setHideOldPassword(!hideOldPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Image
                                        style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.4 }}
                                        source={imagePath.EyeOpen}
                                    />
                                </TouchableOpacity>
                            )}
                        />

                        {/* New Password */}
                        <InPutWithLabel
                            label="New Password"
                            placeholder="Enter new password (min. 8 characters)"
                            secureText={hideNewPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(0.5) }}
                            rightIcon={() => (
                                <TouchableOpacity
                                    onPress={() => setHideNewPassword(!hideNewPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Image
                                        style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.4 }}
                                        source={imagePath.EyeOpen}
                                    />
                                </TouchableOpacity>
                            )}
                        />

                        <PasswordStrengthIndicator
                            password={newPassword}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                        />

                        {/* Confirm New Password */}
                        <InPutWithLabel
                            label="Confirm New Password"
                            placeholder="Re-enter new password"
                            secureText={hideConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{
                                marginTop: responsiveHeight(1),
                                marginBottom: responsiveHeight(0.5),
                            }}
                            rightIcon={() => (
                                <TouchableOpacity
                                    onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Image
                                        style={{ width: responsiveWidth(2.8), aspectRatio: 20 / 11.4 }}
                                        source={imagePath.EyeOpen}
                                    />
                                </TouchableOpacity>
                            )}
                        />

                        {confirmPassword.length > 0 && (
                            <Text
                                style={{
                                    fontSize: responsiveFontSize(1.6),
                                    fontWeight: '600',
                                    color: newPassword === confirmPassword ? colors.primary2 : '#EF4444',
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                {newPassword === confirmPassword
                                    ? '✓ Passwords match'
                                    : '✗ Passwords do not match'}
                            </Text>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.footerContainer}>
                    <Button
                        label="Change Password"
                        loading={loading}
                        backgroundColor={colors.primary}
                        onPress={handleSubmit}
                    />
                </View>
            </KeyboardAvoidingView>
        </NavigationBar>
    );
};

export default ChangePassword;

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: responsiveHeight(4),
    },
    formContainer: {
        width: responsiveWidth(90),
        alignSelf: 'center',
        marginTop: responsiveHeight(2.5),
    },
    footerContainer: {
        paddingHorizontal: responsiveWidth(5),
        paddingVertical: responsiveHeight(2),
        alignItems: 'center',
    },
});

