import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { NavigationBar, InPutWithLabel } from '../../components';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { Header } from '../Company/Company';
import { CustomDropdown } from '../PersonalInfo/PersonalInfo';
import { useAppDispatch, useAppSelector } from '../../store';
import { useAlert } from '../../context/AlertContext';
import {
    Career,
    Currencies,
    Experiences,
    FunctionalAria,
    GetCity,
    GetCountry,
    GetGender,
    GetNationalities,
    GetState,
    Industries,
    GetAllWorkRights,
    ProfileData,
    Update,
} from '../../reducer/jobsReducer';
import { pick, types } from '@react-native-documents/picker';
import { postApiCall } from '../../api';
import imagePath from '../../assets/imagePath';

const EditProfileScreen = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const { user } = useAppSelector(state => state.userStore);

    // Dropdown options from backend
    const [genderOptions, setGenderOptions] = useState<any[]>([]);
    const [nationalities, setNationalities] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [workRights, setWorkRights] = useState<any[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [careerLevels, setCareerLevels] = useState<any[]>([]);
    const [functionalAreas, setFunctionalAreas] = useState<any[]>([]);
    const [industryOptions, setIndustryOptions] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);

    // Image state
    const [imageUri, setImageUri] = useState<string | null>((user as any)?.image || (user as any)?.avatar || null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        nationalId: '',
        genderId: 0,
        nationalityId: 0,
        countryId: 0,
        stateId: 0,
        cityId: 0,
        streetAddress: '',
        bio: '',
        jobExperienceId: 0,
        careerLevelId: 0,
        functionalAreaId: 0,
        currentSalary: '',
        expectedSalary: '',
        salaryCurrency: 0,
        workRightId: 0,
        industryId: 0,
    });

    const [saving, setSaving] = useState(false);

    // Initialize form from current user
    useEffect(() => {
        if (!user) return;
        const u = user as any;

        const first = u.first_name || (u.name ? u.name.split(' ')[0] : '');
        const middle = u.middle_name || '';
        const last = u.last_name || (u.name ? u.name.split(' ').slice(1).join(' ') : '');
        console.log(u, "national")
        setFormData({
            firstName: first,
            middleName: middle,
            lastName: last,
            phone: u.phone || u.phone_number || u.mobile_num || '',
            email: u.email || '',
            nationalId: u.national_id_card_number || u.national_id || '',
            genderId: Number(u.gender_id || u.gender?.id || 0),
            nationalityId: Number(u.nationality_id || 0),
            countryId: Number(u.country_id || u.country?.id || 0),
            stateId: Number(u.state_id || u.state?.id || 0),
            cityId: Number(u.city_id || u.city?.id || 0),
            streetAddress: u.street_address || u.address || u.location || '',
            bio: u.bio || u.profile_summary || u.summary || u.description || '',
            jobExperienceId: Number(u.job_experience_id || u.job_experience?.id || 0),
            careerLevelId: Number(u.career_level_id || u.career_level?.id || 0),
            functionalAreaId: Number(u.functional_area_id || u.functional_area?.id || 0),
            currentSalary: u.current_salary ? String(u.current_salary) : '',
            expectedSalary: u.expected_salary ? String(u.expected_salary) : '',
            salaryCurrency: u.salary_currency,
            workRightId: Number(u.work_right_id || u.work_rights_id || u.work_right?.id || 0),
            industryId: Number(u.industry_id || u.industry?.id || 0),
        });

        if (u.image) setImageUri(u.image);

        if (u.country_id) {
            dispatch(GetState({ id: String(u.country_id) }))
                .unwrap()
                .then(res => {
                    if (res?.success) setStates(res.data || []);
                });
        }
        if (u.state_id) {
            dispatch(GetCity({ id: String(u.state_id) }))
                .unwrap()
                .then(res => {
                    if (res?.success) setCities(res.data || []);
                });
        }
    }, [user, dispatch]);

    // Fetch backend dropdown data
    useEffect(() => {
        dispatch(GetGender()).unwrap().then(res => {
            if (res?.success) setGenderOptions(res.data || []);
        });

        dispatch(GetNationalities()).unwrap().then(res => {
            if (res?.success) setNationalities(res.data || []);
        });

        dispatch(GetCountry()).unwrap().then(res => {
            if (res?.success) setCountries(res.data || []);
        });

        dispatch(GetAllWorkRights()).unwrap().then(res => {
            if (res?.success) setWorkRights(res.data || []);
        });

        dispatch(Experiences()).unwrap().then(res => {
            if (res?.success) setExperiences(res.data || []);
        });

        dispatch(Career()).unwrap().then(res => {
            if (res?.success) setCareerLevels(res.data || []);
        });

        dispatch(FunctionalAria()).unwrap().then(res => {
            if (res?.success) setFunctionalAreas(res.data || []);
        });

        dispatch(Industries()).unwrap().then(res => {
            if (res?.success) setIndustryOptions(res.data || []);
        });

        dispatch(Currencies()).unwrap().then(res => {
            if (res?.success) setCurrencies(res.data || []);
        });
    }, [dispatch]);

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleCountryChange = (countryId: any) => {
        setFormData(prev => ({ ...prev, countryId, stateId: 0, cityId: 0 }));
        setStates([]);
        setCities([]);
        if (countryId) {
            dispatch(GetState({ id: String(countryId) }))
                .unwrap()
                .then(res => {
                    if (res?.success) setStates(res.data || []);
                });
        }
    };

    const handleStateChange = (stateId: any) => {
        setFormData(prev => ({ ...prev, stateId, cityId: 0 }));
        setCities([]);
        if (stateId) {
            dispatch(GetCity({ id: String(stateId) }))
                .unwrap()
                .then(res => {
                    if (res?.success) setCities(res.data || []);
                });
        }
    };

    const normalizeFileUri = (u?: string) => {
        if (!u) return '';
        if (u.startsWith('/')) return `file://${u}`;
        return u;
    };

    const handlePickPhoto = async () => {
        try {
            const [doc] = await pick({
                type: [types.images],
                allowMultiSelection: false,
                mode: 'import',
            });
            if (!doc) return;

            const uri = normalizeFileUri((doc as any).fileCopyUri || doc.uri);
            const fileName = doc.name || `profile_${Date.now()}.${doc.type || 'image/jpeg'}`;
            const file = { uri, name: fileName, type: doc.type || 'image/jpeg' };

            setImageUri(uri);
            setUploadingImage(true);

            const fd = new FormData();
            fd.append('image', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);

            const res: any = await postApiCall('/jobseeker/update-user-media', fd, { as: 'form' });
            if (res?.success) {
                dispatch(ProfileData());
            } else {
                showAlert({
                    title: 'Error',
                    message: res?.message || 'Failed to upload photo',
                });
            }
        } catch (e) {
            console.log('Pick photo error:', e);
        } finally {
            setUploadingImage(false);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSave = async () => {
        if (!formData.firstName.trim()) {
            showAlert({ title: 'Validation', message: 'First name is required.' });
            return;
        }

        if (!formData.bio.trim()) {
            showAlert({ title: 'Validation', message: 'Bio is required.' });
            return;
        }

        if (saving) return;
        setSaving(true);

        try {
            const fullName = `${formData.firstName.trim()}${formData.middleName.trim() ? ' ' + formData.middleName.trim() : ''} ${formData.lastName.trim()}`;

            const payload: any = {
                first_name: formData.firstName.trim(),
                middle_name: formData.middleName.trim(),
                last_name: formData.lastName.trim(),
                name: fullName,
                phone: formData.phone.trim(),
                mobile_num: formData.phone.trim(),
                email: formData.email.trim(),
                national_id_card_number: formData.nationalId.trim(),
                street_address: formData.streetAddress.trim(),
                bio: formData.bio.trim(),
                profile_summary: formData.bio.trim(),
                description: formData.bio.trim(),
                current_salary: formData.currentSalary.trim(),
                expected_salary: formData.expectedSalary.trim(),
            };

            if (formData.genderId) payload.gender_id = formData.genderId;
            if (formData.nationalityId) payload.nationality_id = formData.nationalityId;
            if (formData.countryId) payload.country_id = formData.countryId;
            if (formData.stateId) payload.state_id = formData.stateId;
            if (formData.cityId) payload.city_id = formData.cityId;
            if (formData.jobExperienceId) payload.job_experience_id = formData.jobExperienceId;
            if (formData.careerLevelId) payload.career_level_id = formData.careerLevelId;
            if (formData.functionalAreaId) payload.functional_area_id = formData.functionalAreaId;
            if (formData.workRightId) payload.work_right_id = formData.workRightId;
            if (formData.industryId) payload.industry_id = formData.industryId;
            if (formData.salaryCurrency) payload.salary_currency = formData.salaryCurrency;

            const res: any = await dispatch(Update(payload)).unwrap();
            console.log('Profile update response:', res);

            if (res?.success !== false) {
                showAlert({
                    title: 'Success',
                    message: res?.message || 'Profile updated successfully.',
                });
                dispatch(ProfileData());
                navigation.goBack(); .0
            } else {
                showAlert({
                    title: 'Error',
                    message: res?.message || 'Failed to update profile.',
                });
            }
        } catch (error: any) {
            showAlert({
                title: 'Error',
                message: error?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    <Header
                        title="Edit Profile"
                        subtitle="Update your personal information and preferences."
                    />

                    {/* Profile Section: Avatar & Change Photo */}
                    <View style={styles.avatarSection}>
                        <View
                            style={[
                                styles.avatarWrapper,
                                {
                                    backgroundColor: colors.primary50,
                                    borderColor: colors.surfaces,
                                },
                            ]}
                        >
                            {imageUri ? (
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.initialsText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {getInitials(user?.name)}
                                </Text>
                            )}

                            {uploadingImage && (
                                <View style={styles.imageLoaderOverlay}>
                                    <ActivityIndicator size="small" color={colors.white} />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handlePickPhoto}
                            disabled={uploadingImage}
                            style={[styles.changePhotoButton, { borderColor: colors.primary }]}
                        >
                            <Image
                                source={imagePath.camera}
                                style={{
                                    width: responsiveWidth(4),
                                    height: responsiveWidth(4),
                                    tintColor: colors.primary,
                                    marginRight: responsiveWidth(1.5),
                                    resizeMode: 'contain',
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: responsiveFontSize(1.7),
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}
                            >
                                {uploadingImage ? 'Uploading...' : 'Change Photo'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Inputs */}
                    <View style={styles.formContainer}>
                        {/* First Name */}
                        <InPutWithLabel
                            label="First Name"
                            isRequired={true}
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChangeText={text => handleChange('firstName', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* Middle Name */}
                        <InPutWithLabel
                            label="Middle Name (Optional)"
                            placeholder="Enter middle name"
                            value={formData.middleName}
                            onChangeText={text => handleChange('middleName', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* Last Name */}
                        <InPutWithLabel
                            label="Last Name (Optional)"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChangeText={text => handleChange('lastName', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* Phone Number */}
                        <InPutWithLabel
                            label="Phone Number (Optional)"
                            placeholder="e.g. +61 412 345 678"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={text => handleChange('phone', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* Email */}
                        <InPutWithLabel
                            label="Email Address"
                            placeholder="Enter email address"
                            editable={false}
                            keyboardType="email-address"
                            value={formData.email}
                            onChangeText={text => handleChange('email', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* National ID */}
                        <InPutWithLabel
                            label="National ID Card Number (Optional)"
                            placeholder="Enter national ID card number"
                            value={formData.nationalId}
                            onChangeText={text => handleChange('nationalId', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(1) }}
                        />

                        {/* Gender */}
                        <CustomDropdown
                            label="Gender (Optional)"
                            placeholder="Select Gender"
                            data={genderOptions}
                            selectedValue={formData.genderId}
                            onSelect={val => handleChange('genderId', val)}
                            labelKey="gender"
                            valueKey="id"
                        />

                        {/* Nationality */}
                        <CustomDropdown
                            label="Nationality (Optional)"
                            placeholder="Select Nationality"
                            data={nationalities}
                            selectedValue={formData.nationalityId}
                            onSelect={val => handleChange('nationalityId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Country */}
                        <CustomDropdown
                            label="Country (Optional)"
                            placeholder="Select Country"
                            data={countries}
                            selectedValue={formData.countryId}
                            onSelect={handleCountryChange}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* State */}
                        <CustomDropdown
                            label="State (Optional)"
                            placeholder="Select State"
                            data={states}
                            selectedValue={formData.stateId}
                            onSelect={handleStateChange}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* City */}
                        <CustomDropdown
                            label="City (Optional)"
                            placeholder="Select City"
                            data={cities}
                            selectedValue={formData.cityId}
                            onSelect={val => handleChange('cityId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Street Address */}
                        <InPutWithLabel
                            label="Street Address (Optional)"
                            placeholder="e.g. 123 Collins Street, Melbourne"
                            value={formData.streetAddress}
                            onChangeText={text => handleChange('streetAddress', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1) }}
                        />

                        {/* Bio * */}
                        <View style={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1.5), width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(0.5) }}>
                                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: colors.primary2 }}>
                                    Bio
                                </Text>
                                <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.red, marginLeft: 4 }}>*</Text>
                            </View>
                            <TextInput
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.surfaces,
                                    borderRadius: 15,
                                    paddingHorizontal: responsiveWidth(4),
                                    paddingVertical: responsiveHeight(1.5),
                                    fontSize: responsiveFontSize(1.8),
                                    color: colors.textPrimary,
                                    minHeight: responsiveHeight(12),
                                    textAlignVertical: 'top',
                                }}
                                multiline
                                numberOfLines={4}
                                placeholder="Tell recruiters about yourself, experience, and what roles you are looking for..."
                                placeholderTextColor={colors.placeholder || colors.gray}
                                value={formData.bio}
                                onChangeText={text => handleChange('bio', text)}
                            />
                        </View>

                        {/* Job Experience */}
                        <CustomDropdown
                            label="Job Experience (Optional)"
                            placeholder="Select Job Experience"
                            data={experiences}
                            selectedValue={formData.jobExperienceId}
                            onSelect={val => handleChange('jobExperienceId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Career Level */}
                        <CustomDropdown
                            label="Career Level (Optional)"
                            placeholder="Select Career Level"
                            data={careerLevels}
                            selectedValue={formData.careerLevelId}
                            onSelect={val => handleChange('careerLevelId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Functional Area */}
                        <CustomDropdown
                            label="Functional Area (Optional)"
                            placeholder="Select Functional Area"
                            data={functionalAreas}
                            selectedValue={formData.functionalAreaId}
                            onSelect={val => handleChange('functionalAreaId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Right to work in Australia */}
                        <CustomDropdown
                            label="Right to work in Australia (Optional)"
                            placeholder="Select Work Rights"
                            data={workRights}
                            selectedValue={formData.workRightId}
                            onSelect={val => handleChange('workRightId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Industries */}
                        <CustomDropdown
                            label="Industries (Optional)"
                            placeholder="Select Industry"
                            data={industryOptions}
                            selectedValue={formData.industryId}
                            onSelect={val => handleChange('industryId', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Salary Currency */}
                        <CustomDropdown
                            label="Salary Currency (Optional)"
                            placeholder="Select Currency"
                            data={currencies}
                            selectedValue={formData.salaryCurrency}
                            onSelect={val => handleChange('salaryCurrency', val)}
                            labelKey="name"
                            valueKey="id"
                        />

                        {/* Current Salary */}
                        <InPutWithLabel
                            label="Current Salary (Optional)"
                            placeholder="e.g. 75000"
                            keyboardType="numeric"
                            value={formData.currentSalary}
                            onChangeText={text => handleChange('currentSalary', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1) }}
                        />

                        {/* Expected Salary */}
                        <InPutWithLabel
                            label="Expected Salary (Optional)"
                            placeholder="e.g. 90000"
                            keyboardType="numeric"
                            value={formData.expectedSalary}
                            onChangeText={text => handleChange('expectedSalary', text)}
                            mainColor={colors.primary}
                            secondaryColor={colors.primary2}
                            inputContainerStyle={{ marginBottom: responsiveHeight(2) }}
                        />
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.footerContainer}>
                    <Button
                        label="Save Changes"
                        loading={saving}
                        backgroundColor={colors.primary}
                        onPress={handleSave}
                    />
                </View>
            </KeyboardAvoidingView>
        </NavigationBar>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: responsiveHeight(4),
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(1),
    },
    avatarWrapper: {
        width: responsiveWidth(26),
        height: responsiveWidth(26),
        borderRadius: responsiveWidth(13),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    initialsText: {
        fontSize: responsiveFontSize(3.5),
        fontWeight: '800',
    },
    imageLoaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: responsiveHeight(1.2),
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(0.8),
        borderRadius: 20,
        borderWidth: 1,
    },
    formContainer: {
        width: responsiveWidth(90),
        alignSelf: 'center',
        marginTop: responsiveHeight(1),
    },
    footerContainer: {
        paddingHorizontal: responsiveWidth(5),
        paddingVertical: responsiveHeight(2),
        alignItems: 'center',
    },
});
