import React, { useContext, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
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
import { getApiCall, postApiCall } from '../../api';
import imagePath from '../../assets/imagePath';
import { useNavigation } from '@react-navigation/native';

const WhereICanWork = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [homeSuburb, setHomeSuburb] = useState('Brunswick, VIC 3056');
    const [showSuburbDropdown, setShowSuburbDropdown] = useState(false);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [availableAreas, setAvailableAreas] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const res: any = await getApiCall('/get-location-data');
                if (res?.success && res?.data) {
                    const locations = res.data.available_areas ?? res.data.locations ?? res.data ?? [];
                    const areas = Array.isArray(locations)
                        ? locations
                            .map((loc: any) => (typeof loc === 'string' ? loc : loc?.name ?? loc?.suburb ?? ''))
                            .filter(Boolean)
                        : [];
                    setAvailableAreas(areas);
                    const selected = res.data.selected_areas ?? res.data.selected ?? [];
                    if (Array.isArray(selected) && selected.length > 0) {
                        setSelectedAreas(
                            selected.map((loc: any) => (typeof loc === 'string' ? loc : loc?.name ?? loc?.suburb ?? ''))
                                .filter(Boolean)
                        );
                    }
                }
            } catch {
                Alert.alert('Error', 'Failed to load location data.');
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);
    const selectedSet = useMemo(() => new Set(selectedAreas), [selectedAreas]);
    const unselectedAreas = useMemo(() => availableAreas.filter(a => !selectedSet.has(a)), [availableAreas, selectedSet]);
    const isSearching = search.trim().length > 0;
    const unselectedLower = useMemo(
        () => unselectedAreas.map(a => ({ name: a, lower: a.toLowerCase() })),
        [unselectedAreas]
    );
    const deferredSearch = useDeferredValue(search);
    const filteredUnselected = useMemo(() => {
        if (!isSearching) return unselectedAreas.slice(0, 10);
        const q = deferredSearch.toLowerCase();
        return unselectedLower.filter(a => a.lower.includes(q)).map(a => a.name);
    }, [unselectedLower, deferredSearch]);
    const toggleArea = (area: string) => {
        setSelectedAreas(prev =>
            prev.includes(area)
                ? prev.filter(a => a !== area)
                : [...prev, area]
        );
    };

    const addArea = (area: string) => {
        if (!selectedAreas.includes(area)) {
            setSelectedAreas(prev => [...prev, area]);
        }
        setSearch('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res: any = await postApiCall('/jobseeker/update-location', {
                home_suburb: homeSuburb,
                areas: selectedAreas,
            });
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
        <NavigationBar navigationBar={false}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    alignSelf: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                <Header title="Where I can work" subtitle="We show the closest jobs first." />
                <View style={{ marginHorizontal: responsiveWidth(5) }}>
                    <View style={{ marginTop: responsiveHeight(3) }}>
                        <Text style={{
                            fontSize: responsiveFontSize(1.6),
                            fontWeight: '700',
                            color: colors.textSecondary,
                            letterSpacing: 1,
                            marginBottom: responsiveHeight(1.5),
                        }}>AREAS YOU CAN GET TO</Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.gray,
                            borderRadius: 12,
                            paddingHorizontal: responsiveWidth(4),
                            height: responsiveHeight(7),
                            marginBottom: responsiveHeight(2),
                        }}>
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search or add a suburb"
                                placeholderTextColor={colors.textSecondary}
                                style={{
                                    flex: 1,
                                    fontSize: responsiveFontSize(1.8),
                                    color: colors.textPrimary,
                                    fontWeight: '500',
                                }}
                            />
                            <TouchableOpacity>
                                <Text style={{ fontSize: responsiveFontSize(2.5), color: colors.textPrimary, fontWeight: '300' }}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveWidth(2) }}>
                            {selectedAreas.map((area) => (
                                <TouchableOpacity
                                    key={area}
                                    onPress={() => toggleArea(area)}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.primary,
                                        borderRadius: 20,
                                        paddingHorizontal: responsiveWidth(4),
                                        paddingVertical: responsiveHeight(1),
                                        marginBottom: responsiveHeight(1),
                                        gap: responsiveWidth(1.5),
                                    }}
                                >
                                    <View style={{ width: responsiveWidth(3.5), aspectRatio: 1 }}>
                                        <Image
                                            source={imagePath.Check2}
                                            style={{ width: '100%', height: '100%', resizeMode: 'contain', tintColor: '#FFFFFF' }}
                                        />
                                    </View>
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.6),
                                        fontWeight: '700',
                                        color: '#FFFFFF',
                                    }}>{area}</Text>
                                </TouchableOpacity>
                            ))}
                            {loading && (
                                <View style={{ width: '100%', alignItems: 'center', paddingVertical: responsiveHeight(2) }}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            )}
                            {!loading && filteredUnselected.slice(0, 10).map((area) => (
                                <TouchableOpacity
                                    key={area}
                                    onPress={() => addArea(area)}
                                    activeOpacity={0.7}
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: colors.gray,
                                        borderRadius: 20,
                                        paddingHorizontal: responsiveWidth(4),
                                        paddingVertical: responsiveHeight(1),
                                        marginBottom: responsiveHeight(1),
                                    }}
                                >
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.6),
                                        fontWeight: '600',
                                        color: colors.textPrimary,
                                    }}>{area}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* No results message */}
                            {!loading && isSearching && filteredUnselected.length === 0 && (
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: colors.textSecondary,
                                    fontWeight: '500',
                                    paddingVertical: responsiveHeight(1),
                                }}>No suburbs found for "{search}"</Text>
                            )}
                        </View>
                    </View>

                    {/* Footer Note */}
                    <Text style={{
                        fontSize: responsiveFontSize(1.5),
                        color: colors.textSecondary,
                        marginTop: responsiveHeight(3),
                        fontWeight: '500',
                    }}>
                        Add anywhere you would actually travel to. Jobs outside these areas will not reach you.
                    </Text>
                </View>
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
        </NavigationBar>
    );
};

export default WhereICanWork;
