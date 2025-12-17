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
    Alert,
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
import imagePath from '../../assets/imagePath';
import { CustomDropdown, formatDate } from './PersonalInfo';
import { useAppDispatch } from '../../store';
import { GetCountry, GetState, GetCity, DegreeLevel, DegreeType, Subject, ResultType, AddEducation, AddProject } from '../../reducer/jobsReducer';
import { launchImageLibrary } from 'react-native-image-picker';
// If you use react-native-date-picker
import DatePicker from 'react-native-date-picker';
import { CustomMultiDropdown } from '../Search/Search';
import AsyncStorage from '@react-native-async-storage/async-storage';

const addProjectWithFetch = async (fd: FormData, navigation: any) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const res = await fetch(
      'https://dev.searchtalents.co/api/v1/jobseeker/projects',
      {
        method: 'POST',
        headers: {
          // Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // ❌ DO NOT set Content-Type for FormData
        },
        body: fd,
      }
    );

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.log('Non-JSON response:', text);
      data = null;
    }

    console.log('Add Project response:', data);

    if (!res.ok) {
      console.log('API error:', res.status, data);
      return;
    }

    if (data?.success) {
      navigation.goBack();
    }
  } catch (err: any) {
    console.log('Network error:', err?.message, err);
  }
};

type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

const ProjectForm = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const route = useRoute<any>();
  const data = route?.params; // may contain edit data

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    projectUrl: '',
    startDate: new Date(),
    endDate: new Date(),
    currentlyOngoing: false,
    description: '',
    image: null as PickedImage | null,
  });

  // ✅ Edit Prefill (if you send data in params)
  useEffect(() => {
    if (!data?.id) return;

    setFormData(prev => ({
      ...prev,
      projectName: data.project_name ?? prev.projectName,
      projectUrl: data.project_url ?? prev.projectUrl,
      startDate: data.start_date ? new Date(data.start_date) : prev.startDate,
      endDate: data.end_date ? new Date(data.end_date) : prev.endDate,
      currentlyOngoing: !!data.is_currently_ongoing,
      description: data.description ?? prev.description,
    }));
  }, [data?.id]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const onSubmit = () => {
    if (!formData.projectName.trim()) {
      Alert.alert('Validation', 'Please enter Project name');
      return;
    }
    // if (!formData.projectUrl.trim()) {
    //   Alert.alert('Validation', 'Please enter Project URL');
    //   return;
    // }
    if (!formData.currentlyOngoing && formData.endDate < formData.startDate) {
      Alert.alert('Validation', 'End date cannot be before start date');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation', 'Please enter Project description');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.projectName);
    fd.append('url', formData.projectUrl);
    fd.append('date_start', formData.startDate.toISOString().slice(0, 19).replace('T', ' '));
    fd.append('date_end', formData.currentlyOngoing ? '' : formData.endDate.toISOString().slice(0, 19).replace('T', ' '));
    fd.append('is_on_going', formData.currentlyOngoing ? 1 : 0);
    fd.append('description', formData.description);

    if (formData.image?.uri) {
      fd.append('image', {
        uri: formData.image.uri,
        name: formData.image.name,
        type: formData.image.type,
      } as any);
    }

 addProjectWithFetch(fd, navigation)


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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomColor: colors.textDisabled,
            borderBottomWidth: 0.5,
            paddingBottom: responsiveScreenHeight(2),
            width: responsiveScreenWidth(100),
            paddingHorizontal: responsiveScreenWidth(5),
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
            {data?.id ? 'Edit Project' : 'Add New Project'}
          </Text>

          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>

        <Label text="Project name" />
        <TextInput
          value={formData.projectName}
          onChangeText={t => handleChange('projectName', t)}
          style={inputStyle}
          placeholderTextColor={colors.gray}
          placeholder="Enter Project name"
        />

        <Label text="Upload Image" />
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

        {/* Project URL */}
        <Label text="Project URL" />
        <TextInput
          value={formData.projectUrl}
          onChangeText={t => handleChange('projectUrl', t)}
          style={inputStyle}
          placeholderTextColor={colors.gray}
          placeholder="https://example.com"
          autoCapitalize="none"
        />

        {/* Project Start Date */}
        <Label text="Project Start Date" />
        <TouchableOpacity
          onPress={() => setStartDateOpen(true)}
          style={{ ...inputStyle, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary }}>
            {formatDate(formData.startDate)}
          </Text>
        </TouchableOpacity>

        {/* Project End Date */}
        <Label text="Project End Date" />
        <TouchableOpacity
          onPress={() => {
            if (!formData.currentlyOngoing) setEndDateOpen(true);
          }}
          style={{
            ...inputStyle,
            justifyContent: 'center',
            opacity: formData.currentlyOngoing ? 0.5 : 1,
          }}
          disabled={formData.currentlyOngoing}
        >
          <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: colors.textPrimary }}>
            {formData.currentlyOngoing ? 'Present' : formatDate(formData.endDate)}
          </Text>
        </TouchableOpacity>

        {/* Is Currently Ongoing (Radio) */}
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
            Is Currently Ongoing?
          </Text>

          <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
            {/* YES */}
            <Pressable
              onPress={() => handleChange('currentlyOngoing', true)}
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
                {formData.currentlyOngoing && (
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
              onPress={() => handleChange('currentlyOngoing', false)}
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
                {!formData.currentlyOngoing && (
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

        {/* Project Description (multiline) */}
        <Label text="Project Description" />
        <TextInput
          value={formData.description}
          onChangeText={t => handleChange('description', t)}
          multiline
          style={[
            inputStyle,
            {
              minHeight: responsiveScreenHeight(14),
              textAlignVertical: 'top',
            },
          ]}
          placeholderTextColor={colors.gray}
          placeholder="Write about your project..."
        />

        {/* Save */}
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
          <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
            Save Project
          </Text>
        </Pressable>

        {/* Date pickers */}
        <DatePicker
          modal
          open={startDateOpen}
          date={formData.startDate}
          mode="date"
          onConfirm={(date) => {
            setStartDateOpen(false);
            handleChange('startDate', date);

            // if startDate is after endDate, fix endDate
            if (!formData.currentlyOngoing && formData.endDate < date) {
              handleChange('endDate', date);
            }
          }}
          onCancel={() => setStartDateOpen(false)}
        />

        <DatePicker
          modal
          open={endDateOpen}
          date={formData.endDate}
          mode="date"
          minimumDate={formData.startDate}
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

export default ProjectForm;

const styles = StyleSheet.create({});

