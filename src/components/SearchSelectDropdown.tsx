import React from 'react';
import { CustomDropdown } from '../pages/PersonalInfo/PersonalInfo';
import { CustomMultiDropdown } from '../pages/Search/Search';

export { CustomDropdown, CustomMultiDropdown };

export type DropdownOption = {
    id: string | number;
    name: string;
};

type SingleProps = {
    multiSelect?: false;
    selectedId?: string | number;
    selectedValue?: string | number;
    onSelect?: (id: any) => void;
};

type MultiProps = {
    multiSelect: true;
    selectedIds?: (string | number)[];
    selectedValues?: (string | number)[];
    onToggle?: (id: any) => void;
    onSelect?: (ids: any[]) => void;
};

type CommonProps = {
    label?: string;
    options?: any[];
    data?: any[];
    placeholder?: string;
    maxDropdownHeight?: number;
    secondaryColor?: string;
    labelKey?: string;
    valueKey?: string;
    style?: any;
    fontSize?: number;
};

type Props = CommonProps & (SingleProps | MultiProps);

const SearchSelectDropdown: React.FC<Props> = (props: any) => {
    const data = props.data || props.options || [];
    const labelKey = props.labelKey || 'name';
    const valueKey = props.valueKey || 'id';

    if (props.multiSelect) {
        const selectedValues = props.selectedValues || props.selectedIds || [];
        const handleSelect = (arr: any[]) => {
            if (props.onSelect) {
                props.onSelect(arr);
            } else if (props.onToggle) {
                const oldSet = new Set((selectedValues || []).map(String));
                const newSet = new Set(arr.map(String));
                const toggled = arr.find((x: any) => !oldSet.has(String(x))) ?? (selectedValues || []).find((x: any) => !newSet.has(String(x)));
                if (toggled !== undefined) {
                    props.onToggle(toggled);
                }
            }
        };

        return (
            <CustomMultiDropdown
                data={data}
                placeholder={props.placeholder || 'Select'}
                selectedValues={selectedValues}
                onSelect={handleSelect}
                labelKey={labelKey}
                valueKey={valueKey}
                label={props.label}
            />
        );
    }

    const selectedValue = props.selectedValue !== undefined ? props.selectedValue : props.selectedId;

    return (
        <CustomDropdown
            data={data}
            placeholder={props.placeholder || 'Select'}
            selectedValue={selectedValue}
            onSelect={props.onSelect}
            labelKey={labelKey}
            valueKey={valueKey}
            style={props.style}
            fontSize={props.fontSize}
            label={props.label}
        />
    );
};

export default SearchSelectDropdown;
