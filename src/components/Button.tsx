import { View, Text, TextStyle, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'

const Button = ({ isLoading = false, style, isActive = false, label, onPress = () => { }, rightIcon, leftIcon }: { isLoading?: boolean; style: TextStyle, isActive?: boolean, label: string, onPress?: () => void, rightIcon?: React.JSX.Element, leftIcon?: React.JSX.Element }) => {
    const { colors } = useContext(ThemeContext)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View
                style={[
                    {
                        paddingVertical: responsiveScreenHeight(1.5),
                        paddingHorizontal: responsiveScreenWidth(5),
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isActive ? colors.primary : colors.gray,
                        borderRadius: 10,
                    },
                    style,
                ]}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <Text
                        style={{
                            color: isActive ? colors.white : colors.darkGray,
                            fontSize: responsiveScreenFontSize(1.8),
                            fontWeight: "500",
                        }}
                    >
                        {label}
                    </Text>
                )}
            </View>
        </TouchableOpacity>

        // <Text onPress={onPress} style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "500", borderColor: colors.primary, borderWidth: 2, borderRadius: 100, textTransform: "capitalize", backgroundColor: isActive ? colors.primary : "transparent", color: isActive ? colors.background : colors.textPrimary, ...style }}>{label} </Text>
    )
}

export default Button