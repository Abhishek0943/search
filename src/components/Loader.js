import React from 'react';
import { View, Modal } from 'react-native';
import { SkypeIndicator } from "react-native-indicators"
import { lightColors } from '../constants/values';
const colors = lightColors;
const Loader = ({ isLoading = false }) => {
    if (isLoading) {
        return (
            <Modal transparent visible={isLoading} >
                <View style={{ flex:1, backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <SkypeIndicator size={50} color={colors.redTheam} />
                </View>
            </Modal>
        );
    }
    return null;
};

export default Loader;
