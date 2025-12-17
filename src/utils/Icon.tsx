import React, { useContext } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { ThemeContext } from '../context/ThemeProvider';
import { FontAwesome, FontAwesomeIconName } from "@react-native-vector-icons/fontawesome"
import { MaterialIcons, MaterialIconsIconName } from "@react-native-vector-icons/material-icons"
import { Ionicons, IoniconsIconName } from "@react-native-vector-icons/ionicons"
import { AntDesign, AntDesignIconName } from "@react-native-vector-icons/ant-design"
import { Lucide, LucideIconName } from "@react-native-vector-icons/lucide"
import { Feather, FeatherIconName } from "@react-native-vector-icons/feather"
import { Octicons, OcticonsIconName } from "@react-native-vector-icons/octicons"
import { MaterialDesignIcons, MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons"
import { FontAwesome5, FontAwesome5IconName, FontAwesome5RegularIconName } from "@react-native-vector-icons/fontawesome5"
import { Entypo, EntypoIconName} from "@react-native-vector-icons/entypo"
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
export type IconLibrary =
    | { type: 'Feather'; name: FeatherIconName }
    | { type: 'Ionicons'; name: IoniconsIconName }
    | { type: 'MaterialIcons'; name: MaterialIconsIconName }
    | { type: 'FontAwesome'; name: FontAwesomeIconName }
    | { type: 'AntDesign'; name: AntDesignIconName }
    | { type: 'Lucide'; name: LucideIconName }
    | { type: 'MaterialDesignIcons'; name: MaterialDesignIconsIconName }
    | { type: 'Octicons'; name: OcticonsIconName }
    | { type: 'FontAwesome5'; name: FontAwesome5RegularIconName }
    | { type: 'Entypo'; name: EntypoIconName }

export interface IconProps {
    icon: IconLibrary;
    size?: number;
    onPress?: () => void;
    style?: StyleProp<TextStyle>;
    isGradient?: boolean
}

const Icon: React.FC<IconProps> = ({
    icon,
    size = 24,
    onPress,
    style,
    isGradient
}) => {
    const { colors } = useContext(ThemeContext)
    if (isGradient && icon.type === "AntDesign") {
        return <MaskedView
            maskElement={<AntDesign name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />}
        >
            <LinearGradient
                colors={["#ff0000", "#ff5a00", "#ff9a00", "#ffce00", "#ffe808"]}
                style={{ width: size, height: size }}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
            />
        </MaskedView>;
    }
    switch (icon.type) {
        case 'Feather':
            return <Feather name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'Ionicons':
            return <Ionicons name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'MaterialIcons':
            return <MaterialIcons name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'FontAwesome':
            return <FontAwesome name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'AntDesign':
            return <AntDesign name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'Lucide':
            return <Lucide name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'Octicons':
            return <Octicons name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'MaterialDesignIcons':
            return <MaterialDesignIcons name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'FontAwesome5':
            return <FontAwesome5 name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        case 'Entypo':
            return <Entypo name={icon.name} size={size} onPress={onPress} style={[{ color: colors.textPrimary }, style]} />;
        
        default:
            return null;
    }
};

export default Icon;
