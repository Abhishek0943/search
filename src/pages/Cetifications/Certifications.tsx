import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    TextInput,
    Pressable,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import ImagePicker from 'react-native-image-crop-picker';
import { postApiCall } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store';
import { DeleteCertificate } from '../../reducer/jobsReducer';
import { useAlert } from '../../context/AlertContext';
import Icon from '../../utils/Icon';
const Certifications = () => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { showConfirm } = useAlert();
    const [certTitle, setCertTitle] = useState('');
    const [certImage, setCertImage] = useState<any>(null);
    const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
    const { user } = useAppSelector(state => state.userStore)
    const uploadMediaToApi = async (key: string, file: { uri: string; name: string; type: string }, extraFields?: Record<string, string>) => {
        try {
            setUploadingMedia(key);
            const fd = new FormData();
            fd.append(key, {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
            if (extraFields) {
                Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
            }
            const res: any = await postApiCall('/jobseeker/update-user-media', fd, { as: 'form' });
            if (!res.success) {
                Alert.alert('Upload Failed', res?.message || 'Something went wrong');
            }
            if (res.success) {

            }
        } catch (e) {
            Alert.alert('Upload Failed', 'Network error. Please try again.');
        } finally {
            setUploadingMedia(null);
        }
    };

    const pickCertImage = async () => {
        if (!certTitle.trim()) {
            Alert.alert('Title Required', 'Please enter a certificate title before uploading.');
            return;
        }
        try {
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: true,
            });
            const fileName = `cert_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`;
            const file = { uri: image.path, name: fileName, type: image.mime || 'image/jpeg' };
            setCertImage(file);
            uploadMediaToApi('certificate', file, { certificate_title: certTitle });
            setCertTitle('');
        } catch (e) { }
    };
    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                <Header title="Certifications" subtitle="Upload a photo of each card. We check them by hand." />
                <View style={{
                    marginTop: responsiveHeight(3),
                    borderWidth: 1.5,
                    borderColor: colors.surfaces,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: responsiveWidth(4),
                    marginBottom: responsiveHeight(1),
                    height: responsiveHeight(6.5),
                }}>
                    <TextInput
                        value={certTitle}
                        onChangeText={setCertTitle}
                        placeholder="Certificate name (e.g. RSA, White Card)"
                        placeholderTextColor={colors.placeholder}
                        style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                    />
                </View>

                <Pressable onPress={pickCertImage} disabled={uploadingMedia === 'certificate'} style={{
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                    borderRadius: 12,
                    borderStyle: 'dashed',
                    paddingVertical: responsiveHeight(2),
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: "100%",
                    marginBottom: responsiveHeight(1.5),
                    opacity: uploadingMedia === 'certificate' ? 0.6 : 1,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                        {uploadingMedia === 'certificate' ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={20} style={{ color: colors.primary }} />
                        )}
                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>
                            {certImage ? 'Change photo' : 'Upload a photo'}
                        </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                        JPG or PNG · up to 5 MB each
                    </Text>

                </Pressable>

                {user?.certificates?.map((cert) => (
                    <View key={cert.id} style={{
                        borderWidth: 1.5,
                        borderColor: colors.surfaces,
                        borderRadius: 12,
                        padding: responsiveWidth(3.5),
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: responsiveHeight(1),
                        gap: responsiveWidth(3),
                    }}>
                        <View style={{
                            width: responsiveWidth(12),
                            aspectRatio: 1,
                            borderRadius: 8,
                            backgroundColor: colors.surfaces,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: "hidden"
                        }}>
                            <Image source={{ uri: cert?.certificate_file }} style={{ width: '100%', height: '100%' }} />
                        </View>
                        <Text style={{ flex: 1, color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>{cert.title}</Text>
                        <Pressable onPress={async () => {
                            await showConfirm({
                                title: "Delete certificate?",
                                message: "Are you sure you want to delete this certificate?",
                                okText: "Delete",
                                waitForOk: true,
                                cancelText: "Cancel",
                                onOkPress: () => {
                                    const value = dispatch(DeleteCertificate({ id: String(cert.id) })).unwrap().then(async (res) => {
                                        // const updatedCertificates = user?.certificates.filter((c: any) => c.id !== cert.id);

                                        // const userData = await AsyncStorage.getItem("user");
                                        // const parsed = userData ? JSON.parse(userData) : {};
                                        // await AsyncStorage.setItem("user", JSON.stringify({ ...parsed, certificates: updatedCertificates }));

                                        // setCertificates(updatedCertificates);
                                        return true
                                    }).catch(err => {
                                        console.error(err)
                                        return false
                                    });
                                    return value
                                }

                            });

                        }}>
                            <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Remove</Text>
                        </Pressable>
                    </View>
                ))}
                <View style={{ width: "100%", aspectRatio: 350 / 184, marginTop: responsiveHeight(2) }}>
                    <Image source={require("./CertificationsInfo.png")} style={{ width: '100%', height: '100%' }} />
                </View>
            </ScrollView>
        </NavigationBar>
    );
};

export default Certifications;
