import { View, Text, Modal, ActivityIndicator } from 'react-native'
import React from 'react'
import { lightColors } from '../constants/values'
import { SkypeIndicator } from "react-native-indicators"
import { responsiveScreenFontSize } from 'react-native-responsive-dimensions'
const colors = lightColors
const LoadingModal = ({isLoading=true}:{isLoading?:boolean}) => {
  return (
    <>
    <Modal transparent={true} visible={isLoading}>
        <View style={{flex:1,justifyContent:"center", alignItems:"center", backgroundColor:"rgba(0, 0, 0, .3)", }}>
            <SkypeIndicator size={responsiveScreenFontSize(4)} color={colors.red} />
        </View>
    </Modal>
    </>
  )
}

export default LoadingModal