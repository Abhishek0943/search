import { Image, Pressable, ScrollView, StyleSheet,  TextInput, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { useNavigation } from '@react-navigation/native'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { routes } from '../../../constants/values'
import { CustomDropdown } from '../../../pages/PersonalInfo/PersonalInfo'
import { useAppDispatch } from '../../../store'
import { Currencies, GetCity, GetCountry, GetSkills, GetState } from '../../../reducer/jobsReducer'
import { launchImageLibrary } from 'react-native-image-picker'
import Text from '../../../components/Text'
const Profile = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const editorRef = useRef<null>(null);
    const benefitsRef = useRef<null>(null);
    const [description, setDescription] = useState("")
    const [ready, setReady] = useState(false);
    const [skills, setSkills] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [countries, setCountries] = useState([]);
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        experienceTitle: '',
        company: '',
        country: 0,
        state: 0,
        city: 0,

        startDate: new Date(),
        endDate: new Date(),
        currentlyWorking: false,

        description: '',
    });
    const handleChange = (key: string, value: any) => {
        setFormData(prev => {
            if (key === 'country' && value !== prev.country) {
                return { ...prev, country: value, state: 0, city: 0 };
            }
            if (key === 'state' && value !== prev.state) {
                return { ...prev, state: value, city: 0 };
            }
            if (key === 'currentlyWorking' && value === true) {
                return { ...prev, currentlyWorking: true };
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
            `project_${Date.now()}.${asset.type?.includes('png') ? 'png' : 'jpg'}`;

        setFormData(prev => ({
            ...prev,
            image: {
                uri: asset.uri,
                name: fileName,
                type: asset.type || 'image/jpeg',
            },
        }));
    };
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
        dispatch(Currencies())
            .unwrap()
            .then(res => {
                if (res?.success) setCurrencies(res.data || []);
            })
            .catch(() => { });
    }, []);
    const Label = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
            <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
                {text}
            </Text>
            <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
        </View>
    );
    return (
        <NavigationBar name={routes.PROFILE}>
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
                    {/* Invisible icon to balance layout */}
                    <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
                </View>
                <Label text="Company Logo" />
                <Pressable
                    onPress={pickImage}
                    style={{ width: '100%', aspectRatio: 2.44, marginTop: responsiveScreenHeight(1) }}
                >
                    <Image
                        source={imagePath.imageInput}
                        style={{ height: '100%', width: '100%' }}
                    />

                    {formData.image?.uri ? (
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
                            <Image source={{ uri: formData.image.uri }} style={{ height: '100%', width: '100%' }} />
                        </View>
                    ) : null}
                </Pressable>
                <Label text="Company Name" />
                <TextInput
                    value={formData.jobTitle}
                    onChangeText={t => handleChange('jobTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="e.g., React Native Developer"
                />
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Industry" />
                        <CustomDropdown
                            // data={states}
                            placeholder="Select"
                            selectedValue={formData.state}
                            // onSelect={onSelectState}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Ownership" />
                        <CustomDropdown
                            // data={cities}
                            placeholder="Select"
                            selectedValue={formData.city}
                            onSelect={(val: number) => handleChange('city', val)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                </View>
                <Label text="Description" />
                <View style={[{ width: "100%", minHeight: responsiveScreenHeight(20) }, { ...inputStyle, paddingHorizontal: 0, paddingVertical: 0 }]}>
                    <RichEditor
                        ref={editorRef}
                        placeholder="Write job description here..."
                        onChange={html => setFormData({ description: html })}
                        editorStyle={{}}
                    />
                </View>
                {editorRef.current ? (
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
                        <Label text="No of Office" />
                        <CustomDropdown
                            // data={states}
                            placeholder="Select"
                            selectedValue={formData.state}
                            // onSelect={onSelectState}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="No of Employees" />
                        <CustomDropdown
                            // data={cities}
                            placeholder="Select"
                            selectedValue={formData.city}
                            onSelect={(val: number) => handleChange('city', val)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                </View>

                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Established In" />
                        <CustomDropdown
                            // data={states}
                            placeholder="Select"
                            selectedValue={formData.state}
                            // onSelect={onSelectState}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Phone" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>
                </View>
                <Label text="Website URL" />
                <TextInput
                    value={formData.jobTitle}
                    onChangeText={t => handleChange('jobTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="e.g., React Native Developer"
                />

                {/* State / City */}
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Facebook" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Twitter" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="LinkedIn" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Pinterest" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
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

                {/* State / City */}
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
                    value={formData.jobTitle}
                    onChangeText={t => handleChange('jobTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="e.g., React Native Developer"
                />


                <View style={{ width: responsiveScreenWidth(100), borderTopColor: colors.surfaces, borderTopWidth: 1, marginTop: responsiveScreenHeight(3), }}></View>
                <Text style={{ alignSelf: 'flex-start', marginTop: responsiveScreenHeight(2), fontSize: responsiveScreenFontSize(2), fontWeight: '600', color: colors.textPrimary }}>HR Person Information</Text>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Name" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Email" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Designation" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Company Registration no" />
                        <TextInput
                            value={formData.jobTitle}
                            onChangeText={t => handleChange('jobTitle', t)}
                            style={inputStyle}
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., React Native Developer"
                        />
                    </View>
                </View>


                <Pressable
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
                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                        Update and Save Profile
                    </Text>
                </Pressable>
            </ScrollView>
        </NavigationBar>
    )
}

export default Profile

const styles = StyleSheet.create({})