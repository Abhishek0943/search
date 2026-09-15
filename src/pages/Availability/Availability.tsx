import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
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
import Text from '../../components/Text';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';
import { useAppDispatch } from '../../store';
import { GetAllAvailabilities, Update } from '../../reducer/jobsReducer';
const Availability = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [availabilityOptions, setAvailabilityOptions] = useState<{ id: string; name: string }[]>([]);
    const [selectedAvailabilityIds, setSelectedAvailabilityIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        dispatch(GetAllAvailabilities()).unwrap().then((res) => {
            if (res.success) setAvailabilityOptions(res.data);
        }).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res: any = await dispatch(Update({
                availability_ids: selectedAvailabilityIds,
            })).unwrap();
            if (res?.success) {
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
        <NavigationBar navigationBar={false} >
            <>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        width: responsiveScreenWidth(90),
                        alignSelf: 'center',
                        alignItems: 'center',
                        paddingBottom: responsiveScreenHeight(3),
                    }}
                >
                    <Header title="Availability" subtitle="Employers filter on this more than anything else." />
                    <View style={{ marginTop: responsiveHeight(1), width: '100%' }}>
                        <SearchSelectDropdown
                            label="Availability"
                            options={availabilityOptions}
                            placeholder="Search availability..."
                            multiSelect={true}
                            selectedIds={selectedAvailabilityIds}
                            onToggle={(id) => {
                                setSelectedAvailabilityIds(prev => {
                                    const already = prev.includes(id);
                                    return already ? prev.filter(i => i !== id) : [...prev, id];
                                });
                            }}
                        />
                    </View>
                    <Text style={{
                        fontSize: responsiveFontSize(1.6),
                        color: colors.textSecondary,
                        marginTop: responsiveHeight(1),
                        fontWeight: '500',
                    }}>
                        Some shifts come up at short notice. This tells employers whether to call you for them.
                    </Text>
                </ScrollView>

                {/* Save Button */}
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

export default Availability;
