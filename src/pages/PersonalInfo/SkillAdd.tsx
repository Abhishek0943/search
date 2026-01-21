import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
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
import { AddSkill, EditSkill, GetExperienceLevels, GetSkills } from '../../reducer/jobsReducer';
import { Header } from '../Company/Company';
import { useAlert } from '../../context/AlertContext';


const SkillExperienceForm = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false)

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
      setFormData({ skillId: data.job_skill_id, experienceId: data.job_experience_id })
    }
  }, [data?.id])
  useEffect(() => {
    dispatch(GetSkills())
      .unwrap()
      .then(res => {
        if (res?.success) setSkills(res.data || []);
      })
      .catch(() => { });

    dispatch(GetExperienceLevels())
      .unwrap()
      .then(res => {
        if (res?.success) setExperiences(res.data || []);
      })
      .catch(() => { });
  }, [dispatch]);

  const handleChange = (key: 'skillId' | 'experienceId', value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  const { showAlert } = useAlert();

  const Label = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {text}
      </Text>
      <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
    </View>
  );

  const onSubmit = () => {
    if (!formData.skillId) {
      showAlert({
        title: "Validation",
        message: "Please select Skill",
      });
      return;
    }

    if (!formData.experienceId) {
      showAlert({
        title: "Validation",
        message: "Please select Experience",
      });
      return;
    }

    const payload = {
      job_skill_id: formData.skillId,
      job_experience_id: formData.experienceId,
    };
    setLoading(true)
    if (data?.id) {
      dispatch(EditSkill({ ...payload, id: data.id }))
        .unwrap()
        .then(res => {
          setLoading(false);

          if (res?.success) {
            navigation.goBack();
          }
        })
        .catch(err => {
          showAlert({
            title: "Error",
            message: err?.message || "Something went wrong",
          });
        });
    } else {
      dispatch(AddSkill(payload))
        .unwrap()
        .then(res => {
          setLoading(false);

          if (res?.success) {
            navigation.goBack();
          }
        })
        .catch(err => {
          showAlert({
            title: "Error",
            message: err?.message || "Something went wrong",
          });
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
        <Header title={data?.id ? "Edit Skill" : "Add Skill"} />

        {/* Skill */}
        <Label text="Skill" />
        <CustomDropdown
          data={skills}
          placeholder="Select Skill"
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
          {
            loading ? <ActivityIndicator color={"white"} /> :
              <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                {data?.id ? "Update Skill" : "Add Skill"}

              </Text>
          }
        </Pressable>
      </ScrollView>
    </NavigationBar>
  );
};

export default SkillExperienceForm;

const styles = StyleSheet.create({});
