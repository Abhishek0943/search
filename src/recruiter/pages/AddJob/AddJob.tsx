import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { use, useContext, useEffect, useRef, useState } from 'react'
import NavigationBar from '../../components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import { useNavigation, useRoute } from '@react-navigation/native'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { routes } from '../../../constants/values'
import { CustomDropdown, formatDate } from '../../../pages/PersonalInfo/PersonalInfo'
import { useAppDispatch } from '../../../store'
import { AddNewJob, Career, Currencies, DegreeLevel, DegreeType, EditNewJob, Experiences, FunctionalAria, GetCity, GetCountry, GetGender, GetSkills, GetState, JobShifts, JobTypes, NumberOfPositions, SalaryPeriods } from '../../../reducer/jobsReducer'
import Text from '../../../components/Text'
import DatePicker from 'react-native-date-picker'
import { useAlert } from '../../../context/AlertContext'
import { CustomMultiDropdown } from '../../../pages/Search/Search'
import { RecruiterProfile } from '../../../reducer/recruiterReducer'
type Option = { id: number; name: string };
const AddJob = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const editorRef = useRef<RichEditor | null>(null);
    const benefitsRef = useRef<RichEditor | null>(null);
    const [skills, setSkills] = useState<Option[]>([]);
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);
    const [currencies, setCurrencies] = useState<Option[]>([]);
    const [salaryPeriods, setSalaryPeriods] = useState<Option[]>([]);
    const [countries, setCountries] = useState<Option[]>([]);
    // ❌ TODO: These must come from API if you want dropdowns to work
    const [careerLevels, setCareerLevels] = useState<Option[]>([]);
    const [functionalAreas, setFunctionalAreas] = useState<Option[]>([]);
    const [jobTypes, setJobTypes] = useState<Option[]>([]);
    const [jobShifts, setJobShifts] = useState<Option[]>([]);
    const route = useRoute()
    const jobData = route.params;

    const [genders, setGenders] = useState<Option[]>([]);
    const [degrees, setDegrees] = useState<Option[]>([]);
    const [experiences, setExperiences] = useState<Option[]>([]);
    const [vacancies, setVacancies] = useState<Option[]>([]);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        jobTitle: '',
        description: '',
        benefits: '',
        startDate: new Date(),
        skills: [],
        country: 0,
        state: 0,
        city: 0,
        functionalAreas: 0,
        salary: '',
        salaryTo: '',
        currency: 0,
        salaryPeriod: 0,

        hideSalary: false,
        isFreelance: false,
        isExternalJob: false,
        careerLevel: 0,
        jobType: 0,
        jobShift: 0,
        gender: 0,
        degree: 0,
        jobExperience: 0,
        numberOfPositions: 0,
    });


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

    const Label = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
            <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
                {text}
            </Text>
            <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
        </View>
    );

    const onSelectCountry = (val: number) => {
        handleChange('country', val);
        setStates([]);
        setCities([]);

        dispatch(GetState({ id: val }))
            .unwrap()
            .then(res => {
                if (res?.success) setStates(res.data || []);
            })
            .catch(() => { });
    };

    const onSelectState = (val: number) => {
        handleChange('state', val);
        setCities([]);

        dispatch(GetCity({ id: val }))
            .unwrap()
            .then(res => {
                if (res?.success) setCities(res.data || []);
            })
            .catch(() => { });
    };

    useEffect(() => {
        // ✅ Working APIs from your code
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
        dispatch(Career())
            .unwrap()
            .then(res => {
                if (res?.success) setCareerLevels(res.data || []);
            })
            .catch(() => { });
        dispatch(FunctionalAria())
            .unwrap()
            .then(res => {
                if (res?.success) setFunctionalAreas(res.data || []);
            })
            .catch(() => { });
        dispatch(JobTypes())
            .unwrap()
            .then(res => {
                if (res?.success) setJobTypes(res.data || []);
            })
            .catch(() => { });
        dispatch(JobShifts())
            .unwrap()
            .then(res => {
                if (res?.success) setJobShifts(res.data || []);
            })
            .catch(() => { });
        dispatch(NumberOfPositions())
            .unwrap()
            .then(res => {
                if (res?.success) setVacancies(res.data || []);
            })
            .catch(() => { });
        dispatch(GetGender())
            .unwrap()
            .then(res => {
                if (res?.success) setGenders(res.data || []);
            })
            .catch(() => { });
        dispatch(DegreeLevel())
            .unwrap()
            .then(res => {
                if (res?.success) setDegrees(res.data || []);
            })
            .catch(() => { });
        dispatch(Experiences())
            .unwrap()
            .then(res => {
                if (res?.success) setExperiences(res.data || []);
            })
            .catch(() => { });

    }, [dispatch]);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (jobData) {
            editorRef.current.setContentHTML(jobData.description);
            benefitsRef.current.setContentHTML(jobData.benefits);
            setFormData({
                jobTitle: jobData.title || '',
                description: jobData.description || '',
                benefits: jobData.benefits || '',
                startDate: jobData.expiry_date ? new Date(jobData.expiry_date) : new Date(),
                skills: jobData.skills.map((e) => e.skill_id),
                country: jobData.country_id || 0,
                state: jobData.state_id || 0,


                city: jobData.city_id || 0,
                functionalAreas: jobData.functional_area.id || 0,
                salary: jobData.salary_from ? String(jobData.salary_from) : '',
                salaryTo: jobData.salary_to ? String(jobData.salary_to) : '',

                currency: jobData.salary_currency || 0,
                salaryPeriod: jobData.salary_period.id || 0,
                hideSalary: jobData.hide_salary === 1,
                isFreelance: jobData.is_freelance === 1,
                isExternalJob: jobData.external_job === "yes",
                careerLevel: jobData.career_level_id || 0,
                jobType: jobData.job_type_id || 0,
                jobShift: jobData.job_shift_id || 0,
                gender: jobData.gender_id || 0,
                degree: jobData.degree_level_id || 0,
                jobExperience: jobData.job_experience_id || 0,
                numberOfPositions: Number(jobData.num_of_positions) || 0,
            });
            if (jobData.country_id) {
                dispatch(GetState({ id: jobData.country_id }))
                    .unwrap()
                    .then(res => {
                        res.success && setStates(res.data)
                    });
            }
            if (jobData.state_id
            ) {
                dispatch(GetCity({
                    id: jobData.state_id
                }))
                    .unwrap()
                    .then(res => {
                        res.success && setCities(res.data)
                    });
            }
        }
    }, [jobData]);
    const onSubmit = () => {
        if (isLoading) return;
        // ✅ Required field validation (inside submit only)
        const requiredChecks = [
            { value: formData.jobTitle, label: "Job Title" },
            { value: formData.description, label: "Job Description" },
            { value: formData.benefits, label: "Benefits" },
            { value: formData.skills, label: "Skills" },

            { value: formData.country, label: "Country" },
            { value: formData.state, label: "State" },
            { value: formData.city, label: "City" },

            { value: formData.functionalAreas, label: "Functional Area" },

            { value: formData.salary, label: "Salary From" },
            { value: formData.salaryTo, label: "Salary To" },
            { value: formData.currency, label: "Salary Currency" },
            { value: formData.salaryPeriod, label: "Salary Period" },

            { value: formData.startDate, label: "Expiry Date" },

            { value: formData.careerLevel, label: "Career Level" },
            { value: formData.jobType, label: "Job Type" },
            { value: formData.jobShift, label: "Job Shift" },
            { value: formData.gender, label: "Gender" },

            { value: formData.degree, label: "Degree Level" },
            { value: formData.jobExperience, label: "Job Experience" },

            { value: formData.numberOfPositions, label: "Number of Positions" },
        ];

        const invalid = requiredChecks.find(item => {
            if (item.value === null || item.value === undefined|| item.value === 0) return true;
            if (typeof item.value === "string" && item.value.trim() === "") return true;
            if (Array.isArray(item.value) && item.value.length === 0) return true;
            return false;
        });

        if (invalid) {
            showAlert({
                title: "Validation",
                message: `Please enter ${invalid.label}.`,
            });
            return;
        }

        const salaryFrom = Number(formData.salary);
        const salaryTo = Number(formData.salaryTo);

        if (!Number.isFinite(salaryFrom) || salaryFrom <= 0) {
            showAlert({ title: "Validation", message: "Salary From must be a valid number." });
            return;
        }

        if (!Number.isFinite(salaryTo) || salaryTo <= 0) {
            showAlert({ title: "Validation", message: "Salary To must be a valid number." });
            return;
        }

        if (salaryTo < salaryFrom) {
            showAlert({ title: "Validation", message: "Salary To cannot be less than Salary From." });
            return;
        }

        const payload = {
            title: formData.jobTitle,
            description: formData.description,
            benefits: formData.benefits,
            skills: formData.skills,
            country_id: formData.country,
            state_id: formData.state,
            city_id: formData.city,
            functional_area_id: formData.functionalAreas,
            salary_from: formData.salary,
            salary_to: formData.salaryTo,
            salary_currency: formData.currency,
            salary_period_id: formData.salaryPeriod,
            expiry_date: formData.startDate
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            hide_salary: formData.hideSalary ? 1 : 0,
            is_freelance: formData.isFreelance ? 1 : 0,
            external_job: formData.isExternalJob ? "yes" : "no",
            career_level_id: formData.careerLevel,
            job_type_id: formData.jobType,
            job_shift_id: formData.jobShift,
            gender_id: formData.gender,
            degree_level_id: formData.degree,
            job_experience_id: formData.jobExperience,
            num_of_positions: formData.numberOfPositions,
        };
        setIsLoading(true);
        if (jobData?.id) {
            dispatch(EditNewJob({ id: jobData.id, ...payload })).unwrap()
                .then(res => {
                    if (res?.success) {
                        navigation.goBack()
                         showAlert({
                            title: "Validation",
                            message: "Successfully updated new job",
                        })
                    }
                    else {
                        showAlert({
                            title: "Validation",
                            message: res.message,
                        })
                    }
                    setIsLoading(false);
                })
                .catch(() => { setIsLoading(false); });
        }
        else {
            dispatch(AddNewJob(payload)).unwrap()
                .then(res => {
                    if (res?.success) {
                        navigation.goBack()
                         showAlert({
                            title: "Validation",
                            message: "Successfully added new job",
                        })
                        dispatch(RecruiterProfile())
                    }
                    else {
                        showAlert({
                            title: "Validation",
                            message: res.message,
                        })
                    }
                    setIsLoading(false);
                })
                .catch(() => { setIsLoading(false); });
        }
    };

    return (
        <NavigationBar navigationBar={jobData?.id ? false : true} name={routes.ADDJOB}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        position: 'relative',
                        alignItems: 'center',
                        borderBottomColor: colors.textDisabled,
                        borderBottomWidth: 0.5,
                        paddingBottom: responsiveScreenHeight(2),
                        width: responsiveScreenWidth(100),
                        paddingHorizontal: responsiveScreenWidth(5),
                    }}
                >
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'left',
                            fontSize: responsiveScreenFontSize(2),
                            color: colors.textPrimary,
                            fontWeight: '800',
                            textTransform: 'capitalize',
                        }}
                    >
                        {jobData?.id ? `Edit Job` : "Post a job"}
                    </Text>

                    {/* Invisible icon to balance layout */}
                    <Image
                        source={imagePath.backIcon}
                        style={{ opacity: 0, resizeMode: 'contain', transform: [{ scale: 1.1 }] }}
                    />
                </View>

                {/* ✅ Job Title */}
                <Label text="Job Title" />
                <TextInput
                    value={formData.jobTitle}
                    onChangeText={t => handleChange('jobTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="e.g., React Native Developer"
                />

                {/* ✅ Description */}
                <Label text="Description" />
                <View style={[{ width: '100%', minHeight: responsiveScreenHeight(20) }, { ...inputStyle, paddingHorizontal: 0, paddingVertical: 0 }]}>
                    <RichEditor
                        ref={r => (editorRef.current = r)}
                        placeholder="Write job description here..."
                        onChange={html => handleChange('description', html)}
                        value={formData.description}
                        editorStyle={{
                            backgroundColor: 'transparent',
                            color: colors.textPrimary,
                            placeholderColor: colors.gray,
                            contentCSSText: `font-size: 16px;`,
                        }}
                    />
                </View>

                {/* ✅ Toolbar (always render; avoids focus null issues) */}
                <RichToolbar
                    editor={editorRef}
                    actions={[
                        actions.setBold,
                        actions.setItalic,
                        actions.insertBulletsList,
                        actions.insertOrderedList,
                    ]}
                />

                {/* ✅ Benefits */}
                <Label text="Benefits" />
                <View style={[{ width: '100%', minHeight: responsiveScreenHeight(20) }, { ...inputStyle, paddingHorizontal: 0, paddingVertical: 0 }]}>
                    <RichEditor
                        ref={r => (benefitsRef.current = r)}
                        placeholder="Write job benefits here..."
                        onChange={html => handleChange('benefits', html)} // ✅ HTML goes to API
                        editorStyle={{
                            backgroundColor: 'transparent',
                            color: colors.textPrimary,
                            placeholderColor: colors.gray,
                            contentCSSText: `font-size: 16px;`,
                        }}
                    />
                </View>

                <RichToolbar
                    editor={benefitsRef}
                    actions={[
                        actions.setBold,
                        actions.setItalic,
                        actions.insertBulletsList,
                        actions.insertOrderedList,
                    ]}
                />

                {/* ✅ Skills */}
                <Label text="Skills" />
                <CustomMultiDropdown
                    data={skills}
                    placeholder="Select"
                    onSelect={(arr: number[]) => {

                        setFormData(prev => ({ ...prev, skills: arr }))
                    }}
                    selectedValues={formData.skills}

                    // onSelect={(v: number) => handleChange('skills', v)}
                    labelKey="name"
                    valueKey="id"
                />

                {/* ✅ Country */}
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

                {/* ✅ Salary + Salary To */}
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Salary" />
                        <TextInput
                            value={formData.salary}
                            onChangeText={t => handleChange('salary', t)}
                            style={inputStyle}
                            keyboardType="number-pad"
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., 10000"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Salary To" />
                        <TextInput
                            value={formData.salaryTo}
                            onChangeText={t => handleChange('salaryTo', t)}
                            style={inputStyle}
                            keyboardType="number-pad"
                            placeholderTextColor={colors.gray}
                            placeholder="e.g., 20000"
                        />
                    </View>
                </View>

                {/* ✅ Currency + Salary Period */}
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

                {/* ✅ Hide Salary (radio) */}
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
                            onPress={() => handleChange('hideSalary', true)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                {formData.hideSalary && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>Yes</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleChange('hideSalary', false)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                {!formData.hideSalary && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>No</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Career Level" />
                        <CustomDropdown
                            data={careerLevels}
                            placeholder="Select"
                            selectedValue={formData.careerLevel}
                            onSelect={(v: number) => handleChange('careerLevel', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Label text="Functional Area" />
                        <CustomDropdown
                            data={functionalAreas}
                            placeholder="Select"
                            selectedValue={formData.functionalAreas}
                            onSelect={(v: number) => handleChange('functionalAreas', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Job Type" />
                        <CustomDropdown
                            data={jobTypes}
                            placeholder="Select"
                            selectedValue={formData.jobType}
                            onSelect={(v: number) => handleChange('jobType', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Label text="Job Shift" />
                        <CustomDropdown
                            data={jobShifts}
                            placeholder="Select"
                            selectedValue={formData.jobShift}
                            onSelect={(v: number) => handleChange('jobShift', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>

                    <View style={{ flex: 1 }}>
                        <Label text="Number Of Positions" />
                        <CustomDropdown
                            data={vacancies}
                            placeholder="Select"
                            selectedValue={formData.numberOfPositions}
                            onSelect={(v: number) => handleChange('numberOfPositions', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Label text="Gender" />
                        <CustomDropdown
                            data={genders}
                            placeholder="Select"
                            selectedValue={formData.gender}
                            onSelect={(v: number) => handleChange('gender', v)}
                            labelKey="gender"
                            valueKey="id"
                        />
                    </View>
                </View>

                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Date" />
                        <TouchableOpacity
                            onPress={() => setStartDateOpen(true)}
                            style={{
                                ...inputStyle,
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary }}>
                                {formatDate(formData.startDate)}
                            </Text>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1 }}>
                        <Label text="Degree" />
                        <CustomDropdown
                            data={degrees}
                            placeholder="Select"
                            selectedValue={formData.degree}
                            onSelect={(v: number) => handleChange('degree', v)}
                            labelKey="name"
                            valueKey="id"
                        />
                    </View>

                </View>

                <View style={{ width: '100%', flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Job Experience" />
                        <CustomDropdown
                            data={experiences}
                            placeholder="Select"
                            selectedValue={formData.jobExperience}
                            onSelect={(v: number) => handleChange('jobExperience', v)}
                            labelKey="name"
                            valueKey="id"
                        />

                    </View>

                    <View style={{ flex: 1 }} />
                </View>

                <View style={{ width: '100%', marginTop: responsiveScreenHeight(1.2), flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            Is this External Job?
                        </Text>

                        <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                            <Pressable onPress={() => handleChange('isExternalJob', true)} style={styles.radioRow}>
                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                    {formData.isExternalJob && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>Yes</Text>
                            </Pressable>

                            <Pressable onPress={() => handleChange('isExternalJob', false)} style={styles.radioRow}>
                                <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                                    {!formData.isExternalJob && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                </View>
                                <Text style={{ color: colors.textPrimary }}>No</Text>
                            </Pressable>
                        </View>
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
                        isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                            {jobData?.id ? "Update Job" : "Submit Job"}
                        </Text>
                    }

                </Pressable>
                <DatePicker
                    modal
                    open={startDateOpen}
                    date={formData.startDate}
                    minimumDate={new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        setStartDateOpen(false);
                        handleChange('startDate', date);
                    }}
                    onCancel={() => setStartDateOpen(false)}
                />
            </ScrollView>
        </NavigationBar>
    );
};

export default AddJob;

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
    sectionTitle: {
        fontSize: responsiveScreenFontSize(1.8),
        marginBottom: responsiveScreenHeight(1),
    },
});