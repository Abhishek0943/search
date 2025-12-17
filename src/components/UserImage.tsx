import { View, Text, Image } from 'react-native'
import React, { useContext } from 'react'
import { responsiveScreenHeight } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'

export default function UserImage({ size }: { size: number }) {
  const { colors } = useContext(ThemeContext)

  return (
    <View style={{ height: responsiveScreenHeight(size), borderWidth: .5, borderColor: colors.surfaces, aspectRatio: 1, borderRadius: "50%", overflow: "hidden" }}>
      <Image source={{ uri: "https://randomuser.me/api/portraits/men/15.jpg" }} style={{ height: "100%", width: "100%", resizeMode: "cover" }} />
    </View>
  )
}