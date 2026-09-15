import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import { NavigationBar } from '../../components';
import ImagePicker from 'react-native-image-crop-picker';
import { Header } from '../Company/Company';
import { ThemeContext } from '../../context/ThemeProvider';
import { Alert } from 'react-native';
import { postApiCall, deleteApiCall } from '../../api';
import Text from '../../components/Text';
import { createThumbnail } from 'react-native-create-thumbnail';
import { openBrowser } from '../Resume/Resume';
import { useAppSelector, useAppDispatch } from '../../store';
import { setUser } from '../../reducer/userReducer';
const uploadMediaToApi = async (
    key: string,
    file: { uri: string; name: string; type: string },
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    onSuccess?: (videoData: { link: string; uploaded_at: string; file: string }) => void
) => {
    try {
        const fd = new FormData();
        fd.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);
        setLoading(true)
        const res: any = await postApiCall('/jobseeker/update-user-media', fd, { as: 'form' });
        console.log(res, "ressss")
        if (!res.success) {
            Alert.alert('Upload Failed', res?.message || 'Something went wrong');
            setLoading(false)
        } else {
            setLoading(false)
            if (res?.data?.video && onSuccess) {
                onSuccess({
                    link: res.data.video.video_url,
                    uploaded_at: res.data.video.uploaded_at,
                    file: res.data.video.video_name,
                });
            }
        }

    } catch (e) {
        Alert.alert('Upload Failed', 'Network error. Please try again.');
    }
};
const Video = () => {
    const { colors } = useContext(ThemeContext)
    const [loading, setLoading] = useState<boolean>(false)
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const [thumbnail, setThumbnail] = useState<string>("")
    const { user } = useAppSelector(state => state.userStore)
    const dispatch = useAppDispatch()
    useEffect(() => {
        if (user?.video?.video_url) {
            createThumbnail({ url: user.video.video_url, timeStamp: 1000 })
                .then(res => setThumbnail(res.path))
                .catch(() => setThumbnail(""));
        }
    }, [user?.video?.video_url]);
    const pickVideo = async () => {
        const video = await ImagePicker.openPicker({
            mediaType: 'video',
        });
        const durationInSeconds = (video.duration || 0) / 1000;
        if (durationInSeconds > 30) {
            Alert.alert('Video Too Long', 'Please select a video that is 30 seconds or less.');
            return;
        }
        const fileName = video.filename || `video_${Date.now()}.mp4`;
        const file = { uri: video.path, name: fileName, type: video.mime || 'video/mp4' };
        uploadMediaToApi('video', file, setLoading, (videoData) => {
            if (user) {
                dispatch(setUser({ user: { ...user, video: { video_url: videoData.link, uploaded_at: videoData.uploaded_at, video_name: videoData.file } } }));
            }
        });
    };
    const deleteVideo = async () => {
        setDeleteLoading(true);
        try {
            const res: any = await deleteApiCall('/jobseeker/user/video');
            if (res.success) {
                if (user) {
                    dispatch(setUser({ user: { ...user, video: null } }));
                }
                setThumbnail("");
            } else {
                Alert.alert('Delete Failed', res?.message || 'Something went wrong');
            }
        } catch (e) {
            Alert.alert('Delete Failed', 'Network error. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };
    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                keyboardShouldPersistTaps={'handled'}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    width: responsiveScreenWidth(90),
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(3),

                }}
            >
                <Header title="Video intro" subtitle="30 seconds. Employers watch these first." />
                {
                    user?.video?.video_url ? (
                        <View style={{ marginVertical: responsiveHeight(2), }}>
                            <Pressable
                                onPress={() => openBrowser(user.video?.video_url as string, colors.primary, false)}
                                style={{ position: "relative", width: '100%', aspectRatio: 16 / 9, borderRadius: 20, overflow: 'hidden' }}
                            >
                                <Image source={{ uri: thumbnail }} style={{ backgroundColor: colors.textPrimary, width: '100%', height: '100%', resizeMode: 'cover' }} />

                                <Pressable
                                    style={{ position: "absolute", zIndex: 1, width: responsiveWidth(20), aspectRatio: 1, top: "50%", left: "50%", transform: [{ translateX: -responsiveWidth(10) }, { translateY: -responsiveWidth(10) }] }}
                                >
                                    <Image source={require("./VideoPlayButton.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                                </Pressable>
                            </Pressable>
                            <Text style={{
                                fontSize: responsiveFontSize(1.6),
                                color: colors.textSecondary,
                                marginTop: responsiveHeight(1),
                                fontWeight: "600"
                            }}>
                                Added {user?.video?.uploaded_at} · 30 seconds
                            </Text>
                            <View style={{ width: "100%", flexDirection: "row", gap: responsiveWidth(3), marginTop: responsiveHeight(.6) }}>
                                <TouchableOpacity onPress={pickVideo} activeOpacity={0.7}>
                                    <Text
                                        style={{
                                            fontSize: responsiveFontSize(1.5),
                                            fontWeight: '700',
                                            color: colors.primary,
                                        }}
                                    >
                                        Upload Video
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={deleteVideo} disabled={deleteLoading}>
                                    {deleteLoading ? (
                                        <ActivityIndicator size={responsiveFontSize(2)} color={colors.primary} />
                                    ) : (
                                        <Text
                                            style={{
                                                fontSize: responsiveFontSize(1.5),
                                                fontWeight: '700',
                                                color: colors.primary,
                                            }}
                                        >
                                            Remove
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : <Pressable
                        onPress={pickVideo}
                        style={{ width: '100%', aspectRatio: 350 / 88, marginVertical: responsiveHeight(2), }}
                    >
                        {
                            loading ? (
                                <View style={{ width: '100%', height: '100%', borderWidth: 2, borderRadius: 12, borderStyle: "dashed", borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                                </View>
                            ) :
                                <Image source={require("./VideoUpload.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                        }
                    </Pressable>
                }


                <Pressable
                    style={{ width: '100%', aspectRatio: 350 / 408.5 }}
                >
                    <Image source={require("./VideoInfo.png")} style={{ width: '100%', height: "100%", resizeMode: "contain", }} />
                </Pressable>
            </ScrollView>
        </NavigationBar >
    );
};
export default Video;