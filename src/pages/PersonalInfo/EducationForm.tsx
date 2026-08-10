import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationBar } from '../../components';
import { CustomDropdown } from './PersonalInfo';
import { useAppDispatch } from '../../store';
import { GetCountry, GetState, GetCity, DegreeLevel, DegreeType, Subject, ResultType, AddEducation, editEducation } from '../../reducer/jobsReducer';

// If you use react-native-date-picker
import { CustomMultiDropdown } from '../Search/Search';
import { Header } from '../Company/Company';
import { useAlert } from '../../context/AlertContext';
import { CustomTextInput } from '../../components';

const EducationForm = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false)

  const [degreeLevels, setDegreeLevels] = useState<any[]>([]);
  const [degreeTypes, setDegreeTypes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resultTypes, setResultTypes] = useState<any[]>([]);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const route = useRoute()
  const data = route.params
  const [formData, setFormData] = useState({
    degreeLevelId: 0,
    degreeTypeId: null,
    degreeTitle: '',
    subjectIds: [] as number[],
    countryId: 0,
    stateId: 0,
    cityId: 0,
    institution: '',
    passingYear: 0,
    degreeResult: '',
    resultTypeId: 0,
  });
  useEffect(() => {
    if (!data?.id) return;
    setFormData(prev => ({
      ...prev,
      degreeLevelId: Number(data.degree_level_id ?? 0),
      degreeTypeId: Number(data.degree_type_id ?? 0),
      degreeTitle: data.degree_title ?? '',
      subjectIds: data.majorSubjects.map((e) => e.id),
      countryId: data.country_id,
      stateId: data.state_id,
      cityId: data.city_id,
      institution: data.institution,
      passingYear: Number(data.date_completion),
      degreeResult: data.degree_result,
      resultTypeId: data.result_type_id,
    }));

    if (data.country_id) {
      dispatch(GetState({ id: data.country_id }))
        .unwrap()
        .then(res => {
          if (res?.success) setStates(res.data || []);
        });
    }
    if (data.degree_level_id) {
      dispatch(DegreeType({ id: data.degree_level_id }))
        .unwrap()
        .then(res => {
          if (res?.success) setDegreeTypes(res.data || []);
        });
    }

    if (data.state_id) {
      dispatch(GetCity({ id: data.state_id }))
        .unwrap()
        .then(res => {
          if (res?.success) setCities(res.data || []);
        });
    }
  }, [data?.id]);
  const handleChange = (key: string, value: any) => {
    setFormData(prev => {
      if (key === 'countryId' && value !== prev.countryId) {
        return { ...prev, countryId: value, stateId: 0, cityId: 0 };
      }
      if (key === 'stateId' && value !== prev.stateId) {
        return { ...prev, stateId: value, cityId: 0 };
      }
      return { ...prev, [key]: value };
    });
  };

  const yearsData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let y = currentYear; y >= currentYear - 50; y--) {
      arr.push({ id: y, name: String(y) });
    }
    return arr;
  }, []);

  useEffect(() => {
    dispatch(GetCountry()).unwrap().then(res => res?.success && setCountries(res.data || []));
    dispatch(DegreeLevel()).unwrap().then(res => res?.success && setDegreeLevels(res.data || []));
    dispatch(Subject()).unwrap().then(res => res?.success && setSubjects(res.data || []));
    dispatch(ResultType()).unwrap().then(res => res?.success && setResultTypes(res.data || []));
  }, [dispatch]);

  const onSelectLevel = (val: number) => {
    handleChange('degreeLevelId', val);
    setDegreeTypes([]);
    dispatch(DegreeType({ id: val })).unwrap().then(res => res?.success && setDegreeTypes(res.data || []));
  };

  const onSelectCountry = (val: number) => {
    handleChange('countryId', val);
    setStates([]);
    setCities([]);
    dispatch(GetState({ id: val }))
      .unwrap()
      .then(res => {
        if (res?.success) setStates(res.data || []);
      });
  };
  const onSelectState = (val: number) => {
    handleChange('stateId', val);
    setCities([]);
    dispatch(GetCity({ id: val }))
      .unwrap()
      .then(res => {
        if (res?.success) setCities(res.data || []);
      });
  };
  const Label = ({ text, isRequired = true }: { text: string, isRequired?: boolean }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {text}
      </Text>
      {
        isRequired &&
        <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
      }
    </View>
  );

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
  const { showAlert } = useAlert();

  const onSubmit = () => {
    if (loading) return
    if (!formData.degreeLevelId) {
      showAlert({
        title: "Degree Level Required",
        message: "Please select your degree level (e.g., Bachelor's, Master's).",
      });
      return;
    }

    if (!formData.degreeTitle?.trim()) {
      showAlert({
        title: "Degree Title Required",
        message: "Please enter your degree title.",
      });
      return;
    }

    if (!formData.subjectIds?.length) {
      showAlert({
        title: "Subjects Required",
        message: "Please select at least one subject or specialization.",
      });
      return;
    }

    if (!formData.countryId || !formData.stateId || !formData.cityId) {
      showAlert({
        title: "Location Required",
        message: "Please select country, state, and city of your institution.",
      });
      return;
    }

    if (!formData.institution?.trim()) {
      showAlert({
        title: "Institution Name Required",
        message: "Please enter the name of your college or university.",
      });
      return;
    }

    if (!formData.passingYear) {
      showAlert({
        title: "Passing Year Required",
        message: "Please select your year of completion.",
      });
      return;
    }

    if (!formData.degreeResult?.trim()) {
      showAlert({
        title: "Result Required",
        message: "Please enter your marks, CGPA, or percentage.",
      });
      return;
    }

    if (!formData.resultTypeId) {
      showAlert({
        title: "Result Type Required",
        message: "Please select a result type (CGPA, Percentage, Grade).",
      });
      return;
    }
    setLoading(true)
    const payload = {
      degree_level_id: formData.degreeLevelId,
      degree_type_id: formData.degreeTypeId,
      degree_title: formData.degreeTitle,

      country_id: formData.countryId,
      state_id: formData.stateId,
      city_id: formData.cityId,

      date_completion: formData.passingYear, // year (number)

      institution: formData.institution,
      degree_result: formData.degreeResult,
      result_type_id: formData.resultTypeId,

      major_subjects: formData.subjectIds, // API expects array
    };
    if (data?.id) {
      dispatch(editEducation({ ...payload, id: data.id }))
        .unwrap()
        .then(res => {
          if (res?.success) {
            navigation.goBack();
          }
          else {
            showAlert({
              title: "Error",
              message: res?.message || "Something went wrong",
            });
          }
          setLoading(false)
        })
        .catch(err => {
        });
    } else {
      console.log(payload)
      dispatch(AddEducation(payload))
        .unwrap()
        .then(res => {
          if (res?.success) {
            navigation.goBack();
          }
          else {
            showAlert({
              title: "Error",
              message: res?.message || "Something went wrong",
            });
          }
          setLoading(false)

        })
        .catch(err => {
        });
    }

  };

  return (
    <NavigationBar bottomPadding={true} navigationBar={false}>
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
          <Header title={data?.id ? "Edit Education" : "Add New Education"} />
          <Label text="Degree Level" />
          <CustomDropdown
            data={degreeLevels}
            placeholder="Select"
            selectedValue={formData.degreeLevelId}
            onSelect={onSelectLevel}
            labelKey="name"
            valueKey="id"
          />

          {/* Degree Type */}
          <Label text="Degree Type" isRequired={false} />
          <CustomDropdown
            data={degreeTypes}
            placeholder="Select"
            selectedValue={formData.degreeTypeId}
            onSelect={(v: number) => handleChange('degreeTypeId', v)}
            labelKey="name"
            valueKey="id"
          />

          <Label text="Degree Title" />
          <CustomTextInput
            value={formData.degreeTitle}
            onChangeText={t => handleChange('degreeTitle', t)}
            style={inputStyle}
            placeholderTextColor={colors.gray}
            autoFocus={true}
            maxLength={30}
            placeholder="e.g., Bachelor of Computer Science"
          />
          <Label text="Major Subjects" />
          <CustomMultiDropdown
            data={subjects}
            placeholder="Select Subjects"
            selectedValues={formData.subjectIds}
            onSelect={(arr: number[]) => setFormData(prev => ({ ...prev, subjectIds: arr }))}
            labelKey="name"
            valueKey="id"
          />

          {/* Country */}
          <Label text="Country" />
          <CustomDropdown
            data={countries}
            placeholder="Select"
            selectedValue={formData.countryId}
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
                selectedValue={formData.stateId}
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
                selectedValue={formData.cityId}
                onSelect={(v: number) => handleChange('cityId', v)}
                labelKey="name"
                valueKey="id"
              />
            </View>
          </View>

          {/* Institution */}
          <Label text="Institution" />
          <CustomTextInput
            value={formData.institution}
            onChangeText={t => handleChange('institution', t)}
            style={inputStyle}
            maxLength={30}
            placeholderTextColor={colors.gray}
            placeholder="e.g., Panjab University"
          />

          {/* Passing Year (Year dropdown) */}
          <Label text="Passing Year" />
          <CustomDropdown
            data={yearsData}
            placeholder="Select year"
            selectedValue={formData.passingYear}
            onSelect={(v: number) => handleChange('passingYear', v)}
            labelKey="name"
            valueKey="id"
          />

          {/* Degree Result (single line) */}
          <Label text="Degree Result" />
          <CustomTextInput
            value={formData.degreeResult}
            onChangeText={t => handleChange('degreeResult', t)}
            style={inputStyle}
            placeholderTextColor={colors.gray}
            maxLength={4}
            placeholder="e.g., 7.8"
            keyboardType="decimal-pad"
          />

          {/* Result Type */}
          <Label text="Result Type" />
          <CustomDropdown
            data={resultTypes}
            placeholder="Select"
            selectedValue={formData.resultTypeId}
            onSelect={(v: number) => handleChange('resultTypeId', v)}
            labelKey="name"
            valueKey="id"
          />

          {/* Submit */}
          <Pressable
            onPress={onSubmit}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: responsiveScreenHeight(2),
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary,
              paddingHorizontal: responsiveScreenWidth(3),
              paddingVertical: responsiveScreenHeight(1.5),
            }}
          >
            {
              loading ? <ActivityIndicator color={"white"} /> :
                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                  {data?.id ? "Update Education" : "Add Education"}

                </Text>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

    </NavigationBar>
  );
};

export default EducationForm;

const styles = StyleSheet.create({});

