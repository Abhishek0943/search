import { ActivityIndicator, Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { routes } from '../../../constants/values'
import { CustomDropdown } from '../../../pages/PersonalInfo/PersonalInfo'
import { useAppDispatch, useAppSelector } from '../../../store'
import { GetCity, GetCountry, GetNumberOfEmployees, GetNumberOfOffices, GetOwnership, GetSkills, GetState, Industries, NumberOfPositions, UpdateProfile3 } from '../../../reducer/jobsReducer'
import { launchImageLibrary } from 'react-native-image-picker'
import Text from '../../../components/Text'
import { useAlert } from '../../../context/AlertContext'
import { RecruiterProfile } from '../../../reducer/recruiterReducer'
import { useNavigation } from '@react-navigation/native'
const Profile = () => {
    const { colors } = useContext(ThemeContext);
    const { user } = useAppSelector(state => state.userStore);
    const editorRef = useRef<any>(null);
    const [skills, setSkills] = useState([]);
    const [numberOfPositions, setNumberOfPositions] = useState([]);
    const [ownership, setOwnership] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [numberOfEmployees, setNumberOfEmployees] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation()
    const [formData, setFormData] = useState({
        companyLogo: null as null | { uri: string; name: string; type: string },
        companyName: '',
        industry: 0,
        ownership: 0,
        description: '',
        noOfOffice: 0,
        noOfEmployees: 0,
        establishedIn: 0,
        phone: '',
        website: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        pinterest: '',
        country: 0,
        state: 0,
        city: 0,
        companyAddress: '',
        hrName: '',
        hrEmail: '',
        hrDesignation: '',
        companyRegistrationNo: '',
    });
    useEffect(() => {
        if (user) {
            editorRef.current.setContentHTML(user.description);
            setFormData({
                companyLogo: user.company_logo ? { uri: user.company_logo, name: 'logo.jpg', type: 'image/jpeg' } : null,
                companyName: user.name || '',
                industry: user.industry_id || 0,
                ownership: user.ownership_type_id || 0,
                description: user.description || '',
                noOfOffice: user.no_of_offices || 0,
                noOfEmployees: user.no_of_employees || 0,
                establishedIn: user.established_in || 0,
                phone: user.phone || '',
                website: user.website || '',
                facebook: user.facebook || '',
                twitter: user.twitter || '',
                linkedin: user.linkedin || '',
                pinterest: user.pinterest || '',
                country: user.country || 0,
                state: user.state || 0,
                city: user.city || 0,
                companyAddress: user.company_address || '',
                hrName: user.contact_name || '',
                hrEmail: user.contact_email || '',
                hrDesignation: user.ceo || '',
                companyRegistrationNo: user.registration_number || '',
            });
            if (user.country) {
                dispatch(GetState({ id: user.country }))
                    .unwrap()
                    .then(res => {
                        res.success && setStates(res.data)
                    });
            }
            if (user.state
            ) {
                dispatch(GetCity({
                    id: user.state
                }))
                    .unwrap()
                    .then(res => {
                        res.success && setCities(res.data)
                    });
            }
        }
    }, [user]);
    const onSubmit = () => {
        const formDataToSend = new FormData();
        const apiFormData = {
            logo: formData.companyLogo,
            name: formData.companyName,
            industry_id: formData.industry,
            ownership_type_id: formData.ownership,
            description: formData.description,
            no_of_offices: formData.noOfOffice,
            no_of_employees: formData.noOfEmployees,
            established_in: formData.establishedIn,
            phone: formData.phone,
            country_id: formData.country,
            state_id: formData.state,
            city_id: formData.city,
            website: formData.website,
            facebook: formData.facebook,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            pinterest: formData.pinterest,
            map: formData.companyAddress,
            contact_name: formData.hrName,
            contact_email: formData.hrEmail,
            ceo: formData.hrDesignation,
            registration_number: formData.companyRegistrationNo,
        };
        const requiredFields = [
            //   { key: "companyLogo", label: "Company Logo" },
            { key: "companyName", label: "Company Name" },
            { key: "industry", label: "Industry" },
            { key: "ownership", label: "Ownership Type" },
            { key: "description", label: "Company Description" },
            { key: "phone", label: "Phone Number" },
            { key: "country", label: "Country" },
            { key: "state", label: "State" },
            { key: "city", label: "City" },
            { key: "companyAddress", label: "Company Address" },
        ];
        const validateForm = () => {
            for (let field of requiredFields) {
                if (!formData[field.key] || String(formData[field.key]).trim() === "") {
                    showAlert({
                        title: "Missing Information",
                        message: `Please enter ${field.label} to continue.`,
                    });
                    return false;
                }
            }
            return true;
        };
        if (!validateForm()) return;
        Object.entries(apiFormData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'logo' && value) {
                    formDataToSend.append(key, {
                        uri: value.uri,
                        name: value.name,
                        type: value.type,
                    } as any);
                } else {
                    formDataToSend.append(key, String(value));
                }
            }
        }

        )
        setLoading(true)
        dispatch(UpdateProfile3(formDataToSend))
            .unwrap()
            .then(res => {

                if (res?.success) {
                    showAlert({
                        title: "Success",
                        message: "Profile updated successfully",
                    });
                    dispatch(RecruiterProfile()).unwrap().then((res)=>res.success&& navigation.goBack())
                } else {
                    showAlert({
                        title: "Validation",
                        message: res.message,
                    });
                }
                setLoading(false)

            })
            .catch(() => {
                showAlert({
                    title: "Error",
                    message: "Failed to update profile",
                });
                setLoading(false)

            });

    }
    const handleChange = (key: string, value: any) => {
        setFormData(prev => {
            if (key === 'country' && value !== prev.country) {
                return { ...prev, country: value, state: 0, city: 0 };
            }
            if (key === 'state' && value !== prev.state) {
                return { ...prev, state: value, city: 0 };
            }
            return { ...prev, [key]: value };
        });
    };

    const inputStyle = {
        borderWidth: 1,
        width: '100%',
        borderRadius: 6,
        borderColor: colors.mediumGray,
        color: colors.textPrimary,
        paddingHorizontal: responsiveScreenWidth(3),
        fontSize: responsiveScreenFontSize(1.8),
        paddingVertical: responsiveScreenHeight(1.3),
        marginTop: responsiveScreenHeight(1),
    } as const;
    const pickImage = async () => {
        const res = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.8,
        });

        if (res.didCancel) return;

        const asset = res.assets?.[0];
        if (!asset?.uri) return;

        const fileName =
            asset.fileName ||
            `company_${Date.now()}.${asset.type?.includes('png') ? 'png' : 'jpg'}`;
        setFormData(prev => ({
            ...prev,
            companyLogo: {
                uri: asset.uri,
                name: fileName,
                type: asset.type || 'image/jpeg',
            },
        }));
    };
    const startYear = 1918;
    const currentYear = new Date().getFullYear(); // e.g. 2025
    const establishedYearListFromApi = Array.from(
        { length: currentYear - startYear + 1 },
        (_, idx) => {
            const year = startYear + idx;
            return {
                id: String(year),
                name: String(year),
            };
        }
    );
    const onSelectCountry = (val: number) => {
        handleChange('country', val);
        setStates([]);
        setCities([]);

        dispatch(GetState({ id: val }))
            .unwrap()
            .then(res => {
                if (res?.success) setStates(res.data || []);
            });
    };

    const onSelectState = (val: number) => {
        handleChange('state', val);
        setCities([]);

        dispatch(GetCity({ id: val }))
            .unwrap()
            .then(res => {
                if (res?.success) setCities(res.data || []);
            });
    };

    useEffect(() => {
        dispatch(GetSkills())
            .unwrap()
            .then(res => {
                if (res?.success) setSkills(res.data || []);
            })
            .catch(() => { });

        dispatch(GetCountry())
            .unwrap()
            .then(res => {
                if (res?.success) setCountries(res.data || []);
            })
            .catch(() => { });

        dispatch(Industries())
            .unwrap()
            .then(res => {
                if (res?.success) setIndustries(res.data || []);
            })
            .catch(() => { });
        dispatch(GetOwnership({}))
            .unwrap()
            .then(res => {
                if (res?.success) setOwnership(res.data || []);
            })
            .catch(() => { });
        dispatch(GetNumberOfOffices({}))
            .unwrap()
            .then(res => {
                if (res?.success) setNumberOfPositions(res.data || []);
            })
            .catch(() => { });
        dispatch(GetNumberOfEmployees({}))
            .unwrap()
            .then(res => {
                if (res?.success) setNumberOfEmployees(res.data || []);
            })
            .catch(() => { });

    }, []);

    const Label = ({ text, require= true }: { text: string }) => (
        <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
            <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
                {text}
            </Text>
            {require && <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>}
        </View>
    );

    return (
        <NavigationBar name={routes.RECRUITERPROFILE}>
            <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={0} style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        width: responsiveScreenWidth(90),
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
                        <Text
                            style={{
                                flex: 1,
                                textAlign: 'left',
                                fontSize: responsiveScreenFontSize(2),
                                color: colors.textPrimary,
                                fontWeight: '800',
                            }}
                        >
                            Profile
                        </Text>

                        <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
                    </View>

                    <Label text="Company Logo" require={false} />
                    <Pressable
                        onPress={pickImage}
                        style={{ width: '100%', aspectRatio: 2.44, marginTop: responsiveScreenHeight(1) }}
                    >
                        <Image
                            source={imagePath.imageInput}
                            style={{ height: '100%', width: '100%' }}
                        />

                        {formData.companyLogo?.uri ? (
                            <View
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    bottom: 10,
                                    height: 44,
                                    width: 44,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    borderWidth: 1,
                                    borderColor: colors.mediumGray,
                                }}
                            >
                                <Image
                                    source={{ uri: formData.companyLogo.uri }}
                                    style={{ height: '100%', width: '100%' }}
                                />
                            </View>
                        ) : null}
                    </Pressable>

                    <Label text="Company Name" />
                    <TextInput
                        // 🟢 fixed
                        value={formData.companyName}
                        onChangeText={t => handleChange('companyName', t)}
                        style={inputStyle}
                        placeholderTextColor={colors.gray}
                        placeholder="e.g., ABC Pvt Ltd"
                    />

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="Industry" />
                            <CustomDropdown
                                data={industries}
                                placeholder="Select"
                                selectedValue={formData.industry}
                                onSelect={(val: number) => handleChange('industry', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Ownership" />
                            <CustomDropdown
                                data={ownership}
                                placeholder="Select"
                                selectedValue={formData.ownership}
                                onSelect={(val: number) => handleChange('ownership', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>
                    </View>

                    <Label text="Description" />
                    <View style={[{ width: "100%", minHeight: responsiveScreenHeight(20) }, { ...inputStyle, paddingHorizontal: 0, paddingVertical: 0 }]}>
                        <RichEditor
                            ref={editorRef}
                                      initialContentHTML={user?.description}
                            placeholder="Write company description here..."
                            onChange={html => handleChange('description', html)}
                            editorStyle={{}}
                        />
                    </View>
                    {!!editorRef.current ? (
                        <RichToolbar
                            editor={editorRef}
                            actions={[
                                actions.setBold,
                                actions.setItalic,
                                actions.insertBulletsList,
                                actions.insertOrderedList,
                            ]}
                        />
                    ) : null}

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="No of Office" require={false} />
                            <CustomDropdown
                                data={numberOfPositions}
                                placeholder="Select"
                                selectedValue={formData.noOfOffice}
                                onSelect={(val: number) => handleChange('noOfOffice', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="No of Employees" require={false}/>
                            <CustomDropdown
                                data={numberOfEmployees}
                                placeholder="Select"
                                selectedValue={formData.noOfEmployees}
                                onSelect={(val: number) => handleChange('noOfEmployees', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="Established In" require={false} />
                            <CustomDropdown
                                data={establishedYearListFromApi}
                                placeholder="Select"
                                selectedValue={formData.establishedIn}
                                onSelect={(val: number) => handleChange('establishedIn', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Phone" />
                            <TextInput
                                value={formData.phone}
                                onChangeText={t => handleChange('phone', t)}
                                style={inputStyle}
                                maxLength={10}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., +91 9876543210"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <Label text="Website URL" require={false}/>
                    <TextInput
                        value={formData.website}
                        onChangeText={t => handleChange('website', t)}
                        style={inputStyle}
                        placeholderTextColor={colors.gray}
                        placeholder="e.g., https://example.com"
                        autoCapitalize="none"
                    />

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="Facebook" require={false}/>
                            <TextInput
                                value={formData.facebook}
                                onChangeText={t => handleChange('facebook', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., https://facebook.com/yourpage"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Twitter" require={false}/>
                            <TextInput
                                value={formData.twitter}
                                onChangeText={t => handleChange('twitter', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., https://twitter.com/yourhandle"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="LinkedIn"require={false} />
                            <TextInput
                                value={formData.linkedin}
                                onChangeText={t => handleChange('linkedin', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., https://linkedin.com/company/xyz"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Pinterest" require={false}/>
                            <TextInput
                                value={formData.pinterest}
                                onChangeText={t => handleChange('pinterest', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., https://pinterest.com/xyz"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <Label text="Country" />
                    <CustomDropdown
                        data={countries}
                        placeholder="Select"
                        selectedValue={formData.country}
                        onSelect={onSelectCountry}
                        labelKey="name"
                        valueKey="id"
                    />

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="State" />
                            <CustomDropdown
                                data={states}
                                placeholder="Select"
                                selectedValue={formData.state}
                                onSelect={onSelectState}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="City" />
                            <CustomDropdown
                                data={cities}
                                placeholder="Select"
                                selectedValue={formData.city}
                                onSelect={(val: number) => handleChange('city', val)}
                                labelKey="name"
                                valueKey="id"
                            />
                        </View>
                    </View>

                    <Label text="Company Address" />
                    <TextInput
                        // 🟢 fixed
                        value={formData.companyAddress}
                        onChangeText={t => handleChange('companyAddress', t)}
                        style={inputStyle}
                        placeholderTextColor={colors.gray}
                        placeholder="e.g., Building, Street, Area"
                    />

                    <View style={{ width: responsiveScreenWidth(100), borderTopColor: colors.surfaces, borderTopWidth: 1, marginTop: responsiveScreenHeight(3), }}></View>

                    <Text style={{ alignSelf: 'flex-start', marginTop: responsiveScreenHeight(2), fontSize: responsiveScreenFontSize(2), fontWeight: '600', color: colors.textPrimary }}>
                        HR Person Information
                    </Text>

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="Name" require={false}/>
                            <TextInput
                                // 🟢 fixed
                                value={formData.hrName}
                                onChangeText={t => handleChange('hrName', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., Rahul Sharma"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Email" require={false}/>
                            <TextInput
                                // 🟢 fixed
                                value={formData.hrEmail}
                                onChangeText={t => handleChange('hrEmail', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., hr@company.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                            <Label text="Designation" require={false}/>
                            <TextInput
                                // 🟢 fixed
                                value={formData.hrDesignation}
                                onChangeText={t => handleChange('hrDesignation', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., HR Manager"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Label text="Company Registration no" require={false}/>
                            <TextInput
                                // 🟢 fixed
                                value={formData.companyRegistrationNo}
                                onChangeText={t => handleChange('companyRegistrationNo', t)}
                                style={inputStyle}
                                placeholderTextColor={colors.gray}
                                placeholder="e.g., CIN / Reg No"
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={onSubmit}
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: responsiveScreenHeight(2),
                            borderRadius: 12,
                            gap: responsiveScreenWidth(1),
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.primary,
                            paddingHorizontal: responsiveScreenWidth(3),
                            paddingVertical: responsiveScreenHeight(1.5),
                        }}
                    >
                        {
                            loading ? <ActivityIndicator style={{}} color={"white"} /> :
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                                    Update and Save Profile
                                </Text>
                        }
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

        </NavigationBar>
    );
};


export default Profile

const styles = StyleSheet.create({})