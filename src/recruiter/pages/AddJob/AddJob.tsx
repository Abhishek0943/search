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
import { Currencies, GetCity, GetCountry, GetSkills, GetState, SalaryPeriods } from '../../../reducer/jobsReducer'
import Text from '../../../components/Text'
const AddJob = () => {
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
    const [salaryPeriods, setSalaryPeriods] = useState([]);
    const [countries, setCountries] = useState([]);
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        experienceTitle: '',
        company: '',
        country: 0,
        state: 0,
        city: 0,
        salaryPeriod: 0,

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
        dispatch(SalaryPeriods())
            .unwrap()
            .then(res => {
                if (res?.success) setSalaryPeriods(res.data || []);
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
        <NavigationBar name={routes.ADDJOB}>
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
                            textTransform: "capitalize"
                        }}
                    >
                        Post a job
                    </Text>
                    {/* Invisible icon to balance layout */}
                    <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain', transform:[{scale:1.1}] }} />
                </View>
                <Label text="Job Details" />
                <TextInput
                    value={formData.jobTitle}
                    onChangeText={t => handleChange('jobTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="e.g., React Native Developer"
                />
                <Label text="Description" />
                <View style={[{ width: "100%", height: responsiveScreenHeight(20) }, { ...inputStyle,  paddingHorizontal:0, paddingVertical:0 }]}>
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
                <Label text="Benefits" />
                <View style={[{ width: "100%", height: responsiveScreenHeight(20) }, { ...inputStyle,  paddingHorizontal:0, paddingVertical:0}]}>

                    <RichEditor
                        ref={benefitsRef}
                        placeholder="Write job benefits here..."
                        onChange={html => setFormData({ benefits: html })}   // ❤️ This HTML goes to API
                        editorStyle={{}}
                    />
                </View>
                {benefitsRef.current ? (
                    <RichToolbar
                        editor={benefitsRef}
                        actions={[
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                        ]}
                    />
                ) : null}
                <Label text="Skills" />
                <CustomDropdown
                    data={skills}
                    placeholder="Select"
                    selectedValue={formData.skills}
                    onSelect={(v: number) => handleChange('skills', v)}
                    labelKey="name"
                    valueKey="id"
                />
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
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Salary" />
                        <TextInput
                            value={formData.salary}
                            onChangeText={t => handleChange('salary', t)}
                            style={inputStyle}
                            keyboardType='number-pad'
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., 10000"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Salary to" />
                        <TextInput
                            value={formData.salaryTo}
                            onChangeText={t => handleChange('salaryTo', t)}
                            style={inputStyle}
                            keyboardType='number-pad'
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., 10000"
                        />
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Currency" />
                        <CustomDropdown
                            data={currencies}
                            placeholder="Select"
                            selectedValue={formData.currency}
                            onSelect={(val: number) => handleChange('currency', val)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Salary Period" />
                        <CustomDropdown
                            data={salaryPeriods}
                            placeholder="Select"
                            selectedValue={formData.salaryPeriod}
                            onSelect={(val: number) => handleChange('salaryPeriod', val)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                </View>
                <View
                    style={{
                        marginTop: responsiveScreenHeight(1.5),
                        width: '100%',
                        borderColor: colors.mediumGray,
                        borderRadius: 6,
                        paddingVertical: responsiveScreenHeight(1.3),
                    }}
                >
                    <Text
                        style={{
                            color: colors.textPrimary,
                            fontSize: responsiveScreenFontSize(1.8),
                            marginBottom: responsiveScreenHeight(1),
                        }}
                    >
                        Hide Salary?
                    </Text>

                    <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                        <Pressable
                            onPress={() => handleChange('currentlyWorking', true)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View
                                style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: 9,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8,
                                }}
                            >
                                {formData.currentlyWorking && (
                                    <View
                                        style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                )}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>Yes</Text>
                        </Pressable>

                        {/* NO */}
                        <Pressable
                            onPress={() => handleChange('currentlyWorking', false)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View
                                style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: 9,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8,
                                }}
                            >
                                {!formData.currentlyWorking && (
                                    <View
                                        style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                )}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>No</Text>
                        </Pressable>
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Career Level" />
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
                        <Label text="Bank Operation" />
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
                        <Label text="Job Type" />
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
                        <Label text="Job Shift" />
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
                        <Label text="Number Of Positions" />
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
                        <Label text="Gender" />
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
                        <Label text="Date" />
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
                        <Label text="Degree" />
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
                        <Label text="Job Experience" />
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

                    </View>
                </View>
                <View style={{ width: '100%', marginTop: responsiveScreenHeight(1.2), flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: responsiveScreenFontSize(1.8),
                                marginBottom: responsiveScreenHeight(1),
                            }}
                        >
                            Is Freelance?
                        </Text>

                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                            <Pressable
                                onPress={() => handleChange('currentlyWorking', true)}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View
                                    style={{
                                        height: 18,
                                        width: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    {formData.currentlyWorking && (
                                        <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5,
                                                backgroundColor: colors.primary,
                                            }}
                                        />
                                    )}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>Yes</Text>
                            </Pressable>

                            {/* NO */}
                            <Pressable
                                onPress={() => handleChange('currentlyWorking', false)}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View
                                    style={{
                                        height: 18,
                                        width: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    {!formData.currentlyWorking && (
                                        <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5,
                                                backgroundColor: colors.primary,
                                            }}
                                        />
                                    )}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>No</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={{ flex: 1, }}>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: responsiveScreenFontSize(1.8),
                                marginBottom: responsiveScreenHeight(1),
                            }}
                        >
                            Is this External Job?
                        </Text>

                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                            <Pressable
                                onPress={() => handleChange('currentlyWorking', true)}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View
                                    style={{
                                        height: 18,
                                        width: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    {formData.currentlyWorking && (
                                        <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5,
                                                backgroundColor: colors.primary,
                                            }}
                                        />
                                    )}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>Yes</Text>
                            </Pressable>

                            {/* NO */}
                            <Pressable
                                onPress={() => handleChange('currentlyWorking', false)}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View
                                    style={{
                                        height: 18,
                                        width: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    {!formData.currentlyWorking && (
                                        <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5,
                                                backgroundColor: colors.primary,
                                            }}
                                        />
                                    )}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>No</Text>
                            </Pressable>
                        </View>
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
                        Submit Job
                    </Text>
                </Pressable>
            </ScrollView>
        </NavigationBar>
    )
}

export default AddJob

const styles = StyleSheet.create({})