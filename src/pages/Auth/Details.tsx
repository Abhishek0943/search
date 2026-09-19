import { ParamListBase, useNavigation, } from '@react-navigation/native';
import { NativeStackNavigationProp, } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState, } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, TouchableOpacity, View, } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from '../../utils/Icon';
import { responsiveFontSize, responsiveHeight, responsiveWidth, } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel, CustomTextInput } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store';
import Button from '../../components/Button';
import { Industries, GetNumberOfEmployees } from '../../reducer/jobsReducer';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';
import { useAlert } from '../../context/AlertContext';
import { UpdateRegistrationDetails } from '../../reducer/recruiterReducer';
import { postApiCall, deleteApiCall } from '../../api';
import { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStyles from './styles';

const Details = () => {
    const { colors } = useContext(ThemeContext);
    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ComponentSingUp
                        mainColor={colors.compPrimary}
                        secondaryColor={colors.compPrimary2}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>

        </>
    );
};

export default Details;
interface UserState {
    industryIds: string[];
    availabilityIds: string[];
    abn: string;
    acn: string;
    industry_id: string;
    businessaddress: string;
    trendingname: string;
    mobile: string;
    aboutCompany: string;
    no_of_employees: string;
    logo?: string;
}
export const ComponentSingUp = ({ mainColor, secondaryColor, }: { mainColor: string; secondaryColor: string; }) => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { colors } = useContext(ThemeContext);
    const [industries, setIndustries] = useState<{ id: string; name: string; }[]>([]);
    const [staffSizes, setStaffSizes] = useState<{ id: string; name: string; }[]>([]);
    const [step, setStep] = useState(1)
    const dispatch = useAppDispatch()
    const { showAlert } = useAlert();
    const { user: companyUser } = useAppSelector((state) => state.userStore)
    const [user, setUser] = useState<UserState>({ no_of_employees: '', industry_id: '', acn: '', industryIds: [], aboutCompany: '', availabilityIds: [], abn: '', businessaddress: '', trendingname: '', mobile: '', });
    const [workplacePhotos, setWorkplacePhotos] = useState<any[]>(companyUser ? companyUser.images || [] : []);
    const pickLogo = async () => {
        try {
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
            });
            const logoImage = {
                uri: image.path,
                name: `logo_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`,
                type: image.mime || 'image/jpeg',
            };

            const formData = new FormData();
            formData.append('logo', logoImage);

            const response = await postApiCall<{ success: true; data?: any } | { success: false, message: string }>('/company/upload-images', formData, { as: 'form' });
            if (response && response.success) {
                setUser(prev => ({ ...prev, logo: response.data.logo_url }));
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to upload logo' });
            }
        } catch (_e) { }
    };

    const pickWorkplacePhotos = async () => {
        const remaining = 4 - workplacePhotos.length;
        if (remaining <= 0) {
            Alert.alert('Limit Reached', 'You can upload up to 4 workplace photos.');
            return;
        }
        try {
            const images = await ImagePicker.openPicker({
                multiple: true,
                maxFiles: remaining,
                compressImageQuality: 0.8,
                mediaType: 'photo',
            });
            const newPhotos = images.map((img, idx) => ({
                uri: img.path,
                name: `workplace_${Date.now()}_${idx}.${img.mime?.includes('png') ? 'png' : 'jpg'}`,
                type: img.mime || 'image/jpeg',
            }));

            const formData = new FormData();
            newPhotos.forEach((photo) => {
                formData.append('images[]', photo);
            });

            const response = await postApiCall<{ success: true; data?: any } | { success: false, message: string }>('/company/upload-images', formData, { as: 'form' });
            if (response && response.success) {
                setWorkplacePhotos(response.data.images)
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to upload images' });
            }
        } catch (_e) { }
    };

    const removeWorkplacePhoto = async (index: number, photoId?: string | number) => {
        if (photoId) {
            const response = await deleteApiCall<{ success: true; data?: any } | { success: false, message: string }>(`/company/delete-image/${photoId}`);
            if (response && response.success) {
                setWorkplacePhotos(prev => prev.filter((_, i) => i !== index));
            } else {
                showAlert({ title: 'Error', message: response?.message || 'Failed to delete image' });
            }
        } else {
            setWorkplacePhotos(prev => prev.filter((_, i) => i !== index));
        }
    };
    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };
    useEffect(() => {
        dispatch(Industries()).unwrap().then(res => res.success && setIndustries(res.data))
        dispatch(GetNumberOfEmployees()).unwrap().then(res => res.success && setStaffSizes(res.data))
        AsyncStorage.getItem("Company").then(res => {
            if (res) {
                const parsed = JSON.parse(res)
                setUser(parsed)
                setStep(parsed.step)
            }
        });
    }, [dispatch]);
    useEffect(() => {
        if (companyUser?.logo) setUser({ ...user, logo: companyUser.logo })
    }, [companyUser]);
    const renderElem = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(4),
                            }}
                        >
                            <Pressable
                                onPress={() => setStep(2)}
                                style={{
                                    width: responsiveWidth(2.8),
                                    aspectRatio: 1 / 2,
                                }}
                            >
                                <Image
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                    }}
                                    source={imagePath.leftAngle}
                                />
                            </Pressable>

                            <View>
                                <Text
                                    style={{
                                        color: mainColor,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '800',
                                    }}
                                >
                                    Step 1 of 2
                                </Text>

                                <Text
                                    style={{
                                        color: secondaryColor,
                                        lineHeight: responsiveFontSize(2.6),
                                        fontSize: responsiveFontSize(3),
                                        fontWeight: '800',
                                    }}
                                >
                                    Your business
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                width: responsiveWidth(90),
                                marginTop: responsiveHeight(2),
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(1.5),
                                marginBottom: responsiveHeight(1),
                            }}
                        >
                            {[1, 2].map(i => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor:
                                            i <= step ? mainColor : colors.gray,
                                    }}
                                />
                            ))}
                        </View>
                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                marginTop: responsiveHeight(2.5),
                                position: 'relative',
                                right: responsiveWidth(5),
                                aspectRatio: 350 / 1,
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('./images/Devider2.png')}
                            />
                        </Pressable>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            contentContainerStyle={{
                                paddingBottom: responsiveHeight(5),
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    lineHeight: responsiveFontSize(2.6),
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    marginTop: responsiveHeight(1.5),
                                }}
                            >
                                This is what appears on every job ad.
                            </Text>

                            <InPutWithLabel
                                inputContainerStyle={{
                                    marginBottom: responsiveHeight(0.5),
                                }}
                                mainColor={mainColor}
                                secondaryColor={secondaryColor}
                                label="ABN"
                                value={user.abn}
                                onChangeText={text =>
                                    handleInputChange({
                                        name: 'abn',
                                        value: text,
                                    })
                                }
                                placeholder="51 824 753 556"
                            />
                            <InPutWithLabel
                                inputContainerStyle={{
                                    marginBottom: responsiveHeight(0.5),
                                }}
                                mainColor={mainColor}
                                secondaryColor={secondaryColor}
                                label="ACN"
                                value={user.acn}
                                onChangeText={text =>
                                    handleInputChange({
                                        name: 'acn',
                                        value: text,
                                    })
                                }
                                placeholder="51 824 753 556"
                            />
                            <InPutWithLabel
                                inputContainerStyle={{
                                    marginBottom: responsiveHeight(0.5),
                                }}
                                mainColor={mainColor}
                                secondaryColor={secondaryColor}
                                label="Trading name"
                                value={user.trendingname}
                                onChangeText={text =>
                                    handleInputChange({
                                        name: 'trendingname',
                                        value: text,
                                    })
                                }
                                placeholder="Roza Mexicano"
                            />

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    lineHeight: responsiveFontSize(2.6),
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                The name candidates see on every job ad.
                            </Text>

                            <InPutWithLabel
                                inputContainerStyle={{
                                    marginBottom: responsiveHeight(0.5),
                                }}
                                mainColor={mainColor}
                                secondaryColor={secondaryColor}
                                label="Business address"
                                value={user.businessaddress}
                                onChangeText={text =>
                                    handleInputChange({
                                        name: 'businessaddress',
                                        value: text,
                                    })
                                }
                                placeholder="142 The Parade, Norwood SA 5067"
                            />

                            <SearchSelectDropdown
                                label="Staff Size"
                                options={staffSizes}
                                placeholder="Search staff size..."
                                secondaryColor={secondaryColor}
                                multiSelect={false}
                                selectedId={user.no_of_employees}
                                onSelect={(id: string) => {
                                    setUser(prev => ({
                                        ...prev,
                                        no_of_employees: id,
                                    }));
                                }}
                            />

                        </ScrollView>

                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                position: 'relative',
                                right: responsiveWidth(5),
                                aspectRatio: 350 / 1,
                                marginBottom: responsiveHeight(2.5),
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('./images/Devider2.png')}
                            />
                        </Pressable>
                        <Button
                            label="Continue"
                            backgroundColor={mainColor}
                            onPress={async () => {
                                if (!user.abn.trim()) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please enter ABN.",
                                    });
                                    return;
                                }

                                if (!user.trendingname.trim()) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please enter trading name.",
                                    });
                                    return;
                                }

                                if (!user.businessaddress.trim()) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please enter business address.",
                                    });
                                    return;
                                }

                                if (!user.no_of_employees) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please select staff size.",
                                    });
                                    return;
                                }
                                await AsyncStorage.setItem("Company", JSON.stringify({ ...user, step: 2 }));
                                setStep(2);

                            }}
                        />
                    </>
                );

            case 2:
                return (
                    <>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(4),
                            }}
                        >
                            <Pressable
                                onPress={() => setStep(1)}
                                style={{
                                    width: responsiveWidth(2.8),
                                    aspectRatio: 1 / 2,
                                }}
                            >
                                <Image
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                    }}
                                    source={imagePath.leftAngle}
                                />
                            </Pressable>

                            <View>
                                <Text
                                    style={{
                                        color: mainColor,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '800',
                                    }}
                                >
                                    Step 2 of 2
                                </Text>

                                <Text
                                    style={{
                                        color: secondaryColor,
                                        lineHeight: responsiveFontSize(2.6),
                                        fontSize: responsiveFontSize(3),
                                        fontWeight: '800',
                                    }}
                                >
                                    Your venue
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{
                                width: responsiveWidth(90),
                                marginTop: responsiveHeight(2),
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(1.5),
                                marginBottom: responsiveHeight(1),
                            }}
                        >
                            {[1, 2].map(i => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor:
                                            i <= step ? mainColor : colors.gray,
                                    }}
                                />
                            ))}
                        </View>

                        <Pressable
                            style={{
                                width: responsiveWidth(100),
                                marginTop: responsiveHeight(2.5),
                                position: 'relative',
                                right: responsiveWidth(5),
                                aspectRatio: 350 / 1,
                            }}
                        >
                            <Image
                                style={authStyles.bgImageContain}
                                source={require('./images/Devider2.png')}
                            />
                        </Pressable>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            contentContainerStyle={{
                                paddingBottom: responsiveHeight(5),
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    lineHeight: responsiveFontSize(2.6),
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    marginTop: responsiveHeight(1.5),
                                }}
                            >
                                Only the industry is needed. The rest can wait.
                            </Text>

                            <SearchSelectDropdown
                                label="Industry"
                                options={industries}
                                placeholder="Search or add an industry"
                                multiSelect={true}
                                selectedIds={user.industryIds}
                                onToggle={(id: string) => {
                                    setUser(prev => ({
                                        ...prev,
                                        industryIds:
                                            prev.industryIds.includes(id)
                                                ? []
                                                : [id],
                                    }));
                                }}
                            />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'baseline',
                                    gap: responsiveWidth(1),
                                    marginBottom: responsiveHeight(0.5),
                                }}
                            >
                                <Text
                                    style={{
                                        color: secondaryColor,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '700',
                                    }}
                                >
                                    About the company
                                </Text>
                            </View>
                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.primary,
                                paddingHorizontal: responsiveWidth(4),
                                marginBottom: responsiveHeight(1),
                                minHeight: responsiveHeight(12),
                            }}>
                                <TextInput
                                    multiline
                                    maxLength={200}
                                    value={user.aboutCompany}
                                    onChangeText={(t) => handleInputChange({ name: 'aboutCompany', value: t })}
                                    placeholder="Type two lines, or skip it."
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                                />
                                <Text style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(1), color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    {(user.aboutCompany || '').length} / 200
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'baseline',
                                    gap: responsiveWidth(1),
                                    marginBottom: responsiveHeight(0.5),
                                }}
                            >
                                <Text
                                    style={{
                                        color: secondaryColor,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '700',
                                    }}
                                >
                                    Logo
                                </Text>
                            </View>

                            <Pressable style={{
                                width: "100%",
                                aspectRatio: 350 / 98,
                                position: 'relative',
                            }} onPress={pickLogo}>
                                <Image source={require("./images/UploadLogo.png")} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                                {
                                    user.logo &&
                                    <View style={{
                                        position: 'absolute',
                                        bottom: responsiveWidth(2),
                                        right: responsiveWidth(2),
                                        zIndex: 10,
                                        width: responsiveWidth(9.8),
                                        height: responsiveWidth(9.8),
                                        borderRadius: responsiveWidth(9.8) / 8,
                                        overflow: 'hidden'

                                    }}>
                                        <Image source={{ uri: user.logo }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
                                    </View>
                                }

                            </Pressable>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'baseline',
                                    gap: responsiveWidth(1),
                                    marginBottom: responsiveHeight(0.5),
                                    marginTop: responsiveHeight(1),
                                }}
                            >
                                <Text
                                    style={{
                                        color: secondaryColor,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '700',
                                    }}
                                >
                                    Workplace photos
                                </Text>

                            </View>
                            <Pressable
                                onPress={pickWorkplacePhotos} style={{
                                    width: "100%",
                                    aspectRatio: 350 / 98
                                }}>
                                <Image source={require("./images/UploadImages.png")} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                            </Pressable>
                            {workplacePhotos.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginVertical: responsiveHeight(1) }}
                                    contentContainerStyle={{ gap: responsiveWidth(2) }}
                                >
                                    {workplacePhotos.map((photo, index) => (
                                        <View
                                            key={`${photo.name}_${index}`}
                                            style={{
                                                width: responsiveWidth(22),
                                                height: responsiveWidth(22),
                                                borderRadius: 12,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Image
                                                source={{ uri: photo.url || photo.image_url }}
                                                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                                            />
                                            <Pressable
                                                onPress={() => removeWorkplacePhoto(index, photo.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(0,0,0,0.55)',
                                                    borderRadius: 12,
                                                    width: 24,
                                                    height: 24,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Icon
                                                    icon={{ type: 'MaterialIcons', name: 'close' }}
                                                    size={16}
                                                    style={{ color: '#fff' }}
                                                />
                                            </Pressable>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </ScrollView>

                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={authStyles.bgImageContain} source={require("./images/Devider2.png")} />
                        </Pressable>
                        <Button
                            label="Finish"
                            backgroundColor={mainColor}
                            onPress={() => {
                                if (user.industryIds.length === 0) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Please select an industry.",
                                    });
                                    return;
                                }
                                dispatch(UpdateRegistrationDetails(
                                    {
                                        industry_id: Number(user.industryIds[0]),
                                        description: user.aboutCompany.trim(),
                                        // abn: user.abn.trim(),
                                        // acn: user.acn.trim(),
                                        abn: 11111111111,
                                        acn: 111111111,
                                        name: user.trendingname.trim(),
                                        location: user.businessaddress.trim(),
                                        no_of_employees: user.no_of_employees,

                                    },
                                )).unwrap().then((res) => {
                                    if (res.success) {
                                        showAlert({
                                            title: "Success",
                                            message:
                                                "Company profile completed successfully.",
                                        });
                                        navigation.reset({
                                            index: 0,
                                            routes: [
                                                {
                                                    name: routes.HOME,
                                                },
                                            ],
                                        });
                                    }
                                    else {
                                        console.log("ressssssssssss", res);

                                        showAlert({ title: 'Error', message: res.message });
                                    }
                                })
                            }}

                        />
                    </>
                );
        }
    };


    return (
        <>
            <View
                style={{
                    backgroundColor: colors.background,
                    height: responsiveHeight(100),
                    width: responsiveWidth(100),
                    flex: 1,
                    paddingBottom: responsiveHeight(2),
                    paddingVertical: responsiveHeight(1),
                    paddingHorizontal: responsiveWidth(5),
                }}
            >
                {renderElem()}
            </View>
        </>
    );
};
