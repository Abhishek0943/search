import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import React, { useContext, useState } from 'react';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store';
import { UploadCV } from '../../reducer/jobsReducer';
import { pick, types, } from '@react-native-documents/picker';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import ResumeCard from '../../components/ResumeCard';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
export const openBrowser = async (url: string, primaryColor: string, showControls: boolean = true) => {
    let viewerUrl = url;
    if (showControls) {
        viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }
    if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(viewerUrl, {
            dismissButtonStyle: 'cancel',
            preferredBarTintColor: primaryColor,
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',

            // Android Properties
            showTitle: true,
            toolbarColor: primaryColor,
            secondaryToolbarColor: 'black',
            navigationBarColor: 'black',
            navigationBarDividerColor: 'white',
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: false,
        });
    } else {
        // Fallback if InAppBrowser isn't available
        Linking.openURL(viewerUrl);
    }
};
const Resume = () => {
    const dispatch = useAppDispatch();
    const normalizeFileUri = (u?: string) => {
        if (!u) return '';
        if (u.startsWith('/')) return `file://${u}`;
        return u;
    };
    const { colors } = useContext(ThemeContext)
    const { user } = useAppSelector(state => state.userStore)
    const [loading, setLoading] = useState<boolean>(false)
    const pickResume = async () => {
        const [doc] = await pick({
            type: [types.pdf],
            allowMultiSelection: false,
            mode: 'import',
        });
        const uri = normalizeFileUri((doc as any).fileCopyUri || doc.uri);
        const file = { uri, name: doc.name ?? 'resume.pdf', type: doc.type || 'application/pdf' };
        const fd = new FormData();
        fd.append('title', '');
        fd.append('is_default', '1');
        fd.append('cv_file', {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);
        setLoading(true)
        dispatch(UploadCV(fd)).finally(() => {
            setLoading(false)
        })
    };

    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),
                }}
            >
                <Header subtitle="Optional. Your profile already does the work." title="Add New CV" />
                {
                    user?.cv?.cv_url ? (
                        <View style={{ width: "100%", marginTop: responsiveHeight(1) }}>
                            <ResumeCard
                                fileName={user.cv.cv_file}
                                subtitle={user.cv.uploaded_at}
                                onView={() => { user.cv?.cv_url && openBrowser(user.cv.cv_url, colors.primary) }}
                                onReplace={pickResume}
                            />
                        </View>

                    ) :
                        <Pressable
                            onPress={pickResume}
                            style={{ width: '100%', aspectRatio: 350 / 88, marginVertical: responsiveHeight(2), }}
                        >
                            {
                                loading ? (
                                    <View style={{ width: '100%', height: '100%', borderWidth: 2, borderRadius: 12, borderStyle: "dashed", borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                                    </View>
                                ) :
                                    <Image source={require("./ResumeUpload.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                            }
                        </Pressable>
                }

                <Pressable
                    style={{ width: '100%', aspectRatio: 350 / 288.5, marginTop: responsiveHeight(1) }}
                >
                    <Image source={require("./ResumeStatic.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                </Pressable>
            </ScrollView>
        </NavigationBar>
    );
};
export default Resume;