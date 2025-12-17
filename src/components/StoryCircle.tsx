import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useContext } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../context/ThemeProvider'
import Icon from '../utils/Icon'
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { routes } from '../constants/values'

const StoryCircle = ({ setVisible, isSeen, item, isMine, border = 4 }: { border?: number, setVisible: React.Dispatch<React.SetStateAction<boolean>>, isSeen?: boolean, isMine: boolean, item: number }) => {
    // const { stories } = useAppSelector(state => state.store)
    const { user } = useAppSelector(state => state.userStore)
    const { colors } = useContext(ThemeContext)
    //   const handleImagePicker = () => {
    //     Alert.alert('Select Image', 'Choose image source', [
    //       { text: 'Camera', onPress: handleLaunchCamera },
    //       { text: 'Gallery', onPress: handleLaunchGallery },
    //       { text: 'Cancel', style: 'cancel' },
    //     ]);
    //   };
    const dispatch = useAppDispatch()
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    //   const { mutate: uploadStoryApi } = usePostData('/addStrory', 'post', {
    //     onSuccess: async res => {
    //       showSuccess('Story uploaded!')
    //       dispatch(GetStories()).unwrap().then((res)=>{
    //         console.log('Story uploaded!', res)
    //       })
    //     },
    //     onError: async error => {
    //       showError('Upload failed. Please try again later.')
    //     },
    //   });
    //   const handleLaunchCamera = async () => {
    //     const hasPermission = await requestCameraPermission();
    //     if (!hasPermission) {
    //       Alert.alert(
    //         'Permission Denied',
    //         'Camera permission is required to take photos.',
    //       );
    //       return;
    //     }
    //     try {
    //       const result = await ImageCropPicker.openCamera({
    //         cropping: true,
    //         includeBase64: false,
    //       });

    //       const formData = new FormData();
    //       formData.append('media', {
    //         uri: result.path,
    //         name: result.filename,
    //         type: result.mime,
    //       });
    //       uploadStoryApi(formData)
    //     } catch (error) { }
    //   };
    //   const handleLaunchGallery = async () => {
    //     try {
    //       const result = await ImageCropPicker.openPicker({
    //         width: 160 * 4,
    //         height: 160 * 4,
    //         cropping: true,
    //         includeBase64: false,
    //       });

    //       const formData = new FormData();
    //       formData.append('media', {
    //         uri: result.path,
    //         name: result.filename,
    //         type: result.mime,
    //       });
    //       uploadStoryApi(formData)
    //     } catch (error) { }
    //   };
    return (
        <View style={{ gap: responsiveScreenHeight(0.2), alignItems: 'center', }}>
            <View style={[style.main, { position: 'relative', borderColor: 'white' }]}>
                <Pressable
                    onPress={() => {
                        navigation.navigate(routes.ADDSTORY)
                    }}
                    style={[
                        style.main,
                        {
                            width: responsiveScreenWidth(20),
                            backgroundColor: colors.background,
                            elevation: 1,
                            overflow: 'hidden',
                            margin: 'auto',
                        }
                    ]}
                >
                    {/* <Image style={style.img} source={{ uri: border === 0 ? user?.profile_image : stories.entities[item].photo }} /> */}
                </Pressable>

                {isMine && (
                    <Pressable
                        onPress={() => {
                            navigation.navigate(routes.ADDSTORY)
                        }}
                        style={{
                            position: 'absolute',
                            borderRadius: 100,
                            aspectRatio: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            bottom: "5%",
                            right: "5%",
                            overflow: "hidden",
                        }}
                    >
                        <Icon size={responsiveScreenFontSize(2.5)} style={{ backgroundColor: colors.background }} icon={{type:"Feather",name:"plus-circle"}}  />
                    </Pressable>
                )}
            </View>
            <Text
                numberOfLines={1}
                style={{
                    fontSize: responsiveScreenFontSize(1.8),
                    maxWidth: responsiveScreenWidth(18),
                    width: "100%",
                    textAlign: 'center',
                }}
            >
                My Story
            </Text>
        </View>
    )

}
export default StoryCircle;

const style = StyleSheet.create({
    main: {
        aspectRatio: 1,
        borderRadius: '50%',
        width: responsiveScreenWidth(20),
        borderColor: "#3793f6",
    },
    img: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 100,
    },
});