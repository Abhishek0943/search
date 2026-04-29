import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { responsiveScreenHeight, responsiveScreenWidth, responsiveScreenFontSize } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import imagePath from '../../assets/imagePath';
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';

const Browser = () => {
    const { colors } = useContext(ThemeContext);
    const route = useRoute<any>();
    const { url, title } = route.params || {};

    return (
        <NavigationBar statusbar={true} navigationBar={false}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title={title} />
                <WebView
                    source={{ uri: url }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                />
            </View>
        </NavigationBar>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: responsiveScreenWidth(4),
        paddingVertical: responsiveScreenHeight(1.5),
        borderBottomWidth: 0.5,
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    title: {
        fontSize: responsiveScreenFontSize(1.8),
        fontWeight: '700',
    },
    rightPlaceholder: {
        width: 30,
    },
});

export default Browser;
