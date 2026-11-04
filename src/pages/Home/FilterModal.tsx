import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveScreenFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { useAppDispatch } from '../../store';
import { GetFilter } from '../../reducer/jobsReducer';
import Text from '../../components/Text';

type FilterOption = { id: number; name: string };
type FilterSection = { filter: string; title: string; option: (string | FilterOption)[] };



interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: Record<string, any>) => void;
}

export default function FilterModal({ visible, onClose, onApply }: FilterModalProps) {
    const { colors } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [filters, setFilters] = useState<FilterSection[]>([]);
    const [loading, setLoading] = useState(true);
    // selected[filterName] = Set of selected option ids / values
    const [selected, setSelected] = useState<Record<string, (number | string)[]>>({});

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        dispatch(GetFilter())
            .unwrap()
            .then((res) => {
                if (res?.success && 'data' in res) {
                    setFilters(res.data?.filter || []);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [visible]);

    const toggle = (filterName: string, value: string | number) => {
        const existing = selected[filterName] || [];
        if (existing.includes(value)) {
            setSelected({ ...selected, [filterName]: [...existing.filter((e) => e !== value)] })
        }
        else {
            setSelected({ ...selected, [filterName]: [...existing, value] })
        }
    };

    const clearAll = () => setSelected({});

    const applyFilters = () => {
        onApply(selected);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.white || '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Filters</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loaderWrap}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: responsiveScreenHeight(2) }}
                            showsVerticalScrollIndicator={false}
                        >
                            {filters.map((section, sIdx) => {
                                const options = section.option || [];
                                if (options.length === 0) return null;
                                return (
                                    <View key={sIdx} style={styles.section}>
                                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                                            {section.title}
                                        </Text>
                                        <View style={styles.chipsWrap}>
                                            {options.map((opt, oIdx) => {
                                                const isObj = typeof opt === 'object' && opt !== null;
                                                const value = isObj ? (opt as FilterOption).id : (opt as string);
                                                const label = isObj ? (opt as FilterOption).name : (opt as string);
                                                const isSelected = selected[section.filter]?.includes(value);

                                                return (
                                                    <TouchableOpacity
                                                        key={oIdx}
                                                        activeOpacity={0.7}
                                                        onPress={() => toggle(section.filter, value)}
                                                        style={[
                                                            styles.chip,
                                                            isSelected
                                                                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                                                : { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.chipLabel,
                                                                { color: isSelected ? '#FFFFFF' : '#374151' },
                                                            ]}
                                                        >
                                                            {label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Bottom buttons */}
                    {!loading && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={clearAll}
                                style={[styles.footerBtn, styles.clearBtn, { borderColor: colors.primary }]}
                            >
                                <Text style={[styles.footerBtnText, { color: colors.primary }]}>Clear Filters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={applyFilters}
                                style={[styles.footerBtn, { backgroundColor: colors.primary }]}
                            >
                                <Text style={[styles.footerBtnText, { color: '#FFFFFF' }]}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: responsiveScreenHeight(2),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: responsiveScreenWidth(5),
        marginBottom: responsiveScreenHeight(1.5),
    },
    headerTitle: {
        fontSize: responsiveScreenFontSize(2.5),
        fontWeight: '700',
    },
    closeBtn: {
        fontSize: responsiveScreenFontSize(2.5),
        fontWeight: '600',
    },
    loaderWrap: {
        paddingVertical: responsiveScreenHeight(10),
        alignItems: 'center',
    },
    section: {
        paddingHorizontal: responsiveScreenWidth(5),
        marginBottom: responsiveScreenHeight(2),
    },
    sectionTitle: {
        fontSize: responsiveFontSize(1.9),
        fontWeight: '700',
        marginBottom: responsiveScreenHeight(1),
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: responsiveScreenWidth(2),
    },
    chip: {
        paddingHorizontal: responsiveScreenWidth(3.5),
        paddingVertical: responsiveScreenHeight(0.8),
        borderRadius: 20,
        borderWidth: 1,
    },
    chipLabel: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: responsiveScreenWidth(5),
        paddingVertical: responsiveScreenHeight(1.5),
        gap: responsiveScreenWidth(3),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerBtn: {
        flex: 1,
        paddingVertical: responsiveScreenHeight(1.5),
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearBtn: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    footerBtnText: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '700',
    },
});

