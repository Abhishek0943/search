import React, { useCallback, useContext, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import { useAppDispatch } from '../../store';
import { GetExperience, DeleteExperience, AddWorkExperience, EditWorkExperience } from '../../reducer/jobsReducer';
import Text from '../../components/Text';
import { useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import { formatDateToMonthYear } from '../ProfileCompelete/ProfileCompelete';
import Icon from '../../utils/Icon';
import MonthPicker from 'react-native-month-year-picker';
import Button from '../../components/Button';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface RoleForm {
    id: number;
    jobTitle: string;
    businessName: string;
    startDate: string;
    endDate: string;
    stillHere: boolean;
    description: string;
}

const EMPTY_ROLE: RoleForm = {
    id: 0,
    jobTitle: '',
    businessName: '',
    startDate: 'Jan 2023',
    endDate: 'Still here',
    stillHere: true,
    description: '',
};

const parseDateString = (dateStr: string) => {
    if (!dateStr || dateStr === 'Still here') return new Date();
    const [monthStr, yearStr] = dateStr.split(' ');
    const monthIndex = monthNames.indexOf(monthStr);
    if (monthIndex === -1 || !yearStr) return new Date();
    return new Date(parseInt(yearStr), monthIndex, 1);
};

const ExperienceCard = ({ item, onEdit, onRemove, colors }: {
    item: any; onEdit: () => void; onRemove: () => void; colors: any;
}) => (
    <View style={{
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 14,
        marginBottom: responsiveHeight(1.5),
    }}>
        <View style={{ paddingVertical: responsiveHeight(1), flexDirection: 'row', paddingHorizontal: responsiveWidth(4), justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: responsiveFontSize(2),
                    fontWeight: '800',
                    color: colors.textPrimary,
                }}>{item.title || item.position || 'Role'}</Text>
                <Text style={{
                    fontSize: responsiveFontSize(1.8),
                    color: colors.textSecondary,
                    marginTop: responsiveHeight(0.4),
                    fontWeight: '500',
                }}>
                    {item.company || item.location || ''} · {item.city || ''}
                </Text>
            </View>
            <Text style={{
                fontSize: responsiveFontSize(1.6),
                fontWeight: '600',
                color: colors.textSecondary,
            }}>
                {item.date_start ? formatDateToMonthYear(item.date_start) : (item.start_date || item.from || '')} – {item.is_currently_working ? 'Still here' : (item.date_end ? formatDateToMonthYear(item.date_end) : (item.end_date || item.to || 'now'))}
            </Text>
        </View>
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            paddingHorizontal: responsiveWidth(4),
            borderTopColor: colors.gray,
            paddingVertical: responsiveHeight(1),
        }}>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
                <Text style={{
                    fontSize: responsiveFontSize(1.6),
                    fontWeight: '700',
                    color: colors.primary,
                }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
                <Text style={{
                    fontSize: responsiveFontSize(1.6),
                    fontWeight: '700',
                    color: '#D32F2F',
                }}>Remove</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const Experience = () => {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { showConfirm } = useAlert();
    const [loading, setLoading] = useState(true);
    const [experiences, setExperiences] = useState<any[]>([]);

    // Modal state
    const [roleSheetVisible, setRoleSheetVisible] = useState(false);
    const [loadingRole, setLoadingRole] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleForm>(EMPTY_ROLE);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

    const openAddModal = () => {
        setEditingRoleId(null);
        setCurrentRole(EMPTY_ROLE);
        setRoleSheetVisible(true);
    };

    const openEditModal = (item: any) => {
        setEditingRoleId(item.id);
        setCurrentRole({
            id: item.id,
            jobTitle: item.title ?? '',
            businessName: item.company ?? '',
            startDate: item.date_start ? formatDateToMonthYear(item.date_start) : (item.start_date || 'Jan 2023'),
            endDate: item.is_currently_working ? 'Still here' : (item.date_end ? formatDateToMonthYear(item.date_end) : (item.end_date || '')),
            stillHere: !!item.is_currently_working,
            description: item.description ?? '',
        });
        setRoleSheetVisible(true);
    };

    const loadExperiences = async () => {
        try {
            const res: any = await dispatch(GetExperience()).unwrap();
            if (res?.data) setExperiences(res.data);
        } catch { }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadExperiences();
        }, [])
    );

    const handleRemove = async (id: number) => {
        const ok = await showConfirm({
            title: 'Remove Experience',
            message: 'Are you sure you want to remove this role?',
            okText: 'Remove',
            cancelText: 'Cancel',
        });
        if (ok) {
            try {
                const res: any = await dispatch(DeleteExperience({ id })).unwrap();
                if (res?.success) {
                    setExperiences(prev => prev.filter(e => e.id !== id));
                }
            } catch { }
        }
    };

    const handleSaveRole = async () => {
        if (loadingRole) return;
        if (!currentRole.jobTitle.trim() || !currentRole.businessName.trim() || !currentRole.description.trim()) {
            Alert.alert('Missing fields', 'Please fill in job title, business name, and description.');
            return;
        }
        setLoadingRole(true);
        const start = parseDateString(currentRole.startDate);
        const end = currentRole.stillHere ? new Date() : parseDateString(currentRole.endDate);
        try {
            if (editingRoleId) {
                const res: any = await dispatch(EditWorkExperience({
                    title: currentRole.jobTitle,
                    company: currentRole.businessName,
                    date_start: start.toISOString().slice(0, 19).replace('T', ' '),
                    date_end: currentRole.stillHere ? null : end.toISOString().slice(0, 19).replace('T', ' '),
                    is_currently_working: currentRole.stillHere ? 1 : 0,
                    description: currentRole.description,
                    id: editingRoleId,
                })).unwrap();
                if (res.success) {
                    setExperiences(prev => prev.map(e => e.id === editingRoleId ? { ...e, ...res.data } : e));
                    setRoleSheetVisible(false);
                } else {
                    Alert.alert('Error', res?.message || 'Failed to update role');
                }
            } else {
                const res: any = await dispatch(AddWorkExperience({
                    title: currentRole.jobTitle,
                    company: currentRole.businessName,
                    date_start: start.toISOString().slice(0, 19).replace('T', ' '),
                    date_end: currentRole.stillHere ? null : end.toISOString().slice(0, 19).replace('T', ' '),
                    is_currently_working: currentRole.stillHere ? 1 : 0,
                    description: currentRole.description,
                })).unwrap();
                if (res.success) {
                    setExperiences(prev => [...prev, res.data]);
                    setRoleSheetVisible(false);
                } else {
                    Alert.alert('Error', res?.message || 'Failed to add role');
                }
            }
        } catch {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoadingRole(false);
        }
    };

    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: responsiveScreenHeight(3),
                    alignSelf: 'center',
                }}
            >
                <Header title="Experience" subtitle="Two roles is plenty. Recent first." />
                <View style={{ width: responsiveScreenWidth(90), marginHorizontal: 'auto' }}>

                    {loading ? (
                        <View style={{ marginTop: responsiveScreenHeight(20), alignItems: 'center' }}>
                            <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                        </View>
                    ) : (
                        <>
                            <View style={{ marginTop: responsiveHeight(3) }}>
                                {experiences.map((item: any, i: number) => (
                                    <ExperienceCard
                                        key={item.id || i}
                                        item={item}
                                        onEdit={() => openEditModal(item)}
                                        onRemove={() => handleRemove(item.id)}
                                        colors={colors}
                                    />
                                ))}
                            </View>

                            {/* Add a Role Button */}
                            <TouchableOpacity
                                onPress={openAddModal}
                                activeOpacity={0.7}
                                style={{
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    borderStyle: 'dashed',
                                    borderRadius: 14,
                                    paddingVertical: responsiveHeight(2),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    gap: responsiveWidth(2),
                                    marginBottom: responsiveHeight(2),
                                }}
                            >
                                <Text style={{
                                    fontSize: responsiveFontSize(1.8),
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}>+ Add a role</Text>
                            </TouchableOpacity>
                            <View style={{
                                aspectRatio: 350 / 76,
                                width: '100%',
                            }}>
                                <Image source={require('./ExperienceNote.png')} style={{
                                    width: '100%',
                                    height: '100%',
                                    resizeMode: 'contain',
                                }} />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* ── Role bottom-sheet modal ── */}
            <Modal
                visible={roleSheetVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setRoleSheetVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    justifyContent: 'flex-end',
                }}>
                    <Pressable style={{ flex: 1 }} onPress={() => setRoleSheetVisible(false)} />
                    <View style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingHorizontal: responsiveWidth(5),
                        paddingTop: responsiveHeight(1.5),
                        paddingBottom: responsiveHeight(3),
                        maxHeight: '85%',
                    }}>
                        {/* drag handle */}
                        <View style={{ alignSelf: 'center', width: responsiveWidth(10), height: 4, borderRadius: 2, backgroundColor: colors.surfaces, marginBottom: responsiveHeight(2) }} />

                        {/* header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2.8), fontWeight: '800' }}>
                                {editingRoleId ? 'Edit role' : 'Add a role'}
                            </Text>
                            <Pressable onPress={() => setRoleSheetVisible(false)}>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>Cancel</Text>
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Job Title */}
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                JOB TITLE
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderColor: currentRole.jobTitle ? colors.primary : colors.surfaces,
                                borderRadius: 12,
                                paddingHorizontal: responsiveWidth(4),
                                height: responsiveHeight(6.5),
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(2),
                            }}>
                                <TextInput
                                    value={currentRole.jobTitle}
                                    onChangeText={(t) => setCurrentRole(prev => ({ ...prev, jobTitle: t }))}
                                    placeholder="e.g. Barista"
                                    placeholderTextColor={colors.placeholder}
                                    style={{ fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                />
                            </View>

                            {/* Business Name */}
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                BUSINESS NAME
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderColor: currentRole.businessName ? colors.primary : colors.surfaces,
                                borderRadius: 12,
                                paddingHorizontal: responsiveWidth(4),
                                height: responsiveHeight(6.5),
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(2),
                            }}>
                                <TextInput
                                    value={currentRole.businessName}
                                    onChangeText={(t) => setCurrentRole(prev => ({ ...prev, businessName: t }))}
                                    placeholder="e.g. Small Batch Coffee"
                                    placeholderTextColor={colors.placeholder}
                                    style={{ fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                />
                            </View>

                            {/* Dates */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(0.8) }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5 }}>
                                    DATES
                                </Text>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>
                                    Month and year
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: responsiveWidth(3), marginBottom: responsiveHeight(2) }}>
                                {/* Start date */}
                                <Pressable
                                    onPress={() => setStartDatePickerVisible(true)}
                                    style={{
                                        flex: 1,
                                        borderWidth: 1.5,
                                        borderColor: colors.surfaces,
                                        borderRadius: 12,
                                        paddingHorizontal: responsiveWidth(4),
                                        height: responsiveHeight(6.5),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8) }}>{currentRole.startDate}</Text>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={22} style={{ color: colors.textSecondary }} />
                                </Pressable>
                                {/* End date */}
                                <Pressable
                                    onPress={() => { if (!currentRole.stillHere) setEndDatePickerVisible(true); }}
                                    style={{
                                        flex: 1,
                                        borderWidth: 1.5,
                                        borderColor: colors.surfaces,
                                        borderRadius: 12,
                                        paddingHorizontal: responsiveWidth(4),
                                        height: responsiveHeight(6.5),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        opacity: currentRole.stillHere ? 0.5 : 1,
                                    }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8) }}>{currentRole.stillHere ? 'Still here' : currentRole.endDate}</Text>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={22} style={{ color: colors.textSecondary }} />
                                </Pressable>
                            </View>

                            {startDatePickerVisible && (
                                <MonthPicker
                                    onChange={(event, newDate) => {
                                        setStartDatePickerVisible(false);
                                        if (event === 'dateSetAction' && newDate) {
                                            setCurrentRole(prev => ({ ...prev, startDate: `${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}` }));
                                        }
                                    }}
                                    value={parseDateString(currentRole.startDate)}
                                    minimumDate={new Date(1950, 0)}
                                    maximumDate={new Date()}
                                    locale="en"
                                />
                            )}
                            {endDatePickerVisible && (
                                <MonthPicker
                                    onChange={(event, newDate) => {
                                        setEndDatePickerVisible(false);
                                        if (event === 'dateSetAction' && newDate) {
                                            setCurrentRole(prev => ({ ...prev, endDate: `${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}` }));
                                        }
                                    }}
                                    value={parseDateString(currentRole.endDate)}
                                    minimumDate={parseDateString(currentRole.startDate)}
                                    maximumDate={new Date()}
                                    locale="en"
                                />
                            )}

                            {/* Still work here checkbox */}
                            <Pressable
                                onPress={() => setCurrentRole(prev => ({ ...prev, stillHere: !prev.stillHere, endDate: !prev.stillHere ? 'Still here' : '' }))}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2.5), marginBottom: responsiveHeight(2.5) }}
                            >
                                <View style={{
                                    width: responsiveWidth(6),
                                    aspectRatio: 1,
                                    borderRadius: 6,
                                    backgroundColor: currentRole.stillHere ? colors.primary : 'transparent',
                                    borderWidth: currentRole.stillHere ? 0 : 1.5,
                                    borderColor: colors.surfaces,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {currentRole.stillHere && (
                                        <Icon icon={{ type: 'MaterialIcons', name: 'check' }} size={16} style={{ color: colors.white }} />
                                    )}
                                </View>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>I still work here</Text>
                            </Pressable>

                            {/* Description */}
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                DESCRIPTION
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderColor: colors.surfaces,
                                borderRadius: 12,
                                paddingHorizontal: responsiveWidth(4),
                                paddingVertical: responsiveHeight(1),
                                marginBottom: responsiveHeight(2),
                                minHeight: responsiveHeight(12),
                            }}>
                                <TextInput
                                    multiline
                                    value={currentRole.description}
                                    onChangeText={(t) => setCurrentRole(prev => ({ ...prev, description: t }))}
                                    placeholder="Describe your role, responsibilities, achievements..."
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                                />
                            </View>

                            {/* Info hint */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(2.5),
                                backgroundColor: colors.lightBlue,
                                borderRadius: 12,
                                padding: responsiveWidth(4),
                                marginBottom: responsiveHeight(3),
                            }}>
                                <Icon icon={{ type: 'MaterialIcons', name: 'info-outline' }} size={20} style={{ color: colors.primary }} />
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), flex: 1 }}>
                                    Employers only see the title, business and dates.
                                </Text>
                            </View>

                            <Button
                                label={loadingRole ? 'Saving...' : 'Save role'}
                                backgroundColor={colors.primary}
                                onPress={handleSaveRole}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </NavigationBar>
    );
};

export default Experience;
