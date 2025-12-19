import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { NavigationBar } from '../../components';
import imagePath from '../../assets/imagePath';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { useAppDispatch } from '../../store';
import DatePicker from 'react-native-date-picker';
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
  ProfileData,
  Update,
} from '../../reducer/jobsReducer';
import { useNavigation, useRoute } from '@react-navigation/native';
import Text from '../../components/Text';
import Icon from '../../utils/Icon';

const PersonalInfo = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute()
  const data = route.params
  // dropdown datasets
  const [genderOptions, setGenderOptions] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [careerLevels, setCareerLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [functionalAreas, setFunctionalAreas] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState<any>([]);
  const [dobModalOpen, setDobModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 0,
    country: 0,
    state: 0,
    city: 0,
    nationality: 0,
    phoneNumber: '',
    mobileNumber: '',
    streetAddress: '',
    videoProfileUrl: '',
    dateOfBirth: new Date(),
    experience: 0,
    careerLevel: 0,
    industry: 0,
    functionalArea: 0,
    salaryCurrency: 0,
    currentSalary: '',
    expectedSalary: '',
  });
  useEffect(() => {
    if (!data) return;
    setFormData(prev => ({
      ...prev,
      firstName: data.first_name ?? '',
      lastName: data.last_name ?? '',
      gender: Number(data.gender_id) || 0,
      country: Number(data.country_id) || 0,
      state: Number(data.state_id) || 0,
      city: Number(data.city_id) || 0,
      nationality: Number(data.nationality_id) || 0,
      phoneNumber: data.phone ?? '',
      mobileNumber: data.phone ?? '',
      dateOfBirth: data.date_of_birth
        ? new Date(data.date_of_birth) 
        : null,
      currentSalary: data.current_salary ?? '',
      expectedSalary: data.expected_salary ?? '',
      streetAddress:data.street_address,
     videoProfileUrl:data. video_link,
     experience:data.job_experience.id,
     careerLevel:data.career_level.id,
     industry:data.industry.id,
     functionalArea:data.functional_area.id,
     salaryCurrency:data.salary_currency
    }));
     if (data.country_id) {
          dispatch(GetState({ id: data.country_id }))
            .unwrap()
            .then(res => {
              if (res?.success) setStates(res.data || []);
            });
        }
       
    
        if (data.state_id) {
          dispatch(GetCity({ id: data.state_id }))
            .unwrap()
            .then(res => {
              if (res?.success) setCities(res.data || []);
            });
        }
  }, [data]);
  useEffect(() => {
    dispatch(GetGender())
      .unwrap()
      .then(res => {
        if (res.success) {
          setGenderOptions(res.data);
        }
      });

    dispatch(GetNationalities())
      .unwrap()
      .then(res => {
        if (res.success) {
          setNationalities(res.data);
        }
      });

    dispatch(GetCountry())
      .unwrap()
      .then(res => {
        if (res.success) {
          setCountries(res.data);
        }
      });

    dispatch(Experiences())
      .unwrap()
      .then(res => {
        if (res.success) {
          setExperiences(res.data);
        }
      });

    dispatch(Career())
      .unwrap()
      .then(res => {
        if (res.success) {
          setCareerLevels(res.data);
        }
      });

    dispatch(Industries())
      .unwrap()
      .then(res => {
        if (res.success) {
          setIndustries(res.data);
        }
      });

    dispatch(FunctionalAria())
      .unwrap()
      .then(res => {
        if (res.success) {
          setFunctionalAreas(res.data);
        }
      });
    dispatch(Currencies())
      .unwrap()
      .then(res => {
        if (res.success) {
          setCurrencies(res.data);
        }
      });

    // If you have an API for currencies, call it here.
    // Example with static data (replace with real API later):

  }, [dispatch]);

  const handleChange = (key, value) => {
    setFormData(prev => {
      if (key === 'country' && value !== prev.country) {
        return {
          ...prev,
          country: value,
          state: 0,
          city: 0,
        };
      }
      if (key === 'state' && value !== prev.state) {
        return {
          ...prev,
          state: value,
          city: 0,
        };
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <>

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
          {/* Header */}
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
            <Pressable onPress={() => navigation.goBack()}>
              <Image source={imagePath.backIcon} style={{ resizeMode: 'contain' }} />
            </Pressable>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: responsiveScreenFontSize(2),
                color: colors.textPrimary,
                fontWeight: '600',
              }}
            >
              Personal Info
            </Text>
            {/* Invisible icon to balance layout */}
            <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
          </View>

          {/* First & Last Name */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  First Name
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter First Name"
                value={formData.firstName}
                onChangeText={text => handleChange('firstName', text)}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Last Name
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChangeText={text => handleChange('lastName', text)}
              />
            </View>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Gender
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={genderOptions}
                placeholder="Select"
                selectedValue={formData.gender}
                onSelect={val => handleChange('gender', val)}
                labelKey="gender"
                valueKey="id"
              />
            </View>

            <View style={{ flex: 1, position: "relative" }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Date of Birth
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDobModalOpen(true)}
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  paddingHorizontal: responsiveScreenWidth(3),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveScreenFontSize(1.8),
                    color: formData.dateOfBirth ? colors.textPrimary : colors.gray,
                  }}
                >
                  {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>


          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              marginTop: responsiveScreenHeight(1),
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              Country
            </Text>
            <Text
              style={{
                color: colors.red,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              *
            </Text>
          </View>
          <CustomDropdown
            data={countries}
            placeholder="Select"
            selectedValue={formData.country}
            onSelect={(val: number) => {
              handleChange('country', val);
              setStates([]);
              setCities([]);
              dispatch(GetState({ id: val }))
                .unwrap()
                .then(res => {
                  if (res.success) {
                    setStates(res.data);
                  }
                });
            }}
            labelKey="name"
            valueKey="id"
          />

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  State
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={states}
                placeholder="Select"
                selectedValue={formData.state}
                onSelect={(val: number) => {
                  handleChange('state', val);
                  setCities([]);
                  dispatch(GetCity({ id: val }))
                    .unwrap()
                    .then(res => {
                      if (res.success) {
                        setCities(res.data);
                      }
                    });
                }}
                labelKey="name"
                valueKey="id"
              />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  City
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              marginTop: responsiveScreenHeight(1),
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              Nationality
            </Text>
            <Text
              style={{
                color: colors.red,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              *
            </Text>
          </View>
          <CustomDropdown
            data={nationalities}
            placeholder="Select"
            selectedValue={formData.nationality}
            onSelect={(val: number) => handleChange('nationality', val)}
            labelKey="name"
            valueKey="id"
          />

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Phone Number
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter Phone Number"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={text => handleChange('phoneNumber', text)}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Mobile Number
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter Mobile Number"
                keyboardType="phone-pad"
                value={formData.mobileNumber}
                onChangeText={text => handleChange('mobileNumber', text)}
              />
            </View>
          </View>

          {/* Street Address */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              marginTop: responsiveScreenHeight(1),
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              Street Address
            </Text>
            <Text
              style={{
                color: colors.red,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              *
            </Text>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              width: '100%',
              borderRadius: 6,
              borderColor: colors.mediumGray,
              color: colors.textPrimary,
              paddingHorizontal: responsiveScreenWidth(3),
              fontSize: responsiveScreenFontSize(1.8),
              paddingVertical: responsiveScreenHeight(1.3),
              marginTop: responsiveScreenHeight(1),
            }}
            placeholderTextColor={colors.gray}
            placeholder="Enter Street Address"
            value={formData.streetAddress}
            onChangeText={text => handleChange('streetAddress', text)}
          />

          {/* Video Profile URL */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              marginTop: responsiveScreenHeight(1),
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              Video Profile URL
            </Text>
            <Text
              style={{
                color: colors.red,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              *
            </Text>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              width: '100%',
              borderRadius: 6,
              borderColor: colors.mediumGray,
              color: colors.textPrimary,
              paddingHorizontal: responsiveScreenWidth(3),
              fontSize: responsiveScreenFontSize(1.8),
              paddingVertical: responsiveScreenHeight(1.3),
              marginTop: responsiveScreenHeight(1),
            }}
            placeholderTextColor={colors.gray}
            placeholder="Enter video profile URL"
            value={formData.videoProfileUrl}
            onChangeText={text => handleChange('videoProfileUrl', text)}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Divider */}
          <View
            style={{
              width: '100%',
              borderTopColor: colors.mediumGray,
              borderTopWidth: 0.5,
              marginVertical: responsiveScreenHeight(2),
              height: 0,
            }}
          />

          {/* Career Information */}
          <Text
            style={{
              width: '100%',
              fontSize: responsiveScreenFontSize(2),
              color: colors.textPrimary,
            }}
          >
            Career Information
          </Text>

          {/* Job Experience / Career Level */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Job Experience
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={experiences}
                placeholder="Select"
                selectedValue={formData.experience}
                onSelect={(val: number) => handleChange('experience', val)}
                labelKey="name"
                valueKey="id"
              />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Career Level
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={careerLevels}
                placeholder="Select"
                selectedValue={formData.careerLevel}
                onSelect={(val: number) => handleChange('careerLevel', val)}
                labelKey="name"
                valueKey="id"
              />
            </View>
          </View>

          {/* Industry / Functional Area */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Select Industry
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Functional Area
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={functionalAreas}
                placeholder="Select"
                selectedValue={formData.functionalArea}
                onSelect={(val: number) => handleChange('functionalArea', val)}
                labelKey="name"
                valueKey="id"
              />
            </View>
          </View>

          {/* Salary Currency / Current Salary */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Salary Currency
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <CustomDropdown
                data={currencies}
                placeholder="Select"
                selectedValue={formData.salaryCurrency}
                onSelect={(val: number) => handleChange('salaryCurrency', val)}
                labelKey="name"
                valueKey="id"
              />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Current Salary
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter Current Salary"
                keyboardType="numeric"
                value={formData.currentSalary}
                onChangeText={text => handleChange('currentSalary', text)}
              />
            </View>
          </View>

          {/* Expected Salary */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: responsiveScreenWidth(3),
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginTop: responsiveScreenHeight(1),
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  Expected Salary
                </Text>
                <Text
                  style={{
                    color: colors.red,
                    fontSize: responsiveScreenFontSize(1.8),
                  }}
                >
                  *
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: '100%',
                  borderRadius: 6,
                  borderColor: colors.mediumGray,
                  color: colors.textPrimary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  fontSize: responsiveScreenFontSize(1.8),
                  paddingVertical: responsiveScreenHeight(1.3),
                  marginTop: responsiveScreenHeight(1),
                }}
                placeholderTextColor={colors.gray}
                placeholder="Enter Expected Salary"
                keyboardType="numeric"
                value={formData.expectedSalary}
                onChangeText={text => handleChange('expectedSalary', text)}
              />
            </View>
            <View style={{ flex: 1 }} />
          </View>

          <Pressable
            onPress={() => dispatch(Update({ first_name: formData.firstName, last_name: formData.lastName, "date_of_birth": formData.dateOfBirth.toISOString().slice(0, 19).replace('T', ' '), gender_id: formData.gender, nationality_id: formData.nationality, country_id: formData.country, state_id: formData.state, city_id: formData.city, phone: formData.phoneNumber, mobile_num: formData.mobileNumber, job_experience_id: formData.experience, career_level_id: formData.careerLevel, industry_id: formData.industry, functional_area_id: formData.functionalArea, current_salary: formData.currentSalary, expected_salary: formData.expectedSalary, salary_currency: formData.salaryCurrency, video_link: formData.videoProfileUrl, street_address: formData.streetAddress })).unwrap().then(res => {
              if (res.success) {
                dispatch(ProfileData())
                navigation.goBack()
              }
              else {
                Alert.alert(res.message)
              }
            })}
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
            <Text
              style={{
                color: colors.white,
                fontSize: responsiveScreenFontSize(1.8),
              }}
            >
              Update Profile and Save
            </Text>
          </Pressable>
          <DatePicker modal
            mode={"date"}
            open={dobModalOpen}
            date={formData.dateOfBirth || new Date()}
            onConfirm={(date) => {
              setDobModalOpen(false)
              setFormData({ ...formData, dateOfBirth: date })
            }}
            onCancel={() => {
              setDobModalOpen(false)
            }}

          />
        </ScrollView>
      </NavigationBar>
    </>

  );
};

export default PersonalInfo;

export const CustomDropdown = ({
  data = [],
  placeholder = 'Select',
  selectedValue = 0,
  onSelect = (e: number) => { },
  labelKey = 'name',
  valueKey = 'id',
}) => {
  const [visible, setVisible] = useState(false);
  const { colors } = useContext(ThemeContext);

  const selectedLabel = useMemo(() => {
    const found = data?.find(item => item[valueKey] === selectedValue);
    return found ? found[labelKey] : '';
  }, [data, selectedValue, labelKey, valueKey]);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          borderWidth: 1,
          width: '100%',
          borderRadius: 6,
          borderColor: colors.mediumGray,
          paddingHorizontal: responsiveScreenWidth(3),
          paddingVertical: responsiveScreenHeight(1.3),
          marginTop: responsiveScreenHeight(1),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: responsiveScreenFontSize(1.8),
            color: selectedLabel ? colors.textPrimary : colors.gray,
          }}
        >
          {selectedLabel || placeholder}
        </Text>
        <Image source={imagePath.angle}/>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 10,
              maxHeight: '50%',
            }}
          >
            <FlatList
              data={data}
              keyExtractor={item => String(item[valueKey])}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item[valueKey]);
                    setVisible(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: responsiveScreenFontSize(1.8) }}>
                    {item[labelKey]}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({});

export const formatDate = (date?: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};