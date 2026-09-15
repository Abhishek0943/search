import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../store';
import { GetSkills, GetUserSkill, Update } from '../../reducer/jobsReducer';
import { setUser } from '../../reducer/userReducer';
import Text from '../../components/Text';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';

const Skills = () => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [skillOptions, setSkillOptions] = useState<any[]>([]);
    const { user } = useAppSelector(state => state.userStore)
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(user?.skills?.map((s: any) => s.job_skill_id
    ) || []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            dispatch(GetSkills()).unwrap()
                .then((allRes: any) => {
                    console.log(allRes)
                    if (allRes?.data || allRes?.jobs) {
                        setSkillOptions(allRes.data || allRes.jobs || []);
                    }
                    setLoading(false);
                }).catch(() => setLoading(false));
        }, [])
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const res: any = await dispatch(Update({
                skill_ids: selectedSkillIds,
            })).unwrap();
            if (res?.success) {
                dispatch(setUser({
                    user: {
                        ...user,
                        skills: res.data.skills,
                    }
                }));
                navigation.goBack();
            } else {
                Alert.alert('Error', res?.message || 'Something went wrong');
            }
        } catch {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <NavigationBar navigationBar={false}>
            <>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        width: responsiveScreenWidth(90),
                        alignSelf: 'center',
                        alignItems: 'center',
                        paddingBottom: responsiveScreenHeight(3),
                    }}
                >
                    <Header title="Skills" subtitle="Pick what you have done. Employers search on these." />

                    {loading ? (
                        <View style={{ marginTop: responsiveScreenHeight(20), alignItems: 'center' }}>
                            <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                        </View>
                    ) : (
                        <View style={{ marginTop: responsiveHeight(2), width: '100%' }}>
                            <SearchSelectDropdown
                                label="Skills"
                                options={skillOptions}
                                placeholder="Search skills..."
                                multiSelect={true}
                                selectedIds={selectedSkillIds}
                                onToggle={(id) => {
                                    setSelectedSkillIds(prev => {
                                        const already = prev.includes(id);
                                        return already ? prev.filter(i => i !== id) : [...prev, id];
                                    });
                                }}
                            />
                        </View>
                    )}
                </ScrollView>

                <View style={{
                    paddingHorizontal: responsiveScreenWidth(5),
                    paddingBottom: responsiveScreenHeight(4),
                    paddingTop: responsiveHeight(1.5),
                }}>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: colors.primary,
                            borderRadius: 14,
                            paddingVertical: responsiveHeight(2),
                            alignItems: 'center',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        <Text style={{
                            fontSize: responsiveFontSize(1.9),
                            fontWeight: '700',
                            color: '#FFFFFF',
                        }}>{saving ? 'Saving...' : 'Save changes'}</Text>
                    </TouchableOpacity>
                </View>
            </>

        </NavigationBar>
    );
};

export default Skills;
