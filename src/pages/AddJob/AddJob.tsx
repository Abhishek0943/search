import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NavigationBar from '../../recruiter/components/NavigationBar'
import { responsiveFontSize, responsiveHeight, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import imagePath from '../../assets/imagePath'
import { useNavigation, useRoute } from '@react-navigation/native'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { CustomTextInput, InPutWithLabel } from '../../components';
import { routes } from '../../constants/values'
import { CustomDropdown } from '../PersonalInfo/PersonalInfo'
import { CustomMultiDropdown } from '../Search/Search'
import { useAppDispatch } from '../../store'
import { AddNewJob, AddNewQuestion, AssignmentList, Currencies, Experiences, GetAllQuestions, GetCity, GetCountry, GetMyQuestions, GetSkills, GetState, Industries, JobTypes, NumberOfPositions, QuestionDetails, SalaryPeriods } from '../../reducer/jobsReducer'
import Text from '../../components/Text'
import { useAlert } from '../../context/AlertContext'
import { CompanyActivePackages, RecruiterProfile, RecruiterPlanType } from '../../reducer/recruiterReducer'
import authStyles from '../Auth/styles'
import Button from '../../components/Button'
import Icon from '../../utils/Icon'
const DRAFT_KEY = 'ADD_JOB_DRAFT';
const QUESTION_TYPES = [
    { id: 'short_text', name: 'Text (Short)' },
    { id: 'long_text', name: 'Description (Long)' },
    { id: 'number', name: 'Number' },
    { id: 'single_select', name: 'Select' },
    { id: 'multi_select', name: 'Multi Select' },
    { id: 'yes_no', name: 'Yes / No' },
];
const lanes = [
    { id: "must_have", name: "Must have" },
    { id: "screening", name: "Screening" }
] as const;
const roles = [
    { id: "ideal", name: "Ideal (100%)" },
    { id: "acceptable", name: "Acceptable (50%)" },
    { id: "not_preferred", name: "Not Preferred (0%)" },] as const;
const MULTI_SELECT_SCORING_ROLES = [
    { id: 'required', name: 'Required' },
    { id: 'bonus', name: 'Bonus' },
    { id: 'ignore', name: 'Ignore' },
    { id: 'avoid', name: 'Avoid' },
];
const AddJob = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const route = useRoute()
    const jobData = route.params as any;
    const [skills, setSkills] = useState<Option[]>([]);
    const [currencies, setCurrencies] = useState<Option[]>([]);
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);
    const [salaryPeriods, setSalaryPeriods] = useState<Option[]>([]);
    const [countries, setCountries] = useState<Option[]>([]);
    const [jobTypes, setJobTypes] = useState<Option[]>([]);
    const [experiences, setExperiences] = useState<Option[]>([]);
    const [assignments, setAssignments] = useState<Option[]>([]);
    const [activePackages, setActivePackages] = useState<RecruiterPlanType[]>([]);
    const [industries, setIndustries] = useState<Option[]>([]);
    const [questionDetails, setQuestionDetails] = useState<{ screening: Question[] }>({ screening: [] });
    const [step, setStep] = useState(1)
    const editorRef = useRef<RichEditor | null>(null);
    const [isVisible, setIsVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [dis, setDis] = useState({
        description: "",
        benefits: "",
    })
    const [formData, setFormData] = useState<{
        title: string,
        skills: string[],
        country: string,
        state: string,
        city: string,
        salary: string,
        salaryTo: string,
        currency: string,
        salaryPeriod: string,
        hideSalary: boolean,
        isFreelance: boolean,
        jobExperience: string,
        num_of_positions: number,
        job_type_id: string,
        company_package_id: string,
        work_setup: string,
        expiry_date: string,
        industry_id: string,
        versions: number[],
    }>({
        title: '',
        skills: [] as string[],
        industry_id: "",
        country: '',
        state: '',
        city: '',
        salary: '',
        salaryTo: '',
        currency: '',
        versions: [],
        salaryPeriod: '',
        job_type_id: '',
        hideSalary: false,
        isFreelance: false,
        jobExperience: '',
        num_of_positions: 1,
        company_package_id: '',
        work_setup: 'On-site',
        expiry_date: "",
    });
    useEffect(() => {
        AsyncStorage.getItem(DRAFT_KEY).then(raw => {
            if (!raw) return;
            try {
                const draft = JSON.parse(raw);
                if (draft.formData) setFormData(prev => ({ ...prev, ...draft.formData }));
                if (draft.dis) setDis(draft.dis);
                dispatch(QuestionDetails({ question_ids: draft.questionDetails.screening.map((item: Question) => item.question_id) })).unwrap().then((res) => {
                    if (res.success) {
                        setQuestionDetails(res.data)
                    }
                });
            } catch (e) {
            }
        });
    }, []);

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, dis, questionDetails }));
        }, 500);
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [formData, dis, questionDetails]);

    const handleChange = (key: keyof typeof formData, value: any) => {
        setFormData(prev => {
            if (key === 'country' && value !== prev.country) {
                return { ...prev, country: value, state: '', city: '' };
            }
            if (key === 'state' && value !== prev.state) {
                return { ...prev, state: value, city: '' };
            }
            return { ...prev, [key]: value };
        });
    };
    const { showAlert } = useAlert();
    const onSubmit = () => {
        if (isLoading) return;
        const payload = {
            title: formData.title,
            description: dis.description,
            skills: formData.skills,
            country_id: formData.country,
            state_id: formData.state,
            city_id: formData.city,
            salary_from: formData.salary,
            salary_to: formData.salaryTo,
            salary_currency: formData.currency,
            salary_period_id: formData.salaryPeriod,
            hide_salary: formData.hideSalary ? 1 : 0,
            is_freelance: formData.isFreelance ? 1 : 0,
            job_type_id: formData.job_type_id,
            industry_id: formData.industry_id,
            expiry_date: formData.expiry_date,
            job_experience_id: formData.jobExperience,
            num_of_positions: formData.num_of_positions,
            screening: questionDetails.screening.map((item: any) => ({
                ...item,
                ...(item?.content?.type === "yes_no" && {
                    expected_boolean: item?.expected_boolean ? 1 : 0
                })
            })),
            versions: formData.versions
        };
        setIsLoading(true);
        //         .then(res => {
        //             if (res?.success) {
        //                 AsyncStorage.removeItem(DRAFT_KEY);
        //                 navigation.goBack()
        //                 showAlert({
        //                     title: "Success",
        //                     message: "Successfully updated new job",
        //                 })
        //             }
        //             else {
        //                 showAlert({
        //                     title: "Validation",
        //                     message: res.message,
        //                 })
        //             }
        //             setIsLoading(false);
        //         })
        //         .catch(() => { setIsLoading(false); });
        // }
        // else {
        console.log('payloa', payload.screening)
        dispatch(AddNewJob(payload)).unwrap()
            .then(res => {
                if (res?.success) {
                    // AsyncStorage.removeItem(DRAFT_KEY);
                    navigation.goBack()
                    showAlert({
                        title: "Validation",
                        message: "Successfully added new job",
                    })
                    dispatch(RecruiterProfile())
                }
                else {
                    console.log("this error", res);

                    showAlert({
                        title: "Validation",
                        message: res.message,
                    })
                }
                setIsLoading(false);
            })
            .catch(() => { setIsLoading(false); });
    };
    const renderElem = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <RenderHeader title="Your business" currentStep={1} onBack={() => navigation.goBack()} />
                        {
                            jobTypes.length < 1 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={responsiveFontSize(3)} />
                                    <Text style={{ color: colors.black, marginTop: responsiveHeight(2), fontSize: responsiveFontSize(2), width: responsiveWidth(70), textAlign: 'center' }}>Either data is not loaded yet or data is not available </Text>
                                </View>
                            ) : (
                                <>

                                    <ScrollView
                                        style={{ flex: 1 }}
                                        contentContainerStyle={{
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                        }}
                                    >

                                        <View style={{ width: responsiveScreenWidth(90), flex: 1 }}>
                                            <Text
                                                style={{
                                                    color: colors.textSecondary,
                                                    lineHeight: responsiveFontSize(2.6),
                                                    fontSize: responsiveFontSize(1.9),
                                                    fontWeight: '600',
                                                    marginTop: responsiveHeight(1.5),
                                                }}
                                            >
                                                This is what candidates see first in the feed.
                                            </Text>
                                            <InPutWithLabel
                                                inputContainerStyle={{
                                                    marginBottom: responsiveHeight(0.5),
                                                }}
                                                mainColor={colors.primary}
                                                secondaryColor={colors.primary2}
                                                label="Job Title"
                                                value={formData.title}
                                                onChangeText={text => handleChange('title', text)}
                                                placeholder="Job Title"
                                            />
                                            <Text
                                                style={{
                                                    color: colors.textSecondary,
                                                    lineHeight: responsiveFontSize(2.6),
                                                    fontSize: responsiveFontSize(1.9),
                                                    fontWeight: '600',
                                                    marginTop: responsiveHeight(.5),
                                                }}
                                            >
                                                Use the title people search for, not an internal one.
                                            </Text>

                                            <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                                                <Text style={{
                                                    fontSize: responsiveFontSize(1.8),
                                                    fontWeight: '700', color: colors.primary2,
                                                }}>
                                                    Employment type
                                                </Text>

                                                <View
                                                    style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                                >
                                                    {jobTypes.map((item: any) => {
                                                        const isSelected = formData.job_type_id === item.id;
                                                        return (
                                                            <Pressable
                                                                key={item.id}
                                                                onPress={() => handleChange('job_type_id', item.id)}
                                                                style={{
                                                                    backgroundColor: isSelected ? colors.primary : colors.white,
                                                                    borderWidth: isSelected ? 0 : 1.5,
                                                                    borderColor: isSelected ? colors.primary : colors.gray,
                                                                    borderRadius: 24,
                                                                    paddingHorizontal: responsiveWidth(5),
                                                                    paddingVertical: responsiveHeight(1),
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Text style={{
                                                                    color: isSelected ? colors.white : colors.textPrimary,
                                                                    fontSize: responsiveFontSize(1.8),
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {item.name}
                                                                </Text>
                                                            </Pressable>
                                                        );
                                                    })}
                                                </View>
                                            </View>



                                            <View style={{ width: '100%', marginTop: responsiveHeight(.5), marginBottom: responsiveHeight(2) }}>
                                                <Text style={{
                                                    fontSize: responsiveFontSize(1.8),
                                                    fontWeight: '700', color: colors.primary2,
                                                }}>
                                                    Positions available
                                                </Text>

                                                <View style={{ flexDirection: 'row', marginTop: responsiveHeight(.5), alignItems: 'center', gap: responsiveWidth(4) }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        borderWidth: 1,
                                                        borderColor: colors.gray,
                                                        borderRadius: 14,
                                                        paddingHorizontal: responsiveWidth(2),
                                                        paddingVertical: responsiveHeight(1),
                                                        width: responsiveWidth(42),
                                                        backgroundColor: colors.white,
                                                    }}>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const current = Number(formData.num_of_positions) || 1;
                                                                if (current > 1) {
                                                                    handleChange('num_of_positions', current - 1);
                                                                }
                                                            }}
                                                            style={{
                                                                width: responsiveHeight(3),
                                                                aspectRatio: 1,
                                                                borderRadius: responsiveHeight(2.25),
                                                                backgroundColor: colors.gray,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#334155', marginTop: -2 }}>
                                                                −
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '800', color: colors.textPrimary }}>
                                                            {formData.num_of_positions || 1}
                                                        </Text>

                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const current = Number(formData.num_of_positions) || 1;
                                                                handleChange('num_of_positions', current + 1);
                                                            }}
                                                            style={{
                                                                width: responsiveHeight(3),
                                                                aspectRatio: 1,
                                                                borderRadius: responsiveHeight(2.25),
                                                                backgroundColor: colors.gray,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: colors.primary || '#1D70F5', marginTop: -2 }}>
                                                                +
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <Text style={{ color: colors.textSecondary || '#64748B', fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>
                                                        Default is 1.
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView >
                                    <Pressable
                                        style={{
                                            width: responsiveWidth(100),
                                            marginBottom: responsiveHeight(2.5),
                                            aspectRatio: 350 / 1,
                                        }}
                                    >
                                        <Image
                                            style={authStyles.bgImageContain}
                                            source={require('../Auth/images/Devider2.png')}
                                        />
                                    </Pressable>
                                    <Button label="Continue" onPress={() => {
                                        if (!formData.title) {
                                            showAlert({
                                                title: "Validation",
                                                message: "Please enter Job Title.",
                                            });
                                            return;
                                        }
                                        if (!formData.job_type_id) {
                                            showAlert({
                                                title: "Validation",
                                                message: "Please select Employment type.",
                                            });
                                            return;
                                        }
                                        if (!formData.num_of_positions) {
                                            showAlert({
                                                title: "Validation",
                                                message: "Please enter Positions available.",
                                            });
                                            return;
                                        }
                                        setStep(2);
                                    }} style={{
                                        marginBottom: responsiveHeight(2.5),
                                        marginHorizontal: "auto"
                                    }} />
                                </>
                            )
                        }

                    </>
                );
            case 2:
                return (
                    <>
                        <RenderHeader title="Description & Benefits" currentStep={2} onBack={() => setStep(1)} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                paddingBottom: responsiveHeight(2),
                            }}
                        >
                            <View style={{ width: responsiveScreenWidth(90), flex: 1, marginTop: responsiveHeight(1) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '700', color: colors.primary2,
                                    }}>
                                        Description
                                    </Text>
                                </View>

                                <View style={[{ width: '100%', minHeight: responsiveScreenHeight(18) }, {
                                    borderWidth: 1,
                                    width: '100%',
                                    borderRadius: 6,
                                    borderColor: colors.mediumGray,
                                    marginTop: responsiveScreenHeight(1), paddingHorizontal: 0, paddingVertical: 0
                                }]}>
                                    <RichEditor
                                        ref={editorRef}
                                        placeholder="Write job description here..."
                                        onChange={html => setDis({ ...dis, "description": html })}
                                        initialContentHTML={dis.description}
                                        editorStyle={{
                                            backgroundColor: 'transparent',
                                            color: colors.textPrimary,
                                            placeholderColor: colors.gray,
                                            contentCSSText: `font-size: 16px;`,
                                        }}
                                    />
                                </View>

                                <RichToolbar
                                    editor={editorRef}
                                    actions={[
                                        actions.setBold,
                                        actions.setItalic,
                                        actions.insertBulletsList,
                                        actions.insertOrderedList,
                                    ]}
                                />
                            </View>
                        </ScrollView>
                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                marginBottom: responsiveHeight(2.5),
                                aspectRatio: 350 / 1,
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('../Auth/images/Devider2.png')}
                            />
                        </Pressable>
                        <Button label="Continue" onPress={() => {
                            if (!dis.description) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please enter description.",
                                });
                                return;
                            }
                            setStep(3);
                        }} style={{
                            marginBottom: responsiveHeight(2.5),
                            marginHorizontal: "auto"
                        }} />
                    </>
                );
            case 3:
                return (
                    <>
                        <RenderHeader title="Location & Salary" currentStep={3} onBack={() => setStep(2)} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                paddingBottom: responsiveHeight(2),
                            }}
                        >
                            <View style={{ width: responsiveScreenWidth(90), paddingTop: responsiveHeight(1), flex: 1 }}>
                                <CustomMultiDropdown
                                    label="Skill"
                                    data={skills}
                                    placeholder="Search skills..."
                                    selectedValues={formData.skills}
                                    onSelect={(arr: any[]) => {
                                        setFormData(prev => ({ ...prev, skills: arr }));
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <CustomDropdown
                                    label="Country"
                                    data={countries}
                                    placeholder="Search country..."
                                    selectedValue={formData.country}
                                    onSelect={(id) => {
                                        handleChange('country', id);
                                        dispatch(GetState({ id })).unwrap().then(res => res.success && setStates(res.data));
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <CustomDropdown
                                    label="State"
                                    data={states}
                                    placeholder="Search state..."
                                    selectedValue={formData.state}
                                    onSelect={(id) => {
                                        handleChange('state', id);
                                        dispatch(GetCity({ id })).unwrap().then(res => res.success && setCities(res.data));
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />
                                <CustomDropdown
                                    label="City"
                                    data={cities}
                                    placeholder="Search city..."
                                    selectedValue={formData.city}
                                    onSelect={(id) => {
                                        handleChange('city', id);
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <CustomDropdown
                                    label="Currency"
                                    data={currencies}
                                    placeholder="Search currency..."
                                    selectedValue={formData.currency || ''}
                                    onSelect={(id) => {
                                        handleChange('currency', id);
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(3), marginTop: responsiveHeight(1) }}>
                                    <View style={{ flex: 1 }}>
                                        <InPutWithLabel
                                            inputContainerStyle={{
                                                marginBottom: responsiveHeight(0.5),
                                                width: '100%',
                                                height: responsiveHeight(5.5),
                                            }}
                                            full={false}
                                            mainColor={colors.primary}
                                            secondaryColor={colors.primary2}
                                            label="Min Salary"
                                            value={formData.salary ? String(formData.salary) : ''}
                                            onChangeText={text => handleChange('salary', text)}
                                            placeholder="Min Salary"
                                        />

                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <InPutWithLabel
                                            inputContainerStyle={{
                                                marginBottom: responsiveHeight(1),
                                                width: '100%',
                                                height: responsiveHeight(5.5),
                                            }}
                                            full={false}
                                            mainColor={colors.primary}
                                            secondaryColor={colors.primary2}
                                            label="Max Salary"
                                            value={formData.salaryTo ? String(formData.salaryTo) : ''}
                                            onChangeText={text => handleChange('salaryTo', text)}
                                            placeholder="Max Salary"
                                        />
                                    </View>
                                </View>

                                <CustomDropdown
                                    label="Salary Period"
                                    data={salaryPeriods}
                                    placeholder="Search salary period..."
                                    selectedValue={formData.salaryPeriod || ''}
                                    onSelect={(id) => {
                                        handleChange('salaryPeriod', id);
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6), marginTop: responsiveHeight(1.5) }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '700', color: colors.primary2,
                                            marginBottom: responsiveHeight(.5),
                                        }}>
                                            Hide Salary?
                                        </Text>

                                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                                            <Pressable onPress={() => handleChange('hideSalary', true)} style={styles.radioRow}>
                                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                    {formData.hideSalary && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                                </View>
                                                <Text style={{ color: colors.textPrimary }}>Yes</Text>
                                            </Pressable>

                                            <Pressable onPress={() => handleChange('hideSalary', false)} style={styles.radioRow}>
                                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                    {!formData.hideSalary && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                                </View>
                                                <Text style={{ color: colors.textPrimary }}>No</Text>
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '700', color: colors.primary2,
                                            marginBottom: responsiveHeight(.5),
                                        }}>
                                            Is Freelance?
                                        </Text>

                                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                                            <Pressable onPress={() => handleChange('isFreelance', true)} style={styles.radioRow}>
                                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                    {formData.isFreelance && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                                </View>
                                                <Text style={{ color: colors.textPrimary }}>Yes</Text>
                                            </Pressable>

                                            <Pressable onPress={() => handleChange('isFreelance', false)} style={styles.radioRow}>
                                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                    {!formData.isFreelance && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                                </View>
                                                <Text style={{ color: colors.textPrimary }}>No</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>

                            </View>
                        </ScrollView>
                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                marginBottom: responsiveHeight(2.5),
                                aspectRatio: 350 / 1,
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('../Auth/images/Devider2.png')}
                            />
                        </Pressable>
                        <Button label="Continue" onPress={() => {
                            if (!formData.country) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select country.",
                                });
                                return;
                            }
                            if (!formData.state) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select state.",
                                });
                                return;
                            }
                            if (!formData.salaryPeriod) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select Salary Period.",
                                });
                                return;
                            }
                            if (!formData.skills || formData.skills.length === 0) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select Skills.",
                                });
                                return;
                            }
                            if (formData.salary && formData.salaryTo) {
                                if (formData.salary > formData.salaryTo) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Salary From should be less than or equal to Salary To.",
                                    });
                                    return;
                                }
                            }
                            setStep(4);
                        }} style={{
                            marginBottom: responsiveHeight(2.5),
                            marginHorizontal: "auto"
                        }} />
                    </>
                );
            case 4:
                return (
                    <>
                        <RenderHeader title="Shifts & Requirements" currentStep={4} onBack={() => setStep(3)} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                paddingBottom: responsiveHeight(4),
                            }}
                        >
                            <View style={{ width: responsiveScreenWidth(90), paddingTop: responsiveHeight(1), flex: 1 }}>
                                <CustomDropdown
                                    label="Job Experience"
                                    data={experiences}
                                    placeholder="Search job experience..."
                                    selectedValue={formData.jobExperience || ''}
                                    onSelect={(id) => {
                                        setFormData(prev => ({ ...prev, jobExperience: id }));
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />

                                <CustomDropdown
                                    label="Select Package"
                                    data={activePackages.map(p => ({
                                        id: String(p.id), name: p.package_title + " (left jobs " + p.remaining_quota + ", expires on " + p.end_date + ")"
                                    }))}
                                    placeholder="Search package..."
                                    selectedValue={formData.company_package_id || ''}
                                    onSelect={(id) => {
                                        handleChange('company_package_id', id);
                                        handleChange("expiry_date", activePackages.find((p) => p.id == id)?.end_date);
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />
                                <CustomDropdown
                                    label="Select Industary"
                                    data={industries}
                                    placeholder="Search Industary..."
                                    selectedValue={formData.industry_id || ''}
                                    onSelect={(id) => {
                                        handleChange('industry_id', id);
                                    }}
                                    labelKey="name"
                                    valueKey="id"
                                />
                                <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '700', color: colors.primary2,
                                    }}>
                                        Work setup
                                    </Text>

                                    <View
                                        style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                    >
                                        {[{ id: "On-site", name: "Onsite" }, { id: "Remote", name: "Remote" }, { id: "Hybrid", name: "Hybrid" }].map((item: any) => {
                                            const isSelected = formData.work_setup === item.id;
                                            return (
                                                <Pressable
                                                    key={item.id}
                                                    onPress={() => handleChange('work_setup', item.id)}
                                                    style={{
                                                        backgroundColor: isSelected ? colors.primary : colors.white,
                                                        borderWidth: isSelected ? 0 : 1.5,
                                                        borderColor: isSelected ? colors.primary : colors.gray,
                                                        borderRadius: 24,
                                                        paddingHorizontal: responsiveWidth(5),
                                                        paddingVertical: responsiveHeight(1),
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Text style={{
                                                        color: isSelected ? colors.white : colors.textPrimary,
                                                        fontSize: responsiveFontSize(1.8),
                                                        fontWeight: '600',
                                                    }}>
                                                        {item.name}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                            </View>
                        </ScrollView>
                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                marginBottom: responsiveHeight(2.5),
                                aspectRatio: 350 / 1,
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('../Auth/images/Devider2.png')}
                            />
                        </Pressable>
                        <Button label="Continue" onPress={() => {
                            if (!formData.jobExperience) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select Job Experience.",
                                });
                                return;
                            }

                            if (!formData.company_package_id) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select Package.",
                                });
                                return;
                            }
                            if (!formData.industry_id) {
                                showAlert({
                                    title: "Validation",
                                    message: "Please select Industry.",
                                });
                                return;
                            }
                            setStep(5);
                        }} style={{
                            marginBottom: responsiveHeight(2.5),
                            marginHorizontal: "auto"
                        }} />
                    </>
                );
            case 5:
                const currentPageNum = step - 4;
                return (
                    <>
                        <RenderHeader title={`Page ${currentPageNum}`} currentStep={step} onBack={() => setStep(step === 5 ? 4 : step - 1)} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                paddingBottom: responsiveHeight(4),
                                backgroundColor: colors.white
                            }}
                        >
                            <View style={{ width: responsiveWidth(90), paddingTop: responsiveHeight(1), flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1.5) }}>
                                    <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '800', color: colors.textPrimary }}>
                                        Number of questions : {questionDetails?.screening?.length || 0}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsVisible(true)
                                        }}
                                        style={{
                                            backgroundColor: colors.primary,
                                            paddingHorizontal: responsiveWidth(3.5),
                                            paddingVertical: responsiveHeight(0.8),
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>
                                            + Add Question
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                                {
                                    questionDetails?.screening?.map((item, index) => {
                                        return (
                                            <View key={index} style={{ borderWidth: 1, borderColor: colors.gray, marginBottom: responsiveHeight(1), borderRadius: 15, padding: responsiveWidth(4) }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '800', color: colors.textPrimary }}>
                                                        {item?.content?.text}
                                                    </Text>
                                                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: responsiveWidth(2) }}>
                                                        <Icon
                                                            icon={{
                                                                name: "eye",
                                                                type: "Feather"
                                                            }}
                                                            size={responsiveWidth(5)}
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => {
                                                        setQuestionDetails({ ...questionDetails, screening: [...questionDetails.screening.filter((e) => e.question_id !== item.question_id)] })
                                                    }}>
                                                        <Icon
                                                            icon={{
                                                                name: "trash-2",
                                                                type: "Feather"
                                                            }}
                                                            size={responsiveWidth(5)}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text>
                                                    Type : {item.content.type}
                                                </Text>
                                                <Text>
                                                    Lanes : {item.lane}
                                                </Text>
                                                {
                                                    item?.content?.type === "single_select" || item?.content?.type === "yes_no" || item?.content?.type === "number" && <View>
                                                        <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                                                            <Text style={{
                                                                fontSize: responsiveFontSize(1.8),
                                                                fontWeight: '700', color: colors.primary2,
                                                            }}>
                                                                Purpose
                                                            </Text>

                                                            <View
                                                                style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                                            >
                                                                {lanes?.map((laneData) => {
                                                                    const isSelected = item?.lane === laneData.id;
                                                                    return (
                                                                        <Pressable
                                                                            key={laneData.id}
                                                                            onPress={() => {
                                                                                setQuestionDetails(prev => ({
                                                                                    ...prev,
                                                                                    screening: prev.screening.map(q =>
                                                                                        q.question_id === item.question_id
                                                                                            ? { ...q, lane: laneData.id }
                                                                                            : q
                                                                                    )
                                                                                }));
                                                                            }
                                                                            }
                                                                            style={{
                                                                                backgroundColor: isSelected ? colors.primary : colors.white,
                                                                                borderWidth: isSelected ? 0 : 1.5,
                                                                                borderColor: isSelected ? colors.primary : colors.gray,
                                                                                borderRadius: 24,
                                                                                paddingHorizontal: responsiveWidth(5),
                                                                                paddingVertical: responsiveHeight(1),
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <Text style={{
                                                                                color: isSelected ? colors.white : colors.textPrimary,
                                                                                fontSize: responsiveFontSize(1.8),
                                                                                fontWeight: '600',
                                                                            }}>
                                                                                {laneData.name}
                                                                            </Text>
                                                                        </Pressable>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>
                                                    </View>
                                                }
                                                {
                                                    (item?.content?.type === "yes_no" || item?.content?.type === "single_select" || item?.content?.type === "number") && item?.lane === 'screening' && <View>
                                                        <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                                                            <Text style={{
                                                                fontSize: responsiveFontSize(1.8),
                                                                fontWeight: '700', color: colors.primary2,
                                                            }}>
                                                                Scoring mode
                                                            </Text>
                                                            <View
                                                                style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                                            >
                                                                {[{ id: "manual_review", name: "Manual Review" }, { id: "auto_score", name: "Auto Score" }]?.map((laneData) => {
                                                                    const isSelected = (item?.scored ? "auto_score" : "manual_review") === laneData.id;

                                                                    return (
                                                                        <Pressable
                                                                            key={laneData.id}
                                                                            onPress={() => {
                                                                                setQuestionDetails(prev => ({
                                                                                    ...prev,
                                                                                    screening: prev.screening.map(q =>
                                                                                        q.question_id === item.question_id
                                                                                            ? { ...q, scored: laneData.id !== "manual_review" }
                                                                                            : q
                                                                                    )
                                                                                }));
                                                                            }
                                                                            }
                                                                            style={{
                                                                                backgroundColor: isSelected ? colors.primary : colors.white,
                                                                                borderWidth: isSelected ? 0 : 1.5,
                                                                                borderColor: isSelected ? colors.primary : colors.gray,
                                                                                borderRadius: 24,
                                                                                paddingHorizontal: responsiveWidth(5),
                                                                                paddingVertical: responsiveHeight(1),
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <Text style={{
                                                                                color: isSelected ? colors.white : colors.textPrimary,
                                                                                fontSize: responsiveFontSize(1.8),
                                                                                fontWeight: '600',
                                                                            }}>
                                                                                {laneData.name}
                                                                            </Text>
                                                                        </Pressable>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>

                                                    </View>
                                                }
                                                {
                                                    item?.content?.type === "single_select" && item?.scored && item?.content.options.map((option) => (
                                                        <View style={{ width: '100%', marginTop: responsiveHeight(.5) }}>
                                                            <Text style={{
                                                                fontSize: responsiveFontSize(1.8),
                                                                fontWeight: '700', color: colors.primary2,
                                                            }}>
                                                                {option.label}
                                                            </Text>

                                                            <View
                                                                style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                                            >
                                                                {roles.map((laneData) => {
                                                                    const isSelected = item?.roles ? item?.roles[option.id] === laneData.id : false
                                                                    return (
                                                                        <Pressable
                                                                            key={laneData.id + option.id}
                                                                            onPress={() => setQuestionDetails(prev => {
                                                                                const updated = prev.screening.map((q) => q.question_id === item.question_id ? { ...q, roles: { ...q.roles, [option.id]: laneData.id } } : q);
                                                                                return { ...prev, screening: updated };
                                                                            })
                                                                            }
                                                                            style={{
                                                                                backgroundColor: isSelected ? colors.primary : colors.white,
                                                                                borderWidth: isSelected ? 0 : 1.5,
                                                                                borderColor: isSelected ? colors.primary : colors.gray,
                                                                                borderRadius: 24,
                                                                                paddingHorizontal: responsiveWidth(5),
                                                                                paddingVertical: responsiveHeight(1),
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <Text style={{
                                                                                color: isSelected ? colors.white : colors.textPrimary,
                                                                                fontSize: responsiveFontSize(1.8),
                                                                                fontWeight: '600',
                                                                            }}>
                                                                                {laneData.name}
                                                                            </Text>
                                                                        </Pressable>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>
                                                    ))
                                                }
                                                {
                                                    item?.content?.type === "yes_no" && item?.scored && (
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{
                                                                fontSize: responsiveFontSize(1.8),
                                                                fontWeight: '700', color: colors.primary2,
                                                                marginBottom: responsiveHeight(.5),
                                                            }}>
                                                                Preferred Answer
                                                            </Text>

                                                            <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                                                                <Pressable
                                                                    onPress={() => {
                                                                        setQuestionDetails(prev => ({
                                                                            ...prev,
                                                                            screening: prev.screening.map(q =>
                                                                                q.question_id === item.question_id
                                                                                    ? { ...q, expected_boolean: true }
                                                                                    : q
                                                                            )
                                                                        }));
                                                                    }}
                                                                    style={styles.radioRow}
                                                                >
                                                                    <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                                        {item?.expected_boolean === true && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                                                    </View>
                                                                    <Text style={{ color: colors.textPrimary }}>Yes</Text>
                                                                </Pressable>

                                                                <Pressable
                                                                    onPress={() => {
                                                                        setQuestionDetails(prev => ({
                                                                            ...prev,
                                                                            screening: prev.screening.map(q =>
                                                                                q.question_id === item.question_id
                                                                                    ? { ...q, expected_boolean: false }
                                                                                    : q
                                                                            )
                                                                        }));
                                                                    }}
                                                                    style={styles.radioRow}
                                                                >
                                                                    <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                                                        {(item?.expected_boolean === false || item?.expected_boolean === undefined || item?.expected_boolean === null) && (
                                                                            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                                                                        )}
                                                                    </View>
                                                                    <Text style={{ color: colors.textPrimary }}>No</Text>
                                                                </Pressable>
                                                            </View>
                                                        </View>
                                                    )
                                                }
                                                {
                                                    item?.content?.type === "number" && (item?.lane) === 'must_have' &&
                                                    <>
                                                        <InPutWithLabel
                                                            inputContainerStyle={{
                                                                marginBottom: responsiveHeight(0.5),
                                                                width: '100%',
                                                                height: responsiveHeight(5.5),
                                                            }}
                                                            full={false}
                                                            mainColor={colors.primary}
                                                            secondaryColor={colors.primary2}
                                                            label="Minimum to pass"
                                                            value={item.min_value}
                                                            onChangeText={text => {
                                                                setQuestionDetails(prev => ({
                                                                    ...prev,
                                                                    screening: prev.screening.map(q =>
                                                                        q.question_id === item.question_id
                                                                            ? { ...q, min_value: text }
                                                                            : q
                                                                    )
                                                                }));
                                                            }}
                                                            placeholder="Minimum to pass"
                                                        />
                                                    </>
                                                }
                                                {
                                                    item?.content?.type === "number" && item?.scored && <>
                                                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(3), }}>
                                                            <View style={{ flex: 1 }}>
                                                                <InPutWithLabel
                                                                    inputContainerStyle={{
                                                                        marginBottom: responsiveHeight(0.5),
                                                                        width: '100%',
                                                                        height: responsiveHeight(5.5),
                                                                    }}
                                                                    full={false}
                                                                    mainColor={colors.primary}
                                                                    secondaryColor={colors.primary2}
                                                                    label="Minimum to pass"
                                                                    value={item.min_value || ''}
                                                                    onChangeText={text => {
                                                                        setQuestionDetails(prev => ({
                                                                            ...prev,
                                                                            screening: prev.screening.map(q =>
                                                                                q.question_id === item.question_id
                                                                                    ? { ...q, min_value: text }
                                                                                    : q
                                                                            )
                                                                        }));
                                                                    }}
                                                                    placeholder="Pass value"
                                                                />

                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <InPutWithLabel
                                                                    inputContainerStyle={{
                                                                        marginBottom: responsiveHeight(1),
                                                                        width: '100%',
                                                                        height: responsiveHeight(5.5),
                                                                    }}
                                                                    full={false}
                                                                    mainColor={colors.primary}
                                                                    secondaryColor={colors.primary2}
                                                                    label="Ideal value"
                                                                    value={item.ideal_value || ''}
                                                                    onChangeText={text => {
                                                                        setQuestionDetails(prev => ({
                                                                            ...prev,
                                                                            screening: prev.screening.map(q =>
                                                                                q.question_id === item.question_id
                                                                                    ? { ...q, ideal_value: text }
                                                                                    : q
                                                                            )
                                                                        }));
                                                                    }}
                                                                    placeholder="Ideal value"
                                                                />
                                                            </View>
                                                        </View>
                                                    </>
                                                }
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView >
                        <Pressable
                            onPress={() => {
                                if (questionDetails.screening.length === 0) {
                                    showAlert({
                                        title: "Error",
                                        message: "Please Add at least one question",
                                    })
                                    return
                                }
                                setStep(step + 1)
                            }}
                            style={{
                                width: responsiveWidth(90),
                                justifyContent: 'center',
                                marginTop: responsiveScreenHeight(2),
                                marginBottom: responsiveScreenHeight(2),
                                borderRadius: 12,
                                marginHorizontal: "auto",
                                gap: responsiveScreenWidth(1),
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                                paddingHorizontal: responsiveScreenWidth(3),
                                paddingVertical: responsiveScreenHeight(1.5),
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: '700' }}>
                                    {jobData?.id ? "Update Job" : "Submit Job"}
                                </Text>
                            )}
                        </Pressable>
                    </>
                );
            case 6:
                return (
                    <>
                        <RenderHeader title={`Assessment`} currentStep={step} onBack={() => setStep(5)} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                paddingBottom: responsiveHeight(4),
                                backgroundColor: colors.white
                            }}
                        >
                            <View style={{ width: responsiveWidth(90), paddingTop: responsiveHeight(1), flex: 1 }}>
                                {
                                    assignments?.map((item: any, index: number) => {
                                        return (
                                            <View key={index} style={{ borderWidth: 1, borderColor: colors.gray, marginBottom: responsiveHeight(1), borderRadius: 15, padding: responsiveWidth(4) }}>
                                                <Text>{item?.title}</Text>
                                                <Text>{item?.minutes} minutes</Text>
                                                <Text>{item?.activity_count} Questions</Text>
                                                <Text>{item?.activity_types.toString()}</Text>
                                                <View
                                                    style={{ flexDirection: 'row', gap: responsiveWidth(2.5), marginTop: responsiveWidth(.5), paddingVertical: 4, flexWrap: "wrap" }}
                                                >
                                                    {item.activity_types.map((laneData: any) => {
                                                        return (
                                                            <Pressable
                                                                key={laneData}
                                                                onPress={() => {
                                                                }}
                                                                style={{
                                                                    backgroundColor: colors.white,
                                                                    borderWidth: 1.5,
                                                                    borderColor: colors.gray,
                                                                    borderRadius: 24,
                                                                    paddingHorizontal: responsiveWidth(5),
                                                                    paddingVertical: responsiveHeight(1),
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Text style={{
                                                                    color: colors.textPrimary,
                                                                    fontSize: responsiveFontSize(1.8),
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {laneData}
                                                                </Text>

                                                            </Pressable>
                                                        );
                                                    })}
                                                </View>
                                                <Pressable
                                                    onPress={() => {
                                                        if (formData?.versions?.includes(item.id)) {
                                                            setFormData((prev) => ({ ...prev, versions: prev.versions.filter((i: any) => i !== item.id) }))
                                                        } else {
                                                            setFormData((prev) => ({ ...prev, versions: [...prev.versions, item.id] }))
                                                        }
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        justifyContent: 'center',
                                                        marginTop: responsiveScreenHeight(2),
                                                        marginBottom: responsiveScreenHeight(2),
                                                        borderRadius: 12,
                                                        marginHorizontal: "auto",
                                                        gap: responsiveScreenWidth(1),
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: colors.primary,
                                                        paddingHorizontal: responsiveScreenWidth(3),
                                                        paddingVertical: responsiveScreenHeight(1.5),
                                                    }}
                                                >

                                                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: '700' }}>
                                                        {formData.versions.includes(item.id) ? 'Remove Assignment' : 'Add Assignment'}
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView>
                        <Pressable
                            disabled={isLoading}
                            onPress={onSubmit}
                            style={{
                                width: "100%",
                                justifyContent: 'center',
                                marginTop: responsiveScreenHeight(2),
                                marginBottom: responsiveScreenHeight(2),
                                borderRadius: 12,
                                marginHorizontal: "auto",
                                gap: responsiveScreenWidth(1),
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                                paddingHorizontal: responsiveScreenWidth(3),
                                paddingVertical: responsiveScreenHeight(1.5),
                                opacity: isLoading ? 0.7 : 1,
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: '700' }}>
                                    {jobData?.id ? 'Update Job' : 'Post Job'}
                                </Text>
                            )}
                        </Pressable>
                    </>)
        }
    };
    useEffect(() => {
        dispatch(GetSkills()).unwrap().then(res => res?.success ? setSkills(res.data) : setSkills([]))
        dispatch(Currencies()).unwrap().then(res => res?.success ? setCurrencies(res.data) : setCurrencies([]))
        dispatch(GetCountry()).unwrap().then(res => res?.success ? setCountries(res.data) : setCountries([]))
        dispatch(SalaryPeriods()).unwrap().then(res => res?.success ? setSalaryPeriods(res.data) : setSalaryPeriods([]))
        dispatch(JobTypes()).unwrap().then(res => res?.success ? setJobTypes(res.data) : setJobTypes([]))
        dispatch(Experiences()).unwrap().then(res => res?.success ? setExperiences(res.data) : setExperiences([]))
        dispatch(CompanyActivePackages()).unwrap().then(res => res?.success ? setActivePackages(res.data.packages) : setActivePackages([]))
        dispatch(Industries()).unwrap().then(res => res?.success ? setIndustries(res.data) : setIndustries([]))
        dispatch(AssignmentList()).unwrap().then(res => res?.success ? setAssignments(res.data) : setAssignments([]))
    }, [dispatch]);
    return (
        <NavigationBar navigationBar={jobData?.id ? false : true} name={routes.ADDJOB}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {renderElem()}
                <QuestionModel
                    isVisible={isVisible}
                    selectedQuestions={questionDetails?.screening || []}
                    onAddQuestion={(newQ) => {
                        setQuestionDetails(prev => {
                            const exists = prev.screening.some(item => item.question_id === newQ.question_id);
                            if (exists) return prev;
                            return { ...prev, screening: [...prev.screening, newQ] };
                        });
                    }}
                    onRemoveQuestion={(qId) => {
                        setQuestionDetails(prev => ({
                            ...prev,
                            screening: prev.screening.filter(item => item.question_id !== qId)
                        }));
                    }}
                    onClose={() => {
                        setIsVisible(false);
                    }}
                />
            </KeyboardAvoidingView>
        </NavigationBar>
    );
};

export default AddJob;
const RenderHeader = ({ currentStep, title, onBack }: { currentStep: number, title: string, onBack: () => void }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: responsiveWidth(5),
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                    <Pressable
                        onPress={onBack}
                        style={{
                            width: responsiveWidth(2.8),
                            aspectRatio: 1 / 2,
                        }}
                    >
                        <Image
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                            source={imagePath.leftAngle}
                        />
                    </Pressable>

                    <View>
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '800',
                            }}
                        >
                            Step {currentStep} of 6
                        </Text>

                        <Text
                            style={{
                                color: colors.textPrimary,
                                lineHeight: responsiveFontSize(2.6),
                                fontSize: responsiveFontSize(3),
                                fontWeight: '800',
                            }}
                        >
                            {title}
                        </Text>
                    </View>
                </View>
            </View>
            <View
                style={{
                    marginTop: responsiveHeight(2),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: responsiveWidth(1.5),
                    marginBottom: responsiveHeight(.5),
                    paddingHorizontal: responsiveWidth(5),
                }}
            >
                {Array.from({ length: 6 }, (_, idx) => idx + 1).map(i => (
                    <View
                        key={i}
                        style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 2,
                            backgroundColor:
                                i <= currentStep ? colors.primary : colors.gray,
                        }}
                    />
                ))}
            </View>
            <Pressable
                style={{
                    width: responsiveWidth(100),
                    marginTop: responsiveHeight(2.5),
                    aspectRatio: 350 / 1,
                }}
            >
                <Image
                    style={authStyles.bgImageContain}
                    source={require('../Auth/images/Devider2.png')}
                />
            </Pressable>
        </>
    );
};
const QuestionModel = ({
    isVisible,
    onClose,
    id,
    selectedQuestions = [],
    onAddQuestion,
    onRemoveQuestion,
}: {
    isVisible: boolean;
    onClose: (payload?: { typeOfModal: "add" } | { typeOfModal: "edit"; } & QuestionItem | NativeSyntheticEvent<any> | void) => void;
    id?: string;
    selectedQuestions?: Question[];
    onAddQuestion?: (question: Question) => void;
    onRemoveQuestion?: (questionId: number) => void;
}) => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();

    const [activeTab, setActiveTab] = useState<'admin' | 'my' | 'create'>(id ? 'create' : 'admin');
    const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
    const [myQuestions, setMyQuestions] = useState<any[]>([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [loadingAdminMore, setLoadingAdminMore] = useState(false);
    const [adminPage, setAdminPage] = useState(1);
    const [adminHasMore, setAdminHasMore] = useState(true);

    const [loadingMy, setLoadingMy] = useState(false);
    const [loadingMyMore, setLoadingMyMore] = useState(false);
    const [myPage, setMyPage] = useState(1);
    const [myHasMore, setMyHasMore] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [addingId, setAddingId] = useState<number | null>(null);

    const [question, setQuestion] = useState<QuestionItem>({
        id: id,
        question: '',
        answer_type: 'short_text',
        is_required: true,
        options: [{ label: "", scoring_role: "required" }, { label: "", scoring_role: "bonus" }],
    });
    const [isLoading, setIsLoading] = useState(false);

    const extractQuestions = (resData: any): any[] => {
        if (!resData) return [];
        if (Array.isArray(resData)) return resData;
        if (Array.isArray(resData.data)) return resData.data;
        if (Array.isArray(resData.questions)) return resData.questions;
        if (Array.isArray(resData.screening)) return resData.screening;
        return [];
    };

    const extractMeta = (resData: any, fullRes?: any) => {
        const meta = fullRes?.meta || resData?.meta || (resData && !Array.isArray(resData) ? resData : {});
        const current = Number(meta?.current_page || 1);
        const last = Number(meta?.last_page || 1);
        return {
            current_page: current,
            last_page: last,
        };
    };

    const appendWithoutDuplicates = (prev: any[], next: any[]) => {
        const seen = new Set(prev.map(p => Number(p?.question_id || p?.id)));
        const filteredNext = next.filter(n => !seen.has(Number(n?.question_id || n?.id)));
        return [...prev, ...filteredNext];
    };

    const fetchAllQuestions = (pageNumber: number = 1, search: string = searchQuery, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingAdminMore(true);
        } else {
            setLoadingAdmin(true);
        }

        dispatch(GetAllQuestions({ page: pageNumber, search: search.trim() })).unwrap().then((res: any) => {
            if (res?.success) {
                const list = extractQuestions(res.data);
                const meta = extractMeta(res.data, res);
                setAdminHasMore(meta.current_page < meta.last_page && list.length > 0);
                setAdminPage(pageNumber);

                if (pageNumber === 1) {
                    setAdminQuestions(list);
                } else {
                    setAdminQuestions(prev => appendWithoutDuplicates(prev, list));
                }
            } else {
                if (pageNumber === 1) setAdminQuestions([]);
                setAdminHasMore(false);
            }
            setLoadingAdmin(false);
            setLoadingAdminMore(false);
        }).catch(() => {
            setLoadingAdmin(false);
            setLoadingAdminMore(false);
        });
    };

    const fetchMyQuestions = (pageNumber: number = 1, search: string = searchQuery, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMyMore(true);
        } else {
            setLoadingMy(true);
        }

        dispatch(GetMyQuestions({ page: pageNumber, search: search.trim() })).unwrap().then((res: any) => {
            if (res?.success) {
                const list = extractQuestions(res.data);
                const meta = extractMeta(res.data, res);
                setMyHasMore(meta.current_page < meta.last_page && list.length > 0);
                setMyPage(pageNumber);

                if (pageNumber === 1) {
                    setMyQuestions(list);
                } else {
                    setMyQuestions(prev => appendWithoutDuplicates(prev, list));
                }
            } else {
                if (pageNumber === 1) setMyQuestions([]);
                setMyHasMore(false);
            }
            setLoadingMy(false);
            setLoadingMyMore(false);
        }).catch(() => {
            setLoadingMy(false);
            setLoadingMyMore(false);
        });
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = setTimeout(() => {
            if (activeTab === 'my') {
                fetchMyQuestions(1, text);
            } else if (activeTab === 'admin') {
                fetchAllQuestions(1, text);
            }
        }, 400);
    };

    const handleTabSwitch = (tab: 'admin' | 'my' | 'create') => {
        setActiveTab(tab);
        setSearchQuery('');
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        if (tab === 'admin') {
            fetchAllQuestions(1, '');
        } else if (tab === 'my') {
            fetchMyQuestions(1, '');
        }
    };

    const handleLoadMore = () => {
        if (activeTab === 'my') {
            if (!loadingMy && !loadingMyMore && myHasMore) {
                fetchMyQuestions(myPage + 1, searchQuery, true);
            }
        } else if (activeTab === 'admin') {
            if (!loadingAdmin && !loadingAdminMore && adminHasMore) {
                fetchAllQuestions(adminPage + 1, searchQuery, true);
            }
        }
    };

    useEffect(() => {
        if (isVisible) {
            setSearchQuery('');
            if (id) {
                setActiveTab('create');
            } else {
                fetchAllQuestions(1, '');
                fetchMyQuestions(1, '');
            }
        }
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [isVisible, id]);

    const toScreeningQuestion = (item: any): Question => {
        if (item?.content && (item?.question_id || item?.id)) {
            return {
                question_id: Number(item.question_id || item.id),
                expected_boolean: item.expected_boolean !== undefined ? item.expected_boolean : (item.content.type === 'yes_no' ? false : null),
                ideal_value: item.ideal_value ?? '',
                lane: item.lane || 'screening',
                min_value: item.min_value ?? '',
                scored: !!item.scored,
                source_checksum: item.source_checksum ?? '',
                weight: item.weight ? String(item.weight) : '1',
                roles: item.roles || {},
                content: {
                    type: item.content.type || 'short_text',
                    text: item.content.text || '',
                    options: Array.isArray(item.content.options) ? item.content.options : []
                }
            };
        }

        const qId = item?.question_id || item?.id || Date.now();
        const type = item?.content?.type || item?.type || item?.answer_type || 'short_text';
        const text = item?.content?.text || item?.text || item?.question || '';
        const rawOptions = item?.content?.options || item?.options || [];
        const options = Array.isArray(rawOptions) ? rawOptions.map((opt: any, idx: number) => {
            if (typeof opt === 'string') return { id: String(idx + 1), label: opt };
            return { id: String(opt.id || idx + 1), label: opt.label || opt.name || opt.text || '' };
        }) : [];

        const roles: { [key: string]: 'ideal' | 'acceptable' | 'not_preferred' } = {};
        options.forEach(opt => {
            roles[opt.id] = 'acceptable';
        });

        return {
            question_id: Number(qId),
            expected_boolean: type === 'yes_no' ? false : null,
            ideal_value: '',
            lane: 'screening',
            min_value: '',
            scored: false,
            source_checksum: item?.source_checksum || '',
            weight: '1',
            roles,
            content: {
                type,
                text,
                options,
            }
        };
    };

    const handleToggleQuestion = (item: any) => {
        const qId = Number(item?.question_id || item?.id);
        const alreadyAdded = selectedQuestions?.some(q => q.question_id === qId);

        if (alreadyAdded) {
            onRemoveQuestion?.(qId);
            return;
        }

        setAddingId(qId);
        dispatch(QuestionDetails({ question_ids: [String(qId)] })).unwrap().then((res: any) => {
            if (res?.success && res.data?.screening && res.data.screening.length > 0) {
                if (onAddQuestion) {
                    onAddQuestion(res.data.screening[0]);
                } else if (onClose) {
                    onClose({ typeOfModal: "add", ...res.data.screening[0] });
                }
            } else {
                const formatted = toScreeningQuestion(item);
                if (onAddQuestion) {
                    onAddQuestion(formatted);
                } else if (onClose) {
                    onClose({ typeOfModal: "add", ...formatted });
                }
            }
            setAddingId(null);
        }).catch(() => {
            const formatted = toScreeningQuestion(item);
            if (onAddQuestion) {
                onAddQuestion(formatted);
            } else if (onClose) {
                onClose({ typeOfModal: "add", ...formatted });
            }
            setAddingId(null);
        });
    };

    const onSubmit = () => {
        if (isLoading) return;
        if (!question.question.trim()) {
            showAlert({ title: "Error", message: "Please enter a question prompt" });
            return;
        }

        if (question.answer_type === 'single_select' || question.answer_type === 'multi_select') {
            const validOptions = (question.options || []).filter(o => o.label && o.label.trim());
            if (validOptions.length < 2) {
                showAlert({ title: "Error", message: "Please provide at least 2 options" });
                return;
            }
        }

        setIsLoading(true);

        const fquestions: any = {
            text: question.question.trim(),
            type: question.answer_type,
        };

        if (question.answer_type === 'multi_select') {
            fquestions.options = question.options
                .filter(o => o.label && o.label.trim())
                .map(o => ({
                    label: o.label.trim(),
                    scoring_role: o.scoring_role || 'required',
                }));
        } else if (question.answer_type === 'single_select') {
            fquestions.options = question.options
                .filter(o => o.label && o.label.trim())
                .map(o => ({
                    label: o.label.trim(),
                    scoring_role: o.scoring_role || null,
                }));
        }

        dispatch(AddNewQuestion({ ...fquestions })).unwrap().then((res: any) => {
            if (res?.success) {
                showAlert({
                    title: "Success",
                    message: "Successfully added new question",
                });
                const createdQuestion = res.data?.screening?.[0] || toScreeningQuestion(res.data?.question || { ...fquestions, id: res.data?.id });
                if (onAddQuestion) {
                    onAddQuestion(createdQuestion);
                } else if (onClose) {
                    onClose({ typeOfModal: "add", ...createdQuestion });
                }
                setQuestion({
                    id: undefined,
                    question: '',
                    answer_type: 'short_text',
                    is_required: true,
                    options: [{ label: "", scoring_role: "required" }, { label: "", scoring_role: "bonus" }],
                });

                // Refresh My Questions list and switch to My Questions tab
                fetchMyQuestions();
                setActiveTab('my');
            } else {
                showAlert({
                    title: "Error",
                    message: res?.message || "Failed to add question",
                });
            }
            setIsLoading(false);
        }).catch((err: any) => {
            setIsLoading(false);
            showAlert({
                title: "Error",
                message: err?.message || "Failed to add question",
            });
        });
    };

    const getTypeLabel = (type?: string) => {
        switch (type) {
            case 'short_text': return 'Text (Short)';
            case 'long_text': return 'Text (Long)';
            case 'number': return 'Number';
            case 'single_select': return 'Single Select';
            case 'multi_select': return 'Multi Select';
            case 'yes_no': return 'Yes / No';
            default: return type || 'Text';
        }
    };

    const getTypeColors = (type?: string) => {
        switch (type) {
            case 'yes_no': return { bg: '#E6F4EA', text: '#137333' };
            case 'single_select': return { bg: '#E8F0FE', text: '#1A73E8' };
            case 'multi_select': return { bg: '#F3E8FD', text: '#8430CE' };
            case 'number': return { bg: '#FEF7E0', text: '#B06000' };
            case 'long_text': return { bg: '#FCE8E6', text: '#C5221F' };
            default: return { bg: '#F1F3F4', text: '#5F6368' };
        }
    };

    const currentList = activeTab === 'admin' ? adminQuestions : myQuestions;
    const isCurrentLoading = activeTab === 'admin' ? loadingAdmin : loadingMy;
    const isCurrentLoadingMore = activeTab === 'admin' ? loadingAdminMore : loadingMyMore;

    return (
        <Modal visible={isVisible} transparent animationType='slide' onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: 'flex-end' }}
            >
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderTopLeftRadius: 26,
                        borderTopRightRadius: 26,
                        width: "100%",
                        maxHeight: responsiveHeight(88),
                        height: responsiveHeight(85),
                        paddingHorizontal: responsiveWidth(5),
                        paddingTop: responsiveHeight(1.5),
                        paddingBottom: responsiveHeight(2.5),
                    }}
                >
                    {/* Drag indicator */}
                    <View
                        style={{
                            width: responsiveWidth(12),
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#CBD5E1',
                            alignSelf: 'center',
                            marginBottom: responsiveHeight(1.2),
                        }}
                    />

                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: responsiveHeight(1.5),
                        }}
                    >
                        <Text
                            style={{
                                fontSize: responsiveFontSize(2),
                                fontWeight: '800',
                                color: colors.textPrimary,
                            }}
                        >
                            Screening Questions
                        </Text>

                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: '#F1F5F9',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 16, color: '#475569', fontWeight: '700' }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: '#F1F5F9',
                            borderRadius: 12,
                            padding: 4,
                            marginBottom: responsiveHeight(1.5),
                        }}
                    >
                        {[
                            { key: 'admin', label: 'Admin Questions' },
                            { key: 'my', label: 'My Questions' },
                            { key: 'create', label: '+ Add New' },
                        ].map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => handleTabSwitch(tab.key as any)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: responsiveHeight(0.9),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 9,
                                        backgroundColor: isActive ? colors.white : 'transparent',
                                        shadowColor: isActive ? '#000' : 'transparent',
                                        shadowOpacity: isActive ? 0.06 : 0,
                                        shadowRadius: 2,
                                        elevation: isActive ? 2 : 0,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: responsiveFontSize(1.5),
                                            fontWeight: isActive ? '700' : '500',
                                            color: isActive ? colors.primary : colors.textPrimary,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {activeTab === 'create' ? (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: responsiveHeight(4) }}
                        >
                            <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.primary2, marginBottom: responsiveHeight(0.5) }}>
                                Question Prompt
                            </Text>
                            <CustomTextInput
                                value={question.question}
                                onChangeText={(t) => { setQuestion({ ...question, question: t }) }}
                                placeholder="e.g., How much experience do you have?"
                                placeholderTextColor={colors.gray}
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.gray,
                                    borderRadius: 8,
                                    fontSize: responsiveFontSize(1.7),
                                    paddingHorizontal: responsiveWidth(3),
                                    color: colors.textPrimary,
                                    marginBottom: responsiveHeight(.5)
                                }}
                            />


                            <CustomDropdown
                                data={QUESTION_TYPES}
                                label='Question Type'
                                placeholder="Select Type"
                                selectedValue={question.answer_type}
                                onSelect={(val) => { setQuestion({ ...question, answer_type: val }) }}
                                labelKey="name"
                                valueKey="id"
                            />

                            {question.answer_type === "single_select" && (
                                <View style={{ marginTop: responsiveHeight(1), paddingTop: responsiveHeight(1.5), borderTopWidth: 1, borderTopColor: colors.gray }}>
                                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.primary2, marginBottom: responsiveHeight(1) }}>
                                        Option Choices
                                    </Text>
                                    {question.options?.map((optText, optIdx) => (
                                        <View key={optIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2), marginBottom: responsiveHeight(1) }}>
                                            <TextInput
                                                onChangeText={(t) => {
                                                    const newOptions = [...question.options];
                                                    newOptions[optIdx].label = t;
                                                    setQuestion({ ...question, options: newOptions });
                                                }}
                                                placeholder={`Option ${optIdx + 1}`}
                                                placeholderTextColor={colors.gray}
                                                value={optText.label}
                                                style={{
                                                    flex: 1,
                                                    borderWidth: 1,
                                                    borderColor: colors.gray,
                                                    borderRadius: 8,
                                                    paddingHorizontal: responsiveWidth(3),
                                                    paddingVertical: responsiveHeight(0.8),
                                                    fontSize: responsiveFontSize(1.6),
                                                    color: colors.textPrimary,
                                                    backgroundColor: colors.white,
                                                }}
                                            />

                                            {question.options?.length > 2 && (
                                                <TouchableOpacity
                                                    style={{ padding: responsiveWidth(2) }}
                                                    onPress={() => {
                                                        setQuestion({ ...question, options: question.options.filter((_, i) => i !== optIdx) });
                                                    }}
                                                >
                                                    <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>
                                                        ✕
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={{ marginTop: responsiveHeight(0.5), alignSelf: 'flex-start' }}
                                        onPress={() => {
                                            setQuestion({ ...question, options: [...question.options, { label: "", scoring_role: null }] });
                                        }}
                                    >
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>
                                            + Add Option
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {question.answer_type === "multi_select" && (
                                <View style={{ marginTop: responsiveHeight(1), paddingTop: responsiveHeight(1.5), borderTopWidth: 1, borderTopColor: colors.gray }}>
                                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.primary2, marginBottom: responsiveHeight(0.5) }}>
                                        Option Choices & Auto-Score Roles
                                    </Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), color: colors.gray, marginBottom: responsiveHeight(1.2) }}>
                                        Add options and select an auto-score role for each (Required, Bonus, Ignore, Avoid).
                                    </Text>
                                    {question.options?.map((optText, optIdx) => (
                                        <View
                                            key={optIdx}
                                            style={{
                                                backgroundColor: '#F8FAFC',
                                                borderWidth: 1,
                                                borderColor: '#E2E8F0',
                                                borderRadius: 12,
                                                padding: responsiveWidth(3),
                                                marginBottom: responsiveHeight(1.2),
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(0.8) }}>
                                                <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '700', color: colors.textPrimary }}>
                                                    Option {optIdx + 1}
                                                </Text>
                                                {question.options?.length > 2 && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setQuestion({ ...question, options: question.options.filter((_, i) => i !== optIdx) });
                                                        }}
                                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                    >
                                                        <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.5), fontWeight: '700' }}>
                                                            ✕ Remove
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <TextInput
                                                onChangeText={(t) => {
                                                    const newOptions = [...question.options];
                                                    newOptions[optIdx].label = t;
                                                    setQuestion({ ...question, options: newOptions });
                                                }}
                                                placeholder={`e.g. ${optIdx === 0 ? 'PHP' : optIdx === 1 ? 'JavaScript' : optIdx === 2 ? 'Python' : 'Java'}`}
                                                placeholderTextColor={colors.gray}
                                                value={optText.label}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: '#CBD5E1',
                                                    borderRadius: 8,
                                                    paddingHorizontal: responsiveWidth(3),
                                                    paddingVertical: responsiveHeight(0.9),
                                                    fontSize: responsiveFontSize(1.6),
                                                    color: colors.textPrimary,
                                                    backgroundColor: colors.white,
                                                    marginBottom: responsiveHeight(1),
                                                }}
                                            />

                                            <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '600', color: colors.primary2, marginBottom: 4 }}>
                                                Auto-Score Role
                                            </Text>
                                            <CustomDropdown
                                                data={MULTI_SELECT_SCORING_ROLES}
                                                placeholder="Select Score Role"
                                                selectedValue={optText.scoring_role || 'required'}
                                                onSelect={(val) => {
                                                    const newOptions = [...question.options];
                                                    newOptions[optIdx].scoring_role = val;
                                                    setQuestion({ ...question, options: newOptions });
                                                }}
                                                labelKey="name"
                                                valueKey="id"
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: undefined,
                                                    paddingVertical: responsiveHeight(1),
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: '#CBD5E1',
                                                    backgroundColor: colors.white,
                                                }}
                                            />
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={{ marginTop: responsiveHeight(0.5), alignSelf: 'flex-start' }}
                                        onPress={() => {
                                            setQuestion({ ...question, options: [...question.options, { label: "", scoring_role: "required" }] });
                                        }}
                                    >
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>
                                            + Add Option
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Pressable
                                onPress={onSubmit}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: responsiveScreenHeight(2.5),
                                    marginBottom: responsiveScreenHeight(2),
                                    borderRadius: 12,
                                    gap: responsiveScreenWidth(1),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: responsiveScreenWidth(3),
                                    paddingVertical: responsiveScreenHeight(1.5),
                                }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8), fontWeight: '700' }}>
                                        {id ? "Update Question" : "Add Question"}
                                    </Text>
                                )}
                            </Pressable>
                        </ScrollView>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#F8FAFC',
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0',
                                    borderRadius: 10,
                                    paddingHorizontal: responsiveWidth(3),
                                    marginBottom: responsiveHeight(1.2),
                                }}
                            >
                                <Icon icon={{ name: 'search', type: 'Feather' }} size={responsiveWidth(4.5)} style={{ color: '#94A3B8' }} />
                                <TextInput
                                    placeholder={activeTab === 'admin' ? "Search admin questions..." : "Search my questions..."}
                                    placeholderTextColor="#94A3B8"
                                    value={searchQuery}
                                    onChangeText={handleSearchChange}
                                    style={{
                                        flex: 1,
                                        paddingVertical: responsiveHeight(0.9),
                                        paddingHorizontal: responsiveWidth(2),
                                        fontSize: responsiveFontSize(1.5),
                                        color: colors.textPrimary,
                                    }}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => handleSearchChange('')}>
                                        <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '600' }}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {isCurrentLoading ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                    <Text style={{ marginTop: responsiveHeight(1.5), color: colors.gray, fontSize: responsiveFontSize(1.6) }}>
                                        Loading questions...
                                    </Text>
                                </View>
                            ) : currentList.length === 0 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: responsiveWidth(5) }}>
                                    <Icon icon={{ name: 'help-circle', type: 'Feather' }} size={responsiveWidth(12)} style={{ color: '#CBD5E1' }} />
                                    <Text style={{ marginTop: responsiveHeight(1), fontSize: responsiveFontSize(1.8), fontWeight: '700', color: colors.textPrimary }}>
                                        No questions found
                                    </Text>
                                    <Text style={{ marginTop: 4, fontSize: responsiveFontSize(1.5), color: colors.gray, textAlign: 'center' }}>
                                        {activeTab === 'admin'
                                            ? "No admin questions are available at the moment."
                                            : "You haven't added any custom questions yet."}
                                    </Text>
                                    {activeTab === 'my' && (
                                        <TouchableOpacity
                                            onPress={() => handleTabSwitch('create')}
                                            style={{
                                                marginTop: responsiveHeight(2),
                                                backgroundColor: colors.primary,
                                                paddingHorizontal: responsiveWidth(4.5),
                                                paddingVertical: responsiveHeight(1),
                                                borderRadius: 10,
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontWeight: '700', fontSize: responsiveFontSize(1.6) }}>
                                                + Create New Question
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <FlatList
                                    data={currentList}
                                    keyExtractor={(item, index) => {
                                        const qId = item?.question_id || item?.id;
                                        return qId ? `q-${qId}-${index}` : `idx-${index}`;
                                    }}
                                    renderItem={({ item, index }) => {
                                        const qId = Number(item?.question_id || item?.id);
                                        const qText = item?.content?.text || item?.text || item?.question || '';
                                        const qType = item?.content?.type || item?.type || item?.answer_type || 'short_text';
                                        const rawOptions = item?.content?.options || item?.options || [];
                                        const options = Array.isArray(rawOptions) ? rawOptions : [];
                                        const isAdded = selectedQuestions?.some(q => q.question_id === qId);
                                        const isAdding = addingId === qId;
                                        const typeColor = getTypeColors(qType);

                                        return (
                                            <View
                                                key={qId ? `q-${qId}-${index}` : index}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: isAdded ? colors.primary : '#E2E8F0',
                                                    backgroundColor: isAdded ? '#F0FDF4' : colors.white,
                                                    borderRadius: 14,
                                                    padding: responsiveWidth(3.5),
                                                    marginBottom: responsiveHeight(1.2),
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: responsiveWidth(2) }}>
                                                    <Text
                                                        style={{
                                                            flex: 1,
                                                            fontSize: responsiveFontSize(1.7),
                                                            fontWeight: '700',
                                                            color: colors.textPrimary,
                                                            lineHeight: 22,
                                                        }}
                                                    >
                                                        {qText}
                                                    </Text>

                                                    <TouchableOpacity
                                                        onPress={() => handleToggleQuestion(item)}
                                                        disabled={isAdding}
                                                        style={{
                                                            backgroundColor: isAdded ? '#DCFCE7' : colors.primary,
                                                            borderWidth: isAdded ? 1 : 0,
                                                            borderColor: isAdded ? '#16A34A' : 'transparent',
                                                            paddingHorizontal: responsiveWidth(3.2),
                                                            paddingVertical: responsiveHeight(0.6),
                                                            borderRadius: 8,
                                                            minWidth: responsiveWidth(18),
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {isAdding ? (
                                                            <ActivityIndicator size="small" color={isAdded ? '#16A34A' : colors.white} />
                                                        ) : (
                                                            <Text
                                                                style={{
                                                                    color: isAdded ? '#16A34A' : colors.white,
                                                                    fontSize: responsiveFontSize(1.4),
                                                                    fontWeight: '700',
                                                                }}
                                                            >
                                                                {isAdded ? '✓ Added' : '+ Add'}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Meta: Type Badge & Options Preview */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: responsiveHeight(1) }}>
                                                    <View
                                                        style={{
                                                            backgroundColor: typeColor.bg,
                                                            paddingHorizontal: responsiveWidth(2.5),
                                                            paddingVertical: responsiveHeight(0.3),
                                                            borderRadius: 6,
                                                        }}
                                                    >
                                                        <Text style={{ color: typeColor.text, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>
                                                            {getTypeLabel(qType)}
                                                        </Text>
                                                    </View>

                                                    {options.map((opt: any, oIdx: number) => {
                                                        const label = typeof opt === 'string' ? opt : (opt?.label || opt?.name || opt?.text || '');
                                                        if (!label) return null;
                                                        return (
                                                            <View
                                                                key={oIdx}
                                                                style={{
                                                                    backgroundColor: '#F1F5F9',
                                                                    paddingHorizontal: responsiveWidth(2),
                                                                    paddingVertical: responsiveHeight(0.2),
                                                                    borderRadius: 5,
                                                                }}
                                                            >
                                                                <Text style={{ color: '#475569', fontSize: responsiveFontSize(1.2) }}>
                                                                    {label}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        );
                                    }}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: responsiveHeight(4) }}
                                    onEndReachedThreshold={0.4}
                                    onEndReached={handleLoadMore}
                                    ListFooterComponent={() => {
                                        if (!isCurrentLoadingMore) return null;
                                        return (
                                            <View style={{ paddingVertical: responsiveHeight(2), alignItems: 'center' }}>
                                                <ActivityIndicator size="small" color={colors.primary} />
                                            </View>
                                        );
                                    }}
                                />
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
const styles = StyleSheet.create({
    radioOuter: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 100,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

});