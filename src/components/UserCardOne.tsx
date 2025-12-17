import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import UserImage from './UserImage'
import { ThemeContext } from '../context/ThemeProvider'
import Button from './Button'

const UserCardOne = () => {
      const { colors } = useContext(ThemeContext)
    
    return (
        <View style={{ flexDirection: "row", alignItems:"center", gap:responsiveScreenWidth(3) ,  flex:1}}>
            <UserImage size={6} />
            <View style={{flexDirection:"column",  flex:1}}>
                <Text style={{fontSize:responsiveScreenFontSize(2.2), fontWeight:"500",color:colors.textPrimary }}>Abhishek</Text>
                <Text style={{fontSize:responsiveScreenFontSize(1.8), fontWeight:"500",color:colors.textSecondary }}>@abhishekdfdf</Text>
            </View>
            <Button label='follow' style={{textAlign:"right"}} />
        </View>
    )
}

export default UserCardOne