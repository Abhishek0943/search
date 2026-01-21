import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const CustomStatusbar = ({}) => {
  return (
   <StatusBar backgroundColor="transparent" translucent={true} barStyle={"dark-content"}/>
  )
}

export default CustomStatusbar

const styles = StyleSheet.create({})