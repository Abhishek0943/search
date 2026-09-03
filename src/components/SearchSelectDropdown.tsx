import React, { useContext, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Text from './Text';
import Icon from '../utils/Icon';
import imagePath from '../assets/imagePath';

export type DropdownOption = {
    id: string;
    name: string;
};

type SingleProps = { 
    multiSelect: false;
    selectedId: string;
    onSelect: (id: string) => void;
};

type MultiProps = {
    multiSelect: true;
    selectedIds: string[];
    onToggle: (id: string) => void;
};

type CommonProps = {
    label: string;
    options: DropdownOption[];
    placeholder?: string;
    maxDropdownHeight?: number;
};

type Props = CommonProps & (SingleProps | MultiProps);

const SearchSelectDropdown: React.FC<Props> = (props) => {
    const { colors } = useContext(ThemeContext);
    const { label, options, placeholder = 'Search...', maxDropdownHeight = 22 } = props;
    console.log(props, "hii")
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [singleSelectedName, setSingleSelectedName] = useState(!props.multiSelect ? options.find(o => o.id === props.selectedId)?.name : '')
    const filtered = options.filter((i) => i.name.toLowerCase().includes(query.toLowerCase() || (singleSelectedName || "").toLowerCase()))
    const isSelected = (id: string) => {
        if (props.multiSelect) {
            return props.selectedIds.includes(id);
        }
        const a = filtered.find((i) => i.name === singleSelectedName)
        return a ? a.id === id : false
    };

    const handleSelect = (option: DropdownOption) => {
        if (props.multiSelect) {
            props.onToggle(option.id);
        } else {
            props.onSelect(option.id);
            setSingleSelectedName(option.name)
        }
    };

    // const singleSelectedName = !props.multiSelect
    //     ? options.find(o => o._id === props.selectedId)?.name
    //     : undefined;

    const selectedChips = props.multiSelect
        ? props.selectedIds
            .map(id => options.find(o => o.id === id))
            .filter(Boolean) as DropdownOption[]
        : [];
    return (
        <View style={{ marginBottom: responsiveHeight(1) }}>
            <Text style={{
                fontSize: responsiveFontSize(1.8),
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: responsiveHeight(.5),
                marginTop: responsiveHeight(1),
            }}>
                {label}
            </Text>
            {props.multiSelect ? (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderRadius: 15,
                    width: responsiveWidth(90),
                    aspectRatio: 350 / 52,
                    paddingHorizontal: responsiveWidth(4),
                    borderColor: open ? colors.primary : colors.surfaces,
                }}>
                    <TextInput
                        style={{

                            flex: 1, fontSize: responsiveFontSize(2), color: colors.textPrimary, padding: 0
                        }}
                        placeholder={placeholder}
                        placeholderTextColor={colors.placeholder}
                        value={query}
                        onFocus={() => setOpen(true)}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 ? (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Icon icon={{ type: 'MaterialIcons', name: 'clear' }} size={20} style={{ color: colors.textSecondary }} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setOpen(v => !v)}>
                            <Image source={imagePath.DownAngle} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1.5,
                        borderRadius: 15,
                        width: responsiveWidth(90),
                        aspectRatio: 350 / 52,
                        paddingHorizontal: responsiveWidth(4),
                        borderColor: open ? colors.primary : colors.surfaces,
                    }}
                >
                    <TextInput
                        value={singleSelectedName}
                        onChangeText={(text) => {
                            setSingleSelectedName(text);
                        }}
                        placeholder={placeholder}
                        placeholderTextColor={colors.placeholder}
                        style={{
                            flex: 1,
                            fontSize: responsiveFontSize(2),
                            color: singleSelectedName ? colors.textPrimary : colors.placeholder,
                        }} />
                    <Image source={imagePath.DownAngle} />
                </TouchableOpacity>
            )}

            {((props.multiSelect && query.length > 0 && filtered.length > 0) || (!props.multiSelect && singleSelectedName && filtered.length > 0)) && (
                <View style={{
                    borderWidth: 1.5,
                    borderRadius: 12,
                    borderColor: colors.surfaces,
                    backgroundColor: colors.background,
                    marginTop: responsiveHeight(.5),
                    overflow: 'hidden',
                }}>
                    <View style={{
                        paddingVertical: responsiveHeight(0.8),
                        paddingHorizontal: responsiveWidth(4),
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaces,
                    }}>
                        <Text style={{
                            fontSize: responsiveFontSize(1.5),
                            fontWeight: '700',
                            color: colors.textSecondary,
                            letterSpacing: 0.5,
                        }}>
                            {filtered.length} MATCH{filtered.length !== 1 ? 'ES' : ''}
                        </Text>
                    </View>
                    <ScrollView
                        style={{ maxHeight: responsiveHeight(maxDropdownHeight) }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                    >
                        {filtered.map(option => {
                            const sel = isSelected(option.id);
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleSelect(option)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: responsiveHeight(1.5),
                                        paddingHorizontal: responsiveWidth(4),
                                        gap: responsiveWidth(3),
                                    }}
                                >
                                    {props.multiSelect && (
                                        <View style={{
                                            width: responsiveWidth(5),
                                            aspectRatio: 1,
                                            borderRadius: 4,
                                            borderWidth: 1.5,
                                            borderColor: sel ? colors.primary : colors.surfaces,
                                            backgroundColor: sel ? colors.primary : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {sel && <Icon icon={{ type: 'MaterialIcons', name: 'check' }} size={12} style={{ color: '#fff' }} />}
                                        </View>
                                    )}
                                    <Text style={{
                                        flex: 1,
                                        fontSize: responsiveFontSize(1.9),
                                        color: sel ? colors.primary : colors.textPrimary,
                                        fontWeight: sel ? '700' : '400',
                                    }}>
                                        {option.name}
                                    </Text>
                                    {!props.multiSelect && sel && (
                                        <Icon icon={{ type: 'MaterialIcons', name: 'check' }} style={{ color: colors.primary }} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {props.multiSelect && selectedChips.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveWidth(2), marginTop: responsiveHeight(1) }}>
                    <Text style={{
                        width: '100%',
                        fontSize: responsiveFontSize(1.5),
                        fontWeight: '700',
                        color: colors.textSecondary,
                        letterSpacing: 0.5,
                    }}>
                        Selected chips
                    </Text>
                    {selectedChips.map(opt => (
                        <View
                            key={opt.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                                borderRadius: 20,
                                paddingVertical: responsiveHeight(.7),
                                paddingHorizontal: responsiveWidth(3.5),
                                gap: responsiveWidth(1.5),
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>
                                {opt.name}
                            </Text>
                            <TouchableOpacity onPress={() => props.onToggle(opt.id)}>
                                <Icon icon={{ type: 'MaterialIcons', name: 'close' }} size={14} style={{ color: '#fff' }} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default SearchSelectDropdown;
