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
            // editorRef.current.setContentHTML(user.description);
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
    const onSubmit = async () => {
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
                    dispatch(RecruiterProfile()).unwrap().then((res) => res.success && navigation.goBack())
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
        fontWeight: '500',
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

    const Label = ({ text, require = true }: { text: string }) => (
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
                        ) : <View
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
                                source={{ uri: user.logo }}
                                style={{ height: '100%', width: '100%' }}
                            />
                        </View>}

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
                    <View style={[{ width: "100%", minHeight: responsiveScreenHeight(40) }, { ...inputStyle, paddingHorizontal: 0, paddingVertical: 0 }]}>
                        <Editor initialContent={formData.description} onChange={(html: string) => handleChange('description', html)} />
                    </View>

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
                            <Label text="No of Employees" require={false} />
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

                    <Label text="Website URL" require={false} />
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
                            <Label text="Facebook" require={false} />
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
                            <Label text="Twitter" require={false} />
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
                            <Label text="LinkedIn" require={false} />
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
                            <Label text="Pinterest" require={false} />
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
                            <Label text="Name" require={false} />
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
                            <Label text="Email" require={false} />
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
                            <Label text="Designation" require={false} />
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
                            <Label text="Company Registration no" require={false} />
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
type BlockType = 'paragraph' | 'h1' | 'bullet';

interface TextSegment {
    text: string;
    bold: boolean;
}

interface Block {
    id: string;
    type: BlockType;
    segments: TextSegment[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getPlainText = (segments: TextSegment[]): string =>
    segments.map(s => s.text).join('');

const segmentsToJson = (segments: TextSegment[]): any[] =>
    segments
        .filter(s => s.text.length > 0)
        .map(s => {
            const node: any = { type: 'text', text: s.text };
            if (s.bold) {
                node.marks = [{ type: 'strong' }];
            }
            return node;
        });

const blockToJson = (block: Block): any => {
    const content = segmentsToJson(block.segments);
    switch (block.type) {
        case 'h1':
            return { type: 'heading', attrs: { level: 1 }, ...(content.length > 0 ? { content } : {}) };
        case 'bullet':
            return {
                type: 'listItem',
                content: [{ type: 'paragraph', ...(content.length > 0 ? { content } : {}) }],
            };
        default:
            return { type: 'paragraph', ...(content.length > 0 ? { content } : {}) };
    }
};

const blocksToJson = (blocks: Block[]): string => {
    const result: any[] = [];
    let bulletItems: any[] = [];

    blocks.forEach((block) => {
        if (block.type === 'bullet') {
            bulletItems.push(blockToJson(block));
        } else {
            if (bulletItems.length > 0) {
                result.push({ type: 'bulletList', content: bulletItems });
                bulletItems = [];
            }
            result.push(blockToJson(block));
        }
    });
    if (bulletItems.length > 0) {
        result.push({ type: 'bulletList', content: bulletItems });
    }

    return JSON.stringify({ content: result });
};

// Parse JSON string back into Block[] for Editor initialization
const jsonToBlocks = (json: string): Block[] => {
    try {
        const data = JSON.parse(json);
        const content = data?.content || [];
        const blocks: Block[] = [];

        const parseTextNodes = (nodes: any[]): TextSegment[] => {
            if (!nodes || nodes.length === 0) return [{ text: '', bold: false }];
            return nodes
                .filter((n: any) => n.type === 'text')
                .map((n: any) => ({
                    text: n.text || '',
                    bold: n.marks?.some((m: any) => m.type === 'strong') || false,
                }));
        };

        for (const node of content) {
            switch (node.type) {
                case 'heading':
                    blocks.push({
                        id: generateId(),
                        type: 'h1',
                        segments: parseTextNodes(node.content),
                    });
                    break;
                case 'paragraph':
                    blocks.push({
                        id: generateId(),
                        type: 'paragraph',
                        segments: parseTextNodes(node.content),
                    });
                    break;
                case 'bulletList':
                    if (node.content) {
                        for (const listItem of node.content) {
                            const para = listItem.content?.[0];
                            blocks.push({
                                id: generateId(),
                                type: 'bullet',
                                segments: parseTextNodes(para?.content),
                            });
                        }
                    }
                    break;
            }
        }

        return blocks.length > 0 ? blocks : [{ id: generateId(), type: 'paragraph', segments: [{ text: '', bold: false }] }];
    } catch {
        return [{ id: generateId(), type: 'paragraph', segments: [{ text: '', bold: false }] }];
    }
};

// Merge adjacent segments with same bold state
const mergeSegments = (segments: TextSegment[]): TextSegment[] => {
    if (segments.length === 0) return [{ text: '', bold: false }];
    const merged: TextSegment[] = [{ ...segments[0] }];
    for (let i = 1; i < segments.length; i++) {
        const last = merged[merged.length - 1];
        if (last.bold === segments[i].bold) {
            last.text += segments[i].text;
        } else if (segments[i].text.length > 0) {
            merged.push({ ...segments[i] });
        }
    }
    return merged.filter(s => s.text.length > 0).length > 0
        ? merged.filter(s => s.text.length > 0)
        : [{ text: '', bold: false }];
};

// Toggle bold on a range within segments
const toggleBoldRange = (segments: TextSegment[], start: number, end: number): TextSegment[] => {
    if (start === end) return segments;

    const plainText = getPlainText(segments);
    const selectedText = plainText.substring(start, end);

    // Check if all selected text is already bold
    let allBold = true;
    let pos = 0;
    for (const seg of segments) {
        const segStart = pos;
        const segEnd = pos + seg.text.length;
        const overlapStart = Math.max(segStart, start);
        const overlapEnd = Math.min(segEnd, end);
        if (overlapStart < overlapEnd && !seg.bold) {
            allBold = false;
            break;
        }
        pos += seg.text.length;
    }

    const newBold = !allBold;

    // Split segments at selection boundaries and set bold
    const result: TextSegment[] = [];
    pos = 0;
    for (const seg of segments) {
        const segStart = pos;
        const segEnd = pos + seg.text.length;

        if (segEnd <= start || segStart >= end) {
            // Fully outside selection
            result.push({ ...seg });
        } else {
            // Before selection
            if (segStart < start) {
                result.push({ text: seg.text.substring(0, start - segStart), bold: seg.bold });
            }
            // Inside selection
            const overlapStart = Math.max(0, start - segStart);
            const overlapEnd = Math.min(seg.text.length, end - segStart);
            result.push({ text: seg.text.substring(overlapStart, overlapEnd), bold: newBold });
            // After selection
            if (segEnd > end) {
                result.push({ text: seg.text.substring(end - segStart), bold: seg.bold });
            }
        }
        pos += seg.text.length;
    }

    return mergeSegments(result);
};

// Update segments when text changes, preserving bold on unchanged portions
const updateSegmentsWithText = (oldSegments: TextSegment[], newText: string): TextSegment[] => {
    const oldText = getPlainText(oldSegments);
    if (newText === oldText) return oldSegments;

    // Simple approach: find common prefix and suffix, keep their bold states
    let prefixLen = 0;
    while (prefixLen < oldText.length && prefixLen < newText.length && oldText[prefixLen] === newText[prefixLen]) {
        prefixLen++;
    }
    let oldSuffixStart = oldText.length;
    let newSuffixStart = newText.length;
    while (oldSuffixStart > prefixLen && newSuffixStart > prefixLen && oldText[oldSuffixStart - 1] === newText[newSuffixStart - 1]) {
        oldSuffixStart--;
        newSuffixStart--;
    }

    // Build new segments: prefix (keep bold) + changed middle (not bold) + suffix (keep bold)
    const result: TextSegment[] = [];
    let pos = 0;

    // Copy segments for prefix
    for (const seg of oldSegments) {
        const segStart = pos;
        const segEnd = pos + seg.text.length;
        if (segEnd <= prefixLen) {
            result.push({ ...seg });
        } else if (segStart < prefixLen) {
            result.push({ text: seg.text.substring(0, prefixLen - segStart), bold: seg.bold });
        }
        pos += seg.text.length;
    }

    // Add changed middle portion (not bold)
    const middleText = newText.substring(prefixLen, newSuffixStart);
    if (middleText.length > 0) {
        // Try to inherit bold state from the segment at this position
        let boldAtPos = false;
        let p = 0;
        for (const seg of oldSegments) {
            if (p + seg.text.length > prefixLen) {
                boldAtPos = seg.bold;
                break;
            }
            p += seg.text.length;
        }
        result.push({ text: middleText, bold: boldAtPos });
    }

    // Copy segments for suffix
    pos = 0;
    for (const seg of oldSegments) {
        const segStart = pos;
        const segEnd = pos + seg.text.length;
        if (segStart >= oldSuffixStart) {
            result.push({ ...seg });
        } else if (segEnd > oldSuffixStart) {
            result.push({ text: seg.text.substring(oldSuffixStart - segStart), bold: seg.bold });
        }
        pos += seg.text.length;
    }

    return mergeSegments(result);
};

const Editor = ({ onChange, initialContent }: { onChange?: (html: string) => void; initialContent?: string }) => {
    const { colors } = useContext(ThemeContext);
    const [blocks, setBlocks] = useState<Block[]>(() => {
        if (initialContent) {
            return jsonToBlocks(initialContent);
        }
        return [{ id: generateId(), type: 'paragraph', segments: [{ text: '', bold: false }] }];
    });
    const [activeBlockId, setActiveBlockId] = useState<string>(blocks[0].id);
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
    const inputRefs = useRef<Record<string, TextInput | null>>({});

    const activeBlock = blocks.find(b => b.id === activeBlockId);
    const hasSelection = selection.start !== selection.end;
    const isParagraph = activeBlock?.type === 'paragraph';

    const updateBlocks = (newBlocks: Block[]) => {
        setBlocks(newBlocks);
        onChange?.(blocksToJson(newBlocks));
    };

    const handleTextChange = (id: string, newText: string) => {
        const newBlocks = blocks.map(b => {
            if (b.id !== id) return b;
            return { ...b, segments: updateSegmentsWithText(b.segments, newText) };
        });
        updateBlocks(newBlocks);
    };

    const handleKeyPress = (id: string, e: any) => {
        const key = e.nativeEvent.key;
        const blockIndex = blocks.findIndex(b => b.id === id);
        const block = blocks[blockIndex];
        const plainText = getPlainText(block.segments);

        if (key === 'Backspace' && plainText === '' && blocks.length > 1) {
            const newBlocks = blocks.filter(b => b.id !== id);
            updateBlocks(newBlocks);
            const prevBlock = newBlocks[Math.max(0, blockIndex - 1)];
            if (prevBlock) {
                setTimeout(() => inputRefs.current[prevBlock.id]?.focus(), 50);
                setActiveBlockId(prevBlock.id);
            }
        }
    };

    const handleSubmitEditing = (id: string) => {
        const blockIndex = blocks.findIndex(b => b.id === id);
        const currentBlock = blocks[blockIndex];
        const newBlock: Block = {
            id: generateId(),
            type: currentBlock.type === 'bullet' ? 'bullet' : 'paragraph',
            segments: [{ text: '', bold: false }],
        };
        const newBlocks = [...blocks];
        newBlocks.splice(blockIndex + 1, 0, newBlock);
        updateBlocks(newBlocks);
        setActiveBlockId(newBlock.id);
        setTimeout(() => inputRefs.current[newBlock.id]?.focus(), 50);
    };

    const setBlockType = (type: BlockType) => {
        if (!activeBlockId) return;
        const newBlocks = blocks.map(b =>
            b.id === activeBlockId ? { ...b, type } : b
        );
        updateBlocks(newBlocks);
    };

    const toggleBold = () => {
        if (!activeBlockId || !isParagraph) return;
        const block = blocks.find(b => b.id === activeBlockId);
        if (!block) return;

        if (hasSelection) {
            // Bold only the selected text range
            const newSegments = toggleBoldRange(block.segments, selection.start, selection.end);
            const newBlocks = blocks.map(b =>
                b.id === activeBlockId ? { ...b, segments: newSegments } : b
            );
            updateBlocks(newBlocks);
        } else {
            // No selection — toggle bold on entire block
            const allBold = block.segments.every(s => s.bold);
            const newSegments = block.segments.map(s => ({ ...s, bold: !allBold }));
            const newBlocks = blocks.map(b =>
                b.id === activeBlockId ? { ...b, segments: mergeSegments(newSegments) } : b
            );
            updateBlocks(newBlocks);
        }
    };

    const getBlockStyle = (block: Block) => {
        const base: any = {
            color: colors.textPrimary || '#000',
            flex: 1,
            paddingVertical: 4,
            paddingHorizontal: responsiveScreenWidth(3),
            fontSize: responsiveScreenFontSize(1.8),
        };
        if (block.type === 'h1') {
            base.fontSize = responsiveScreenFontSize(2);
            base.fontWeight = 'bold';
        }
        return base;
    };

    // Toolbar buttons — Bold only visible for paragraph
    const toolbarButtons: { label: string; type?: BlockType; isBoldToggle?: boolean }[] = [
        { label: 'H', type: 'h1' },
        { label: '¶', type: 'paragraph' },
        ...(isParagraph ? [{ label: 'B', isBoldToggle: true }] : []),
        { label: 'Li', type: 'bullet' },
    ];

    // Check if Bold button should appear active
    const isBoldActive = (() => {
        if (!activeBlock || !isParagraph) return false;
        if (hasSelection) {
            // Check if selected range is all bold
            const plainText = getPlainText(activeBlock.segments);
            let pos = 0;
            for (const seg of activeBlock.segments) {
                const segStart = pos;
                const segEnd = pos + seg.text.length;
                const overlapStart = Math.max(segStart, selection.start);
                const overlapEnd = Math.min(segEnd, selection.end);
                if (overlapStart < overlapEnd && !seg.bold) return false;
                pos += seg.text.length;
            }
            return true;
        }
        return activeBlock.segments.every(s => s.bold);
    })();

    return (
        <View style={{ flex: 1, minHeight: responsiveScreenHeight(20) }}>
            <View style={{
                flexDirection: 'row',
                backgroundColor: colors.lightGrayNatural || '#f5f5f5',
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.mediumGray || '#ddd',
                paddingVertical: 6,
                paddingHorizontal: 4,
                gap: 2,
            }}>
                {toolbarButtons.map((btn) => {
                    const isActive = btn.isBoldToggle
                        ? isBoldActive
                        : activeBlock?.type === btn.type;
                    return (
                        <Pressable
                            key={btn.label}
                            onPress={() => btn.isBoldToggle ? toggleBold() : setBlockType(btn.type!)}
                            style={{
                                paddingHorizontal: responsiveScreenWidth(2.5),
                                paddingVertical: 6,
                                borderRadius: 4,
                                backgroundColor: isActive ? (colors.primary || '#2096F3') : 'transparent',
                            }}
                        >
                            <Text style={{
                                color: isActive ? '#fff' : (colors.textPrimary || '#333'),
                                fontWeight: 'bold',
                                fontSize: responsiveScreenFontSize(1.4),
                            }}>
                                {btn.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={{ flex: 1, paddingVertical: 8 }}>
                {blocks.map((block, index) => (
                    <View key={block.id} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {block.type === 'bullet' && (
                            <Text style={{
                                color: colors.textPrimary || '#000',
                                fontSize: responsiveScreenFontSize(1.8),
                                paddingLeft: responsiveScreenWidth(3),
                                paddingTop: 6,
                            }}>•  </Text>
                        )}
                        <View style={{ flex: 1, position: 'relative' }}>
                            {/* Formatted overlay — shows bold styling visually */}
                            {block.type === 'paragraph' && block.segments.some(s => s.bold) && (
                                <View pointerEvents="none" style={[
                                    getBlockStyle(block),
                                    { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
                                    (block.type === 'bullet') && { paddingLeft: 0 },
                                ]}>
                                    <Text>
                                        {block.segments.map((seg, i) => (
                                            <Text
                                                key={i}
                                                style={{
                                                    fontWeight: seg.bold ? 'bold' : 'normal',
                                                    color: colors.textPrimary || '#000',
                                                    fontSize: getBlockStyle(block).fontSize,
                                                }}
                                            >
                                                {seg.text}
                                            </Text>
                                        ))}
                                    </Text>
                                </View>
                            )}
                            {/* Actual TextInput for editing */}
                            <TextInput
                                ref={(ref) => { inputRefs.current[block.id] = ref; }}
                                style={[
                                    getBlockStyle(block),
                                    (block.type === 'bullet') && { paddingLeft: 0 },
                                    // Make text transparent when overlay is active
                                    (block.type === 'paragraph' && block.segments.some(s => s.bold)) && { opacity: 0 },
                                ]}
                                value={getPlainText(block.segments)}
                                onChangeText={(text) => handleTextChange(block.id, text)}
                                onFocus={() => setActiveBlockId(block.id)}
                                onKeyPress={(e) => handleKeyPress(block.id, e)}
                                onSubmitEditing={() => handleSubmitEditing(block.id)}
                                onSelectionChange={(e) => {
                                    if (block.id === activeBlockId) {
                                        setSelection(e.nativeEvent.selection);
                                    }
                                }}
                                placeholder={index === 0 && blocks.length === 1 ? 'Enter your company description...' : ''}
                                placeholderTextColor={colors.mediumGray || '#999'}
                                blurOnSubmit={false}
                                multiline={false}
                                returnKeyType="next"
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

export const ContentViewer = ({ content, style }: { content: string; style?: any }) => {
    const { colors } = useContext(ThemeContext);
    const parsed = (() => {
        try {
            const data = JSON.parse(content);
            return data?.content || [];
        } catch {
            return [];
        }
    })();

    const renderTextNode = (node: any, index: number) => {
        if (node.type !== 'text') return null;
        const isBold = node.marks?.some((m: any) => m.type === 'strong');
        return (
            <Text
                key={index}
                style={{
                    fontWeight: isBold ? 'bold' : 'normal',
                    color: colors.textPrimary || '#1a1a1a',
                    fontSize: responsiveScreenFontSize(1.8),
                    lineHeight: responsiveScreenHeight(2.8),
                }}
            >
                {node.text}
            </Text>
        );
    };

    const renderBlock = (block: any, index: number) => {
        switch (block.type) {
            case 'heading': {
                return (
                    <View key={index} style={{}}>
                        <Text
                            style={{
                                fontSize: responsiveScreenFontSize(2.1),
                                color: colors.textPrimary || '#1a1a1a',
                                fontWeight: "800"
                            }}
                        >
                            {block.content[0]?.text}
                        </Text>
                    </View>
                );
            }

            case 'paragraph': {
                const isEmpty = !block.content || block.content.length === 0;
                if (isEmpty) {
                    return <View key={index} style={{}} />;
                }
                return (
                    <View key={index} style={{ marginBottom: responsiveScreenHeight(0.5) }}>
                        <Text
                            style={{
                                fontSize: responsiveScreenFontSize(1.8),
                                color: colors.textPrimary || '#1a1a1a',
                                lineHeight: responsiveScreenHeight(2.8),
                            }}
                        >
                            {block.content?.map((child: any, i: number) => renderTextNode(child, i))}
                        </Text>
                    </View>
                );
            }

            case 'bulletList': {
                return (
                    <View key={index} style={{ marginBottom: responsiveScreenHeight(0.8) }}>
                        {block.content?.map((listItem: any, liIndex: number) => (
                            <View
                                key={liIndex}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.textSecondary,
                                        fontSize: responsiveScreenFontSize(3),
                                        lineHeight: responsiveScreenHeight(2.8),
                                        marginRight: responsiveScreenWidth(1),
                                    }}
                                >
                                    •
                                </Text>
                                <View style={{ flex: 1 }}>
                                    {listItem.content?.map((para: any, pIndex: number) => (
                                        <Text
                                            key={pIndex}
                                            style={{
                                                fontSize: responsiveScreenFontSize(1.8),
                                                color: colors.textPrimary || '#1a1a1a',
                                                lineHeight: responsiveScreenHeight(2.8),
                                            }}
                                        >
                                            {para.content[0]?.text}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                );
            }

            default:
                return null;
        }
    };

    if (!content || parsed.length === 0) {
        return (
            <Text
                style={{
                    fontSize: responsiveScreenFontSize(1.7),
                    color: colors.textSecondary || '#999',
                    fontStyle: 'italic',
                    ...style,
                }}
            >
                No description available
            </Text>
        );
    }

    return (
        <View style={[{ paddingVertical: responsiveScreenHeight(0.5) }, style]}>
            {parsed.map((block: any, index: number) => renderBlock(block, index))}
        </View>
    );
};

export default Profile

const styles = StyleSheet.create({})