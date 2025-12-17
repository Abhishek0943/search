import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { NavigationBar } from '../../components'
import { routes } from '../../constants/values'
import { responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'

const ApplyJob = () => {
    return (
        <NavigationBar name={routes.APPLYJOB}>

            <ScrollView style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(2) }}>
                <View style={{ flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "center" }}>

                    <Text>Your Applications</Text>
                    <View style={{ height: responsiveScreenHeight(3) }}>
                        <Image source={imagePath.notification} style={{ height: "100%", width: "37%", resizeMode: "contain", }} />
                    </View>
                </View>
            </ScrollView>
        </NavigationBar>
    )
}

export default ApplyJob