import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import ImagePicker from 'react-native-image-crop-picker';
import NavigationBar from '../../recruiter/components/NavigationBar';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { useAlert } from '../../context/AlertContext';
import { Industries } from '../../reducer/jobsReducer';
import { UpdateRegistrationDetails } from '../../reducer/recruiterReducer';
import { postApiCall, deleteApiCall } from '../../api';
import imagePath from '../../assets/imagePath';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';

const BusinessPage = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const { user } = useAppSelector(state => state.userStore);
    const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<string>(user?.logo || '');
    const [workplacePhotos, setWorkplacePhotos] = useState<any[]>(user?.images || []);
    const [formData, setFormData] = useState({
        industry_id: String(user?.industry_id || ''),
        description: user?.description || '',
    });
    useEffect(() => {
        dispatch(Industries())
            .unwrap()
            .then(res => {
                if (res?.success && res?.data) {
                    setIndustries(res.data.map((item: any) => ({ id: String(item.id), name: item.name })));
                }
            })
            .catch(() => { });
    }, [dispatch]);

    const pickLogo = async () => {
        try {
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });
            const logoImage = {
                uri: image.path,
                name: `logo_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`,
                type: image.mime || 'image/jpeg',
            };

            const bodyData = new FormData();
            bodyData.append('logo', logoImage);

            const response = await postApiCall<{ success: true; data?: any } | { success: false; message: string }>('/company/upload-images', bodyData, { as: 'form' });
            if (response && response.success) {
                setLogo(response.data.logo_url);
                showAlert({ title: 'Success', message: 'Logo uploaded successfully.' });
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to upload logo.' });
            }
        } catch (_e) { }
    };

    const pickWorkplacePhotos = async () => {
        const remaining = 4 - workplacePhotos.length;
        if (remaining <= 0) {
            showAlert({ title: 'Limit Reached', message: 'You can upload up to 4 workplace photos.' });
            return;
        }
        try {
            const images = await ImagePicker.openPicker({
                multiple: true,
                maxFiles: remaining,
                compressImageQuality: 0.8,
                mediaType: 'photo',
            });
            const newPhotos = images.map((img, idx) => ({
                uri: img.path,
                name: `workplace_${Date.now()}_${idx}.${img.mime?.includes('png') ? 'png' : 'jpg'}`,
                type: img.mime || 'image/jpeg',
            }));

            const bodyData = new FormData();
            newPhotos.forEach(photo => {
                bodyData.append('images[]', photo);
            });

            const response = await postApiCall<{ success: true; data?: any } | { success: false; message: string }>('/company/upload-images', bodyData, { as: 'form' });
            if (response && response.success) {
                setWorkplacePhotos(response.data.images || []);
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to upload images.' });
            }
        } catch (_e) { }
    };

    const removeWorkplacePhoto = async (index: number, photoId?: string | number) => {
        if (photoId) {
            const response = await deleteApiCall<{ success: true; data?: any } | { success: false; message: string }>(`/company/delete-image/${photoId}`);
            if (response && response.success) {
                setWorkplacePhotos(prev => prev.filter((_, i) => i !== index));
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to delete image.' });
            }
        } else {
            setWorkplacePhotos(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        setLoading(true);
        dispatch(UpdateRegistrationDetails(formData))
            .unwrap()
            .then(res => {
                setLoading(false);
                if (res.success) {
                    showAlert({ title: 'Success', message: 'Business page details updated.' });
                    navigation.goBack();
                } else {
                    showAlert({ title: 'Error', message: res?.message || 'Failed to update.' });
                }
            })
            .catch(err => {
                setLoading(false);
                showAlert({ title: 'Error', message: err?.message || 'Something went wrong.' });
            });
    };

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Business page
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Showcase your brand with logo, photos, and company overview.
                    </Text>

                    <View style={{ marginBottom: responsiveHeight(.8) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            Venue name and logo
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.gray,
                            borderRadius: 16,
                            padding: responsiveWidth(4),
                            marginTop: responsiveHeight(.8)
                        }}>
                            <View style={{
                                width: responsiveWidth(16),
                                height: responsiveWidth(16),
                                borderRadius: 16,
                                backgroundColor: '#EDF4FC',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: responsiveWidth(4)
                            }}>
                                {logo ? (
                                    <Image source={{ uri: logo }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                                ) : (
                                    <Text style={{ fontSize: responsiveFontSize(3.5), fontWeight: 'bold', color: colors.primary }}>
                                        {(user?.name || 'R').charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(2), fontWeight: 'bold', color: '#0F172A' }}>
                                    {user?.name}
                                </Text>
                                <Text style={{ fontSize: responsiveFontSize(1.6), color: '#64748B', marginTop: 4 }}>
                                    {user?.email}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={pickLogo}
                                style={{
                                    backgroundColor: '#EDF4FC',
                                    paddingHorizontal: responsiveWidth(4),
                                    paddingVertical: responsiveHeight(1),
                                    borderRadius: 12
                                }}>
                                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: responsiveFontSize(1.6) }}>
                                    Change
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.headerSubtitle, { marginBottom: responsiveHeight(.5), color: colors.textSecondary }]}>
                            Name and location come from Business details.
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: responsiveHeight(1), alignItems: 'center' }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            Photos
                        </Text>
                        <Text style={{
                            color: colors.primary2,
                            fontSize: responsiveFontSize(1.8),
                            fontWeight: '700',
                        }}>
                            {workplacePhotos.length} of 4 added
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={pickWorkplacePhotos}
                        style={{
                            height: responsiveHeight(25),
                            backgroundColor: '#EDF4FC',
                            borderRadius: 16,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: responsiveHeight(1.5),
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                        {workplacePhotos.length > 0 ? (
                            <>
                                <Image source={{ uri: workplacePhotos[0].url || workplacePhotos[0].uri }} style={{ width: '100%', height: '100%' }} />
                                <TouchableOpacity
                                    onPress={() => removeWorkplacePhoto(0, workplacePhotos[0].id)}
                                    style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Text style={{ color: colors.white, fontSize: 14, fontWeight: 'bold' }}>✕</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={{ width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={imagePath.bag} style={{ width: 32, height: 32, tintColor: colors.primary }} />
                            </View>
                        )}
                        <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: '#475569', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                            <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: responsiveFontSize(1.4) }}>COVER PHOTO</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: responsiveWidth(3), justifyContent: 'space-between' }}>
                        {[...Array(3)].map((_, i) => {
                            const photoIndex = i + 1;
                            const photo = workplacePhotos[photoIndex];
                            if (photo) {
                                return (
                                    <View key={i} style={{ flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: '#EDF4FC', position: 'relative', overflow: 'hidden' }}>
                                        <Image source={{ uri: photo.url || photo.uri }} style={{ width: '100%', height: '100%' }} />
                                        <TouchableOpacity
                                            onPress={() => removeWorkplacePhoto(photoIndex, photo.id)}
                                            style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            } else if (photoIndex === Math.max(1, workplacePhotos.length)) {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={pickWorkplacePhotos}
                                        style={{ width: responsiveWidth(22), height: responsiveWidth(22), borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(3), fontWeight: '300' }}>+</Text>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.4), fontWeight: 'bold', marginTop: 2 }}>Add</Text>
                                    </TouchableOpacity>
                                )
                            } else {
                                return (
                                    <View key={i} style={{ width: responsiveWidth(22), height: responsiveWidth(22), borderRadius: 12, backgroundColor: '#EDF4FC' }} />
                                )
                            }
                        })}
                    </View>
                    <Text style={[styles.headerSubtitle, { marginBottom: responsiveHeight(.5), color: colors.textSecondary }]}>
                        Real photos of the floor and team beat stock images.
                    </Text>
                    <SearchSelectDropdown
                        options={industries}
                        placeholder="Select Industry"
                        onSelect={val => setFormData(prev => ({ ...prev, industry_id: String(val) }))}
                        label='Industry'
                        multiSelect={false}
                        selectedId={formData.industry_id}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            gap: responsiveWidth(1),
                            marginBottom: responsiveHeight(0.5),
                        }}
                    >
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            About the company
                        </Text>
                    </View>
                    <View style={{
                        borderWidth: 1.5,
                        borderRadius: 12,
                        borderColor: colors.primary,
                        paddingHorizontal: responsiveWidth(4),
                        marginBottom: responsiveHeight(1),
                        minHeight: responsiveHeight(12),
                    }}>
                        <TextInput
                            multiline
                            maxLength={200}
                            value={formData.description}
                            onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Type two lines, or skip it."
                            placeholderTextColor={colors.placeholder}
                            style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                        />
                        <Text style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(1), color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                            {(formData.description || '').length} / 200
                        </Text>
                    </View>
                    <Button
                        label={loading ? 'Saving...' : 'Save Changes'}
                        onPress={handleSave}
                        disabled={loading}
                        style={{ marginTop: responsiveHeight(3), marginBottom: responsiveHeight(4) }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

        </NavigationBar>
    );
};

export default BusinessPage;

const styles = StyleSheet.create({
    container: {
        width: responsiveWidth(90),
        alignSelf: 'center',
        paddingTop: responsiveHeight(2),
        paddingBottom: responsiveHeight(5),
    },
    headerTitle: {
        fontSize: responsiveFontSize(2.8),
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '500',
        marginTop: responsiveHeight(0.5),
        marginBottom: responsiveHeight(2),
    },
    sectionWrap: {
        marginBottom: responsiveHeight(2.5),
    },
    sectionTitle: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '700',
        marginBottom: responsiveHeight(1),
    },
    logoBox: {
        width: responsiveWidth(26),
        height: responsiveWidth(26),
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: responsiveWidth(3),
    },
    photoThumbWrap: {
        width: responsiveWidth(20),
        height: responsiveWidth(20),
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    photoThumb: {
        width: '100%',
        height: '100%',
    },
    removeBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoBox: {
        width: responsiveWidth(20),
        height: responsiveWidth(20),
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownStyle: {
        borderRadius: 14,
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(1.5),
    },
});
