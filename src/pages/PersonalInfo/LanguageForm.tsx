import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
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
import { CustomDropdown } from './PersonalInfo';
import { useAppDispatch } from '../../store';
import { EditLanguage, EditSkill, GetLanguages, GetLanguagesLevel, PostUserLanguages } from '../../reducer/jobsReducer';


const SkillExperienceForm = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const route = useRoute()
  const data = route.params
  const [formData, setFormData] = useState({
    skillId: 0,
    experienceId: 0,
  });
  useEffect(() => {
    if (data?.id) {
      setFormData({ skillId: data.language_id, experienceId: data.language_level_id })
    }
  }, [data?.id])
  useEffect(() => {
    dispatch(GetLanguages())
      .unwrap()
      .then(res => {
        if (res?.success) setSkills(res.data || []);
      })
      .catch(() => { });

    dispatch(GetLanguagesLevel())
      .unwrap()
      .then(res => {
        if (res?.success) setExperiences(res.data || []);
      })
      .catch(() => { });
  }, [dispatch]);

  const handleChange = (key: 'skillId' | 'experienceId', value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const Label = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {text}
      </Text>
      <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
    </View>
  );

  const onSubmit = () => {
    if (!formData.skillId) return Alert.alert('Validation', 'Please select Skill');
    if (!formData.experienceId) return Alert.alert('Validation', 'Please select Experience');

    const payload = {
      language_id: formData.skillId,
      language_level_id: formData.experienceId,
    };
    if (data.id) {
      dispatch(EditLanguage({ ...payload, id: data.id }))
        .unwrap()
        .then(res => {
          console.log(res)
          if (res?.success) navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err?.message || 'Something went wrong');
        });
    } else {
      dispatch(PostUserLanguages(payload))
        .unwrap()
        .then(res => {
          console.log(res)
          if (res?.success) navigation.goBack();
        })
        .catch(err => {
          console.log('AddSkillExperience error:', err);
          Alert.alert('Error', err?.message || 'Something went wrong');
        });
    }

  };

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
            {data?.id ? "Edit Language" : "Add New Language"}
          </Text>

          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: 'contain' }} />
        </View>

        {/* Skill */}
        <Label text="Language" />
        <CustomDropdown
          data={skills}
          placeholder="Select Language"
          selectedValue={formData.skillId}
          onSelect={(v: number) => handleChange('skillId', v)}
          labelKey="name"
          valueKey="id"
        />

        {/* Experience */}
        <Label text="Experience" />
        <CustomDropdown
          data={experiences}
          placeholder="Select Experience"
          selectedValue={formData.experienceId}
          onSelect={(v: number) => handleChange('experienceId', v)}
          labelKey="name"
          valueKey="id"
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
            {data?.id ? "Update" : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </NavigationBar>
  );
};

export default SkillExperienceForm;

const styles = StyleSheet.create({});
