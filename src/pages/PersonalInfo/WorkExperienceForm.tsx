import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationBar } from '../../components';
import imagePath from '../../assets/imagePath';
import { CustomDropdown, formatDate } from './PersonalInfo';
import { useAppDispatch } from '../../store';
import { GetCountry, GetState, GetCity, AddWorkExperience, EditWorkExperience } from '../../reducer/jobsReducer';

// If you use react-native-date-picker
import DatePicker from 'react-native-date-picker';
import { Header } from '../Company/Company';

const WorkExperienceForm = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const route = useRoute()
  const data= route.params

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
  useEffect(() => {
    if (!data?.id) return;

    setFormData(prev => ({
      ...prev,
      experienceTitle: data.title ?? '',
      company: data.company ?? '',
      country: Number(data.country_id ?? 0),
      state: Number(data.state_id ?? 0),
      city: Number(data.city_id ?? 0),
      startDate: data.date_start ? new Date(data.date_start) : new Date(),
      endDate: data.date_end ? new Date(data.date_end) : new Date(),
      currentlyWorking: !!data.is_currently_working,
      description: data.description ?? '',
    }));
    if (data.country_id) {
      dispatch(GetState({ id: data.country_id }))
        .unwrap()
        .then(res => {
          res.success && setStates(res.data)
        });
    }
    if (data.state_id) {
      dispatch(GetCity({ id: data.state_id }))
        .unwrap()
        .then(res => {
          res.success && setCities(res.data)
        });
    }
  }, [data?.id]);
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

  useEffect(() => {

    dispatch(GetCountry())
      .unwrap()
      .then(res => {
        if (res?.success) setCountries(res.data || []);
      });
  }, [dispatch]);

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

  const onSubmit = () => {
    if (!formData.experienceTitle.trim()) return;
    if (!formData.company.trim()) return;
    if (!formData.country) return;
    if (!formData.state) return;
    if (!formData.city) return;
    if (!formData.description.trim()) return;
    if (!formData.currentlyWorking && formData.endDate < formData.startDate) return;
    if (data?.id) {
      dispatch(EditWorkExperience({
        title: formData.experienceTitle,
        company: formData.company,
        country_id: formData.country,
        state_id: formData.state,
        city_id: formData.city,
        date_start: formData.startDate,
        date_end: formData.currentlyWorking
          ? null
          : formData.endDate,
        is_currently_working: formData.currentlyWorking ? 1 : 0,
        description: formData.description,
        id: data.id
      })).unwrap().then(res => {
        if (res.success) {
          navigation.goBack()
        }
      })
    } else {
      dispatch(AddWorkExperience({
        title: formData.experienceTitle,
        company: formData.company,
        country_id: formData.country,
        state_id: formData.state,
        city_id: formData.city,
        date_start: formData.startDate,
        date_end: formData.currentlyWorking
          ? null
          : formData.endDate,
        is_currently_working: formData.currentlyWorking ? 1 : 0,
        description: formData.description,
      })).unwrap().then(res => {
        if (res.success) {
          navigation.goBack()
        }
      })
    }

  };

  const Label = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {text}
      </Text>
      <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
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

  return (
    <NavigationBar navigationBar={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: responsiveScreenWidth(90),
          alignSelf: 'center',
          alignItems: 'center',
          paddingBottom: responsiveScreenHeight(3),
        }}
      >
      <Header title={data?.id ? "Edit Work Experience" : "Add Work Experience"} />

        <Label text="Experience Title" />
        <TextInput
          value={formData.experienceTitle}
          onChangeText={t => handleChange('experienceTitle', t)}
          style={inputStyle}
          placeholderTextColor={colors.gray}
          placeholder="e.g., React Native Developer"
        />

        {/* Company */}
        <Label text="Company" />
        <TextInput
          value={formData.company}
          onChangeText={t => handleChange('company', t)}
          style={inputStyle}
          placeholderTextColor={colors.gray}
          placeholder="e.g., KBS IT Solutions"
        />

        {/* Country */}
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

        {/* Start Date */}
        <Label text="Experience Start Date" />
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

        {/* End Date */}
        <Label text="Experience End Date" />
        <TouchableOpacity
          onPress={() => {
            if (!formData.currentlyWorking) setEndDateOpen(true);
          }}
          style={{
            ...inputStyle,
            justifyContent: 'center',
            opacity: formData.currentlyWorking ? 0.5 : 1,
          }}
          disabled={formData.currentlyWorking}
        >
          <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary }}>
            {formData.currentlyWorking ? 'Present' : formatDate(formData.endDate)}
          </Text>
        </TouchableOpacity>

        {/* Currently Working */}
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
            Currently Working?
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

        {/* Description */}
        <Label text="Experience Description" />
        <TextInput
          value={formData.description}
          onChangeText={t => handleChange('description', t)}
          multiline
          style={[inputStyle, { minHeight: responsiveScreenHeight(12), textAlignVertical: 'top' }]}
          placeholderTextColor={colors.gray}
          placeholder="Describe your role, responsibilities, achievements..."
        />

        {/* Submit */}
        <Pressable
          onPress={onSubmit}
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: responsiveScreenHeight(2),
            borderRadius: 6,
            gap: responsiveScreenWidth(1),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingHorizontal: responsiveScreenWidth(3),
            paddingVertical: responsiveScreenHeight(1.5),
          }}
        >
          <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
            Save Experience
          </Text>
        </Pressable>

        {/* Date Pickers */}
        <DatePicker
          modal
          open={startDateOpen}
          date={formData.startDate}
          mode="date"
          onConfirm={(date) => {
            setStartDateOpen(false);
            handleChange('startDate', date);
          }}
          onCancel={() => setStartDateOpen(false)}
        />

        <DatePicker
          modal
          open={endDateOpen}
          date={formData.endDate}
          mode="date"
          onConfirm={(date) => {
            setEndDateOpen(false);
            handleChange('endDate', date);
          }}
          onCancel={() => setEndDateOpen(false)}
        />
      </ScrollView>
    </NavigationBar>
  );
};

export default WorkExperienceForm;

const styles = StyleSheet.create({});

