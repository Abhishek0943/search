import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { Image, Pressable, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, Alert, ActivityIndicator } from 'react-native'
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import imagePath from '../../assets/imagePath';
import { InPutWithLabel } from '../../components';
import Button from '../../components/Button';
import Text from '../../components/Text';
import Icon from '../../utils/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store';
import { GetAllAvailabilities, GetAllWorkRights, GetSkills, Industries, AddWorkExperience, EditWorkExperience, GetExperience, DeleteExperience, DeleteCertificate, UploadCV } from '../../reducer/jobsReducer';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { WebView } from 'react-native-webview';
import { createThumbnail } from 'react-native-create-thumbnail';
import MonthPicker from 'react-native-month-year-picker';
import { postApiCall } from '../../api';
import { useAlert } from '../../context/AlertContext';
import RNFS from 'react-native-fs';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import { routes } from '../../constants/values';

function ProfileCompelete(): ReactElement {
    const { colors } = useContext(ThemeContext);
    const { showConfirm } = useAlert();
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const dispatch = useAppDispatch();
    const [availabilityOptions, setAvailabilityOptions] = useState<{ id: string; name: string }[]>([]);
    const [workRightsOptions, setWorkRightsOptions] = useState<{ id: string; name: string }[]>([]);
    const [industryOptions, setIndustryOptions] = useState<{ id: string; name: string }[]>([]);
    const [skillOptions, setSkillOptions] = useState<{ id: string; name: string }[]>([]);
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<{
        name: string;
        address: string;
        availabilityIds: string[];
        workRightsId: string;
        industryId: string;
        skillIds: string[];
        profilePictureUrl: string;
        profileVideoUrl: string;
        prompt1: string;
        prompt2: string;
        cvUrl?: string;
        certificates: { id: string; title: string; certificate_file: string }[]
    }>({
        name: '',
        address: '',
        availabilityIds: [],
        profilePictureUrl: '',
        profileVideoUrl: '',
        workRightsId: '',
        industryId: '',
        skillIds: [],
        prompt1: "",
        prompt2: "",
        cvUrl: "",
        certificates: [],
    });

    useEffect(() => {
        const loadData = async () => {
            const data = await AsyncStorage.getItem("user");
            if (data) {
                setUser(JSON.parse(data));
                setStep(JSON.parse(data).step || 1);
            }
        };
        loadData();
    }, []);


    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [roleSheetVisible, setRoleSheetVisible] = useState(false);
    const [loadingRole, setLoadingRole] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleItem>({
        id: 0,
        jobTitle: '',
        businessName: '',
        startDate: 'Jan 2023',
        endDate: 'Still here',
        stillHere: true,
        description: '',
    });
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [videoIntro, setVideoIntro] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [certImage, setCertImage] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [resumeFile, setResumeFile] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
    const [certTitle, setCertTitle] = useState('');
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [videoThumb, setVideoThumb] = useState<string | null>(null);
    const [cvModalVisible, setCvModalVisible] = useState(false);
    const [cvThumbnail, setCvThumbnail] = useState<string | null>(null);
    const [cvPageCount, setCvPageCount] = useState<number>(0);
    const [cvPages, setCvPages] = useState<{ uri: string, width: number, height: number }[]>([]);
    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parseDateString = (dateStr: string) => {
        if (!dateStr || dateStr === 'Still here') return new Date();
        const [monthStr, yearStr] = dateStr.split(' ');
        const monthIndex = monthNames.indexOf(monthStr);
        if (monthIndex === -1 || !yearStr) return new Date();
        return new Date(parseInt(yearStr), monthIndex, 1);
    };

    const formatDateToMonthYear = (dateStr?: string | null) => {
        if (!dateStr) return 'Still here';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const fetchExperiences = () => {
        dispatch(GetExperience()).unwrap().then(res => {
            if (res.success && res.data) {
                const fetchedRoles = res.data.map((item: any) => ({
                    id: item.id,
                    jobTitle: item.title ?? '',
                    businessName: item.company ?? '',
                    startDate: formatDateToMonthYear(item.date_start),
                    endDate: item.is_currently_working ? 'Still here' : formatDateToMonthYear(item.date_end),
                    stillHere: !!item.is_currently_working,
                    description: item.description ?? ''
                }));
                setRoles(fetchedRoles);
            }
        }).catch(err => console.error("Error fetching experience:", err));
    };

    useEffect(() => {
        fetchExperiences();
    }, [dispatch]);

    useEffect(() => {
        const url = videoIntro?.uri || user.profileVideoUrl;
        if (url) {
            createThumbnail({
                url,
                timeStamp: 1000,
            })
                .then(response => setVideoThumb(response.path))
                .catch(err => console.error('Thumbnail generation error:', err));
        } else {
            setVideoThumb(null);
        }
    }, [videoIntro, user.profileVideoUrl]);

    useEffect(() => {
        const generatePdfThumbnail = async (url: string) => {
            try {
                let localPath = url;
                if (url.startsWith('http')) {
                    const tempPath = `${RNFS.TemporaryDirectoryPath}/temp_cv.pdf`;
                    const download = RNFS.downloadFile({
                        fromUrl: url,
                        toFile: tempPath,
                    });
                    await download.promise;
                    localPath = tempPath;
                }
                const results = await PdfThumbnail.generateAllPages(localPath);
                if (results && results.length > 0) {
                    setCvPages(results);
                    setCvThumbnail(results[0].uri);
                    setCvPageCount(results.length);
                }
            } catch (error) {
                console.log("PDF Thumbnail Error:", error);
            }
        };

        if (user.cvUrl) {
            generatePdfThumbnail(user.cvUrl);
        }
    }, [user.cvUrl]);

    const uploadMediaToApi = async (key: string, file: { uri: string; name: string; type: string }, extraFields?: Record<string, string>) => {
        try {
            setUploadingMedia(key);
            const fd = new FormData();
            fd.append(key, {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
            if (extraFields) {
                Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
            }
            const res: any = await postApiCall('/jobseeker/update-user-media', fd, { as: 'form' });
            if (!res.success) {
                Alert.alert('Upload Failed', res?.message || 'Something went wrong');
            }
            if (res.success) {
                await AsyncStorage.setItem("user", JSON.stringify({ ...user, profilePictureUrl: res.data?.image, profileVideoUrl: res.data?.video_link, certificates: res.data?.certificates }));
                setUser((prev) => ({ ...prev, profilePictureUrl: res.data?.image, profileVideoUrl: res.data?.video_link, certificates: res.data?.certificates }));
            }
        } catch (e) {
            Alert.alert('Upload Failed', 'Network error. Please try again.');
        } finally {
            setUploadingMedia(null);
        }
    };

    const pickProfilePhoto = async () => {
        try {
            const image = await ImagePicker.openPicker({
                cropperCircleOverlay: true,
                compressImageQuality: 0.9,
                mediaType: 'photo',
            });
            if (!image?.path) return;
            const fileName = `profile_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`;
            const file = { uri: image.path, name: fileName, type: image.mime || 'image/jpeg' };
            setProfilePhoto(file);
            uploadMediaToApi('image', file);
        } catch (e) { }
    };

    const pickVideoIntro = async () => {
        try {
            const res = await launchImageLibrary({
                mediaType: 'video',
                selectionLimit: 1,
            });
            if (res.didCancel) return;
            const asset = res.assets?.[0];
            if (!asset?.uri) return;
            const fileName = asset.fileName || `video_${Date.now()}.mp4`;
            const file = { uri: asset.uri, name: fileName, type: asset.type || 'video/mp4' };
            setVideoIntro(file);
            uploadMediaToApi('video', file);
        } catch (e) { }
    };

    const pickCertImage = async () => {
        if (!certTitle.trim()) {
            Alert.alert('Title Required', 'Please enter a certificate title before uploading.');
            return;
        }
        try {
            const image = await ImagePicker.openPicker({
                cropperCircleOverlay: false,
                compressImageQuality: 0.9,
                mediaType: 'photo',
            });
            if (!image?.path) return;
            const fileName = `cert_${Date.now()}.${image.mime?.includes('png') ? 'png' : 'jpg'}`;
            const file = { uri: image.path, name: fileName, type: image.mime || 'image/jpeg' };
            setCertImage(file);
            await uploadMediaToApi('certificate', file, { certificate_title: certTitle.trim() });
            setCertTitle('');
            setCertImage(null);
        } catch (e) { }
    };

    const normalizeFileUri = (u?: string) => {
        if (!u) return '';
        if (u.startsWith('/')) return `file://${u}`;
        return u;
    };

    const pickResume = async () => {
        try {
            const [doc] = await pick({
                type: [types.pdf],
                allowMultiSelection: false,
                mode: 'import',
            });
            const uri = normalizeFileUri((doc as any).fileCopyUri || doc.uri);
            const file = { uri, name: doc.name ?? 'resume.pdf', type: doc.type || 'application/pdf' };
            setResumeFile(file);
            setUploadingMedia('resume');

            try {
                const results = await PdfThumbnail.generateAllPages(uri);
                if (results && results.length > 0) {
                    setCvPages(results);
                    setCvThumbnail(results[0].uri);
                    setCvPageCount(results.length);
                }
            } catch (e) {
                console.log("PDF Thumbnail Gen Error:", e);
            }

            const fd = new FormData();
            fd.append('title', '');
            fd.append('is_default', '1');
            fd.append('cv_file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);

            dispatch(UploadCV(fd))
                .unwrap()
                .then(async (res: any) => {
                    setUploadingMedia(null);
                    if (res.success) {
                        const url = res.data?.file_url || res.data?.cv_file || file.uri;
                        const updatedUser = { ...user, cvUrl: url };
                        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                        setUser(updatedUser);
                    } else {
                        Alert.alert("Error", res?.message || "Failed to upload CV");
                    }
                })
                .catch(err => {
                    setUploadingMedia(null);
                    console.error("CV Upload Error:", err);
                });
        } catch (e) { }
    };
    useEffect(() => {
        dispatch(GetAllAvailabilities()).unwrap().then((res) => {
            if (res.success) setAvailabilityOptions(res.data);
        }).catch(() => { });
        dispatch(GetAllWorkRights()).unwrap().then((res) => {
            if (res.success) setWorkRightsOptions(res.data);
        }).catch(() => { });
        dispatch(Industries()).unwrap().then((res: any) => {
            if (res.success) setIndustryOptions(res.data || []);
        }).catch(() => { });
        dispatch(GetSkills()).unwrap().then((res: any) => {
            console.log(res, "skill")
            if (res.success) setSkillOptions(res.data || res.jobs || []);
        }).catch(() => { });
    }, []);

    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };

    const renderElem = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => navigation.goBack()} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View style={{}}>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 1 of 4
                                </Text>
                                <Text style={{ color: colors.textPrimary, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Basic details
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2, 3, 4].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor: i <= step ? colors.primary : colors.gray,
                                    }}
                                />
                            ))}
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(.5) }} mainColor={colors.primary} secondaryColor={colors.primary2} label={'First Name'} value={user.name} onChangeText={(text) => handleInputChange({ name: "name", value: text })} placeholder="Enter your first name" />
                            <InPutWithLabel inputContainerStyle={{ marginBottom: responsiveHeight(.5) }} mainColor={colors.primary} secondaryColor={colors.primary2} label={'Address'} value={user.address} onChangeText={(text) => handleInputChange({ name: "address", value: text })} placeholder="Enter your address" />

                            <SearchSelectDropdown
                                label="Availability"
                                options={availabilityOptions}
                                placeholder="Search availability..."
                                multiSelect={true}
                                selectedIds={user.availabilityIds}
                                onToggle={(id) => {
                                    setUser(prev => {
                                        const already = prev.availabilityIds.includes(id);
                                        return { ...prev, availabilityIds: already ? prev.availabilityIds.filter(i => i !== id) : [...prev.availabilityIds, id], };
                                    })
                                }}
                            />
                            <SearchSelectDropdown
                                label="Work rights"
                                options={workRightsOptions}
                                placeholder="Search work rights..."
                                multiSelect={false}
                                selectedId={user.workRightsId}
                                onSelect={(id) => {
                                    setUser(prev => {
                                        return { ...prev, workRightsId: id };
                                    })
                                }}
                            />
                        </ScrollView>
                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>
                        <Button
                            label="Continue"
                            backgroundColor={colors.primary}
                            onPress={async () => {
                                setStep(2)
                                await AsyncStorage.setItem("user", JSON.stringify({ ...user, step: 2 }));
                            }}
                        />
                    </>
                )
            case (2):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(1)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View style={{}}>
                                <Text style={{ color: colors.primary, borderWidth: 1, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 2 of 4
                                </Text>
                                <Text style={{ color: colors.textPrimary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Job matching
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2, 3, 4].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor: i <= step ? colors.primary : colors.gray,
                                    }}
                                />
                            ))}

                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>
                        <SearchSelectDropdown
                            label="Industries"
                            options={industryOptions}
                            placeholder="Search industries..."
                            multiSelect={false}
                            selectedId={user.industryId}
                            onSelect={(id) => setUser(prev => ({ ...prev, industryId: id }))}
                        />
                        <SearchSelectDropdown
                            label="Skills"
                            options={skillOptions}
                            placeholder="Search skills..."
                            multiSelect={true}
                            selectedIds={user.skillIds}
                            onToggle={(id) => setUser(prev => {
                                const already = prev.skillIds.includes(id);
                                return {
                                    ...prev,
                                    skillIds: already
                                        ? prev.skillIds.filter(i => i !== id)
                                        : [...prev.skillIds, id],
                                };
                            })}
                        />
                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Continue"
                            backgroundColor={colors.primary}
                            onPress={async () => {
                                setStep(3)
                                await AsyncStorage.setItem("user", JSON.stringify({ ...user, step: 3 }));
                            }}
                        />
                    </>
                );
            case (3):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(2)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 3 of 4
                                </Text>
                                <Text style={{ color: colors.textPrimary, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Build your profile
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2, 3, 4].map((i) => (
                                <View key={i} style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: i <= step ? colors.primary : colors.gray }} />
                            ))}
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5) }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>
                                Employers open profiles with a photo first. All of this is optional.
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), marginTop: responsiveHeight(1) }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>PROFILE PHOTO</Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.surfaces,
                                padding: responsiveWidth(4),
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: responsiveWidth(3),
                                marginBottom: responsiveHeight(2),
                            }}>
                                <View style={{
                                    width: responsiveWidth(14),
                                    aspectRatio: 1,
                                    borderRadius: responsiveWidth(7),
                                    backgroundColor: colors.surfaces,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: "hidden",
                                }}>
                                    {
                                        profilePhoto || user.profilePictureUrl ? <Image style={{ height: "100%", width: "100%" }} source={{ uri: profilePhoto?.uri || user?.profilePictureUrl }} />
                                            :
                                            <Icon icon={{ type: 'MaterialIcons', name: 'person' }} size={responsiveWidth(8)} style={{ color: colors.textSecondary }} />
                                    }
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Pressable onPress={pickProfilePhoto} disabled={uploadingMedia === 'image'} style={{
                                        backgroundColor: colors.primary,
                                        borderRadius: 10,
                                        paddingVertical: responsiveHeight(1.5),
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        gap: responsiveWidth(2),
                                        marginBottom: responsiveHeight(0.8),
                                        opacity: uploadingMedia === 'image' ? 0.6 : 1,
                                    }}>
                                        {uploadingMedia === 'image' ? (
                                            <ActivityIndicator size="small" color={colors.white} />
                                        ) : (
                                            <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={18} style={{ color: colors.white }} />
                                        )}
                                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>
                                            {profilePhoto || user.profilePictureUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
                                        </Text>
                                    </Pressable>

                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5) }}>Clear face, no sunglasses.</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), marginTop: responsiveHeight(1) }}>

                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    VIDEO INTRO
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>

                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.surfaces,
                                padding: responsiveWidth(4),
                                marginBottom: responsiveHeight(2),
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: responsiveWidth(3), marginBottom: responsiveHeight(1.5) }}>
                                    <Pressable
                                        onPress={() => {
                                            if (user.profileVideoUrl || videoIntro) {
                                                setVideoModalVisible(true);
                                            }
                                        }}
                                        style={{
                                            width: responsiveWidth(18),
                                            aspectRatio: 1,
                                            borderRadius: 10,
                                            backgroundColor: colors.textPrimary,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                        {(user.profileVideoUrl || videoIntro) ? (
                                            <>
                                                {videoThumb ? (
                                                    <Image
                                                        source={{ uri: videoThumb }}
                                                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                                        resizeMode="cover"
                                                    />
                                                ) : null}
                                                <View style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Icon icon={{ type: 'MaterialIcons', name: 'play-circle-outline' }} size={30} style={{ color: '#fff' }} />
                                                </View>
                                            </>
                                        ) : (
                                            <View style={{
                                                width: responsiveWidth(7),
                                                aspectRatio: 1,
                                                borderRadius: responsiveWidth(3.5),
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Icon icon={{ type: 'MaterialIcons', name: 'play-arrow' }} size={20} style={{ color: '#fff' }} />
                                            </View>
                                        )}
                                    </Pressable>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.9), fontWeight: '600', marginBottom: responsiveHeight(0.3) }}>
                                            Say your name, where you have worked, when you can work.
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5) }}>
                                            30 seconds. Never scripted.
                                        </Text>
                                    </View>
                                </View>
                                <Pressable onPress={pickVideoIntro} disabled={uploadingMedia === 'video'} style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.primary,
                                    borderRadius: 10,
                                    paddingVertical: responsiveHeight(1.5),
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: responsiveWidth(2),
                                    opacity: uploadingMedia === 'video' ? 0.6 : 1,
                                }}>
                                    {uploadingMedia === 'video' ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={18} style={{ color: colors.primary }} />
                                    )}
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>
                                        {user.profileVideoUrl ? 'Change video' : 'Upload a file'}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    PROMPT 1 OF 2
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2), fontWeight: '800', marginBottom: responsiveHeight(1) }}>
                                What are you like to work with?
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.primary,
                                paddingHorizontal: responsiveWidth(4),
                                marginBottom: responsiveHeight(2),
                                minHeight: responsiveHeight(12),
                            }}>
                                <TextInput
                                    multiline
                                    maxLength={200}
                                    value={user.prompt1}
                                    onChangeText={(t) => handleInputChange({ name: 'prompt1', value: t })}
                                    placeholder="Type two lines, or skip it."
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                                />
                                <Text style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(1), color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    {(user.prompt1 || '').length} / 200
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0.5), }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    PROMPT 2 OF 2
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2), fontWeight: '800', marginBottom: responsiveHeight(1) }}>
                                What are you looking to learn?
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.primary,
                                paddingHorizontal: responsiveWidth(4),
                                marginBottom: responsiveHeight(2),
                                minHeight: responsiveHeight(12),
                            }}>
                                <TextInput
                                    multiline
                                    maxLength={200}
                                    value={user.prompt2}
                                    onChangeText={(t) => handleInputChange({ name: 'prompt2', value: t })}
                                    placeholder="Type two lines, or skip it."
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                                />
                                <Text style={{ alignSelf: 'flex-end', marginBottom: responsiveHeight(1), color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    {(user.prompt2 || '').length} / 200
                                </Text>
                            </View>

                            <View style={{
                                marginBottom: responsiveHeight(2),
                                width: responsiveWidth(90),
                                aspectRatio: 350 / 70
                            }}>
                                <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./InfoButton.png")} />
                            </View>
                        </ScrollView >

                        <View style={{ flex: 1 }} />

                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5) }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Continue"
                            backgroundColor={colors.primary}
                            onPress={async () => { setStep(4); await AsyncStorage.setItem("user", JSON.stringify({ ...user, step: 4 })); }}
                        />
                        <Modal visible={videoModalVisible} transparent={true} animationType="fade" onRequestClose={() => setVideoModalVisible(false)}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' }}>
                                <Pressable onPress={() => setVideoModalVisible(false)} style={{ position: 'absolute', top: responsiveHeight(5), right: responsiveWidth(5), zIndex: 10, padding: 10 }}>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'close' }} size={30} style={{ color: '#fff' }} />
                                </Pressable>
                                <View style={{ width: '100%', height: responsiveHeight(40) }}>
                                    {videoModalVisible && (videoIntro?.uri || user.profileVideoUrl) && (
                                        <WebView
                                            source={{ uri: videoIntro?.uri || user.profileVideoUrl }}
                                            style={{ flex: 1, backgroundColor: 'transparent' }}
                                            allowsInlineMediaPlayback
                                            mediaPlaybackRequiresUserAction={false}
                                        />
                                    )}
                                </View>
                            </View>
                        </Modal>
                    </>
                );
            case (4):
                return (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(4) }}>
                            <Pressable onPress={() => setStep(3)} style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2 }}>
                                <Image style={{ height: "100%", width: "100%", }} source={imagePath.leftAngle} />
                            </Pressable>
                            <View style={{}}>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '800' }}>
                                    Step 4 of 4
                                </Text>
                                <Text style={{ color: colors.textPrimary, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(3), fontWeight: '800' }}>
                                    Experience & proof
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: "row", alignItems: 'center', gap: responsiveWidth(1.5), marginBottom: responsiveHeight(1) }}>
                            {[1, 2, 3, 4].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 2,
                                        backgroundColor: i <= step ? colors.primary : colors.gray,
                                    }}
                                />
                            ))}
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            <Text style={{ color: colors.textSecondary, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>
                                A verified certificate moves you above people without one.
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1), alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0), }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    Certificates
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), marginBottom: responsiveHeight(1) }}>
                                Upload a photo of each card — RSA, White Card, anything.
                            </Text>

                            <View style={{
                                borderWidth: 1.5,
                                borderColor: colors.surfaces,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: responsiveWidth(4),
                                marginBottom: responsiveHeight(1),
                                height: responsiveHeight(6.5),
                            }}>
                                <TextInput
                                    value={certTitle}
                                    onChangeText={setCertTitle}
                                    placeholder="Certificate name (e.g. RSA, White Card)"
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                />
                            </View>

                            <Pressable onPress={pickCertImage} disabled={uploadingMedia === 'image'} style={{
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 12,
                                borderStyle: 'dashed',
                                paddingVertical: responsiveHeight(2),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(1.5),
                                opacity: uploadingMedia === 'image' ? 0.6 : 1,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    {uploadingMedia === 'image' ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={20} style={{ color: colors.primary }} />
                                    )}
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>
                                        {certImage ? 'Change photo' : 'Upload a photo'}
                                    </Text>
                                </View>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    JPG or PNG · up to 5 MB each
                                </Text>

                            </Pressable>

                            {user.certificates?.map((cert) => (
                                <View key={cert.id} style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.surfaces,
                                    borderRadius: 12,
                                    padding: responsiveWidth(3.5),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: responsiveHeight(1),
                                    gap: responsiveWidth(3),
                                }}>
                                    <View style={{
                                        width: responsiveWidth(12),
                                        aspectRatio: 1,
                                        borderRadius: 8,
                                        backgroundColor: colors.surfaces,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: "hidden"
                                    }}>
                                        <Image source={{ uri: cert?.certificate_file }} style={{ width: '100%', height: '100%' }} />
                                    </View>
                                    <Text style={{ flex: 1, color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>{cert.title}</Text>
                                    <Pressable onPress={async () => {
                                        await showConfirm({
                                            title: "Delete certificate?",
                                            message: "Are you sure you want to delete this certificate?",
                                            okText: "Delete",
                                            waitForOk: true,
                                            cancelText: "Cancel",
                                            onOkPress: () => {
                                                const value = dispatch(DeleteCertificate({ id: String(cert.id) })).unwrap().then(async (res) => {
                                                    const updatedCertificates = user.certificates.filter((c: any) => c.id !== cert.id);
                                                    await AsyncStorage.setItem("user", JSON.stringify({ ...user, certificates: updatedCertificates }));
                                                    setUser(prev => ({ ...prev, certificates: updatedCertificates }));
                                                    return true
                                                }).catch(err => {
                                                    console.error(err)
                                                    return false
                                                });
                                                return value
                                            }

                                        });

                                    }}>
                                        <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Remove</Text>
                                    </Pressable>
                                </View>
                            ))}


                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1), alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0), }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    Work Experience
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), marginBottom: responsiveHeight(1) }}>
                                One line per role. Two is plenty.
                            </Text>

                            {roles.map((role) => (
                                <View key={role.id} style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.surfaces,
                                    borderRadius: 12,
                                    padding: responsiveWidth(4),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: responsiveHeight(1),
                                }}>
                                    <View>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>{role.jobTitle}</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5) }}>
                                            {role.businessName}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>
                                            {role.startDate} — {role.stillHere ? 'now' : role.endDate}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: responsiveWidth(4) }}>
                                        <Pressable onPress={() => {
                                            setEditingRoleId(role.id);
                                            setCurrentRole({ ...role });
                                            setRoleSheetVisible(true);
                                        }}>
                                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Edit</Text>
                                        </Pressable>
                                        <Pressable onPress={async () => {
                                            await showConfirm({
                                                title: "Delete experience?",
                                                message: "Are you sure you want to delete this record?",
                                                okText: "Delete",
                                                cancelText: "Cancel",
                                                waitForOk: true,
                                                onOkPress: () => {
                                                    const value = dispatch(DeleteExperience({ id: role.id })).unwrap().then((res) => {
                                                        setRoles((prev) => {
                                                            let filteredRoles = prev.filter((r) => r.id !== role.id)
                                                            return filteredRoles
                                                        })
                                                        return true
                                                    }).catch(err => {
                                                        console.error(err)
                                                        return false
                                                    });
                                                    return value
                                                }
                                            });

                                        }}>
                                            <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Delete</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}

                            <Pressable
                                onPress={() => {
                                    setEditingRoleId(null);
                                    setCurrentRole({
                                        id: 0,
                                        jobTitle: '',
                                        businessName: '',
                                        startDate: 'Jan 2023',
                                        endDate: 'Still here',
                                        stillHere: true,
                                        description: '',
                                    });
                                    setRoleSheetVisible(true);
                                }}
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.primary,
                                    borderRadius: 12,
                                    borderStyle: 'dashed',
                                    paddingVertical: responsiveHeight(1.8),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: responsiveWidth(2),
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                <Icon icon={{ type: 'MaterialIcons', name: 'add' }} size={20} style={{ color: colors.primary }} />
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>Add a role</Text>
                            </Pressable>

                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginBottom: responsiveHeight(2) }}>
                                No experience yet? Skip it — plenty of jobs say none needed.
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1), alignItems: "baseline", gap: responsiveWidth(1), marginBottom: responsiveHeight(0), }}>
                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                    Portfiolio Link
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.2),
                                    fontWeight: "400",
                                    lineHeight: responsiveFontSize(1.9),
                                    color: colors.textSecondary,
                                    flexWrap: "wrap",
                                }}>(Optional)</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginBottom: responsiveHeight(1) }}>
                                A website, Instagram or anything that shows your work.
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderColor: colors.surfaces,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: responsiveWidth(4),
                                marginBottom: responsiveHeight(0.5),
                                height: responsiveHeight(6.5),
                            }}>
                                <Icon icon={{ type: 'MaterialIcons', name: 'link' }} size={20} style={{ color: colors.textSecondary, marginRight: responsiveWidth(2) }} />
                                <TextInput
                                    value={portfolioUrl}
                                    onChangeText={setPortfolioUrl}
                                    placeholder="https://"
                                    placeholderTextColor={colors.placeholder}
                                    style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginBottom: responsiveHeight(2) }}>
                                Skip this for bar, kitchen and floor work.
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1), alignItems: "baseline", justifyContent: "space-between", marginBottom: responsiveHeight(0), }}>
                                <View style={{ flexDirection: 'row', alignItems: "baseline", gap: responsiveWidth(1) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        Resume
                                    </Text>
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.2),
                                        fontWeight: "400",
                                        lineHeight: responsiveFontSize(1.9),
                                        color: colors.textSecondary,
                                        flexWrap: "wrap",
                                    }}>(Optional)</Text>
                                </View>
                                {user.cvUrl ? (
                                    <Pressable onPress={() => setCvModalVisible(true)}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.4), fontWeight: '700' }}>Preview</Text>
                                    </Pressable>
                                ) : null}
                            </View>

                            <Pressable onPress={pickResume} disabled={uploadingMedia === 'resume'} style={{
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 12,
                                borderStyle: 'dashed',
                                paddingVertical: responsiveHeight(2),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(0.5),
                                marginTop: responsiveHeight(1),
                                opacity: uploadingMedia === 'resume' ? 0.6 : 1,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    {uploadingMedia === 'resume' ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={20} style={{ color: colors.primary }} />
                                    )}
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>
                                        {resumeFile ? 'Change file' : 'Choose a file'}
                                    </Text>
                                </View>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    PDF · up to 5 MB
                                </Text>
                                {cvThumbnail && (
                                    <Pressable onPress={() => setCvModalVisible(true)} style={{ alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                                        <Image source={{ uri: cvThumbnail }} style={{ width: responsiveWidth(20), height: responsiveWidth(28), borderRadius: 4, borderWidth: 1, borderColor: colors.surfaces }} resizeMode="contain" />
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.3), marginTop: responsiveHeight(0.5) }}>
                                            Pages: {cvPageCount}
                                        </Text>
                                    </Pressable>
                                )}
                            </Pressable>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginBottom: responsiveHeight(3) }}>
                                Most shift jobs never ask for one. Your profile is enough.
                            </Text>
                        </ScrollView>

                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(1), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5) }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Finish — show me jobs"
                            backgroundColor={colors.primary}
                            onPress={async () => {
                                try {
                                    const data = await AsyncStorage.getItem("user");
                                    const parsed = data ? JSON.parse(data) : {};
                                    const payload = {
                                        first_name: parsed.name || '',
                                        street_address: parsed.address || '',
                                        work_right_id: parsed.workRightsId || '',
                                        industry_id: parsed.industryId || '',
                                        skill_ids: parsed.skillIds || [],
                                        work_description: parsed.prompt1 || '',
                                        learn_description: parsed.prompt2 || '',
                                        portfolio_link: portfolioUrl || '',
                                        availability_ids: parsed.availabilityIds || [],
                                    };
                                    const res: any = await postApiCall('/jobseekers/user/profile/update', payload);
                                    console.log(res)
                                    if (res.success) {
                                        await AsyncStorage.removeItem("user");
                                        navigation.reset({ index: 0, routes: [{ name: routes.HOME }] });
                                    } else {
                                        Alert.alert('Error', res.message || 'Profile update failed');
                                    }
                                } catch (err: any) {
                                    Alert.alert('Error', err?.message || 'Something went wrong');
                                }
                            }}
                        />
                        <Modal visible={cvModalVisible} transparent={true} animationType="fade" onRequestClose={() => setCvModalVisible(false)}>
                            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                                    <Pressable onPress={() => setCvModalVisible(false)}>
                                        <Icon icon={{ type: 'MaterialIcons', name: 'close' }} size={30} style={{ color: colors.textPrimary }} />
                                    </Pressable>
                                </View>
                                {cvPages.length > 0 ? (
                                    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
                                        {cvPages.map((page, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: page.uri }}
                                                style={{ width: responsiveWidth(100), height: (responsiveWidth(100) * page.height) / page.width, marginBottom: 10 }}
                                                resizeMode="contain"
                                            />
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text>No CV available</Text>
                                    </View>
                                )}
                            </SafeAreaView>
                        </Modal >
                        <Modal
                            visible={roleSheetVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setRoleSheetVisible(false)}
                        >
                            <View style={{
                                flex: 1,
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                justifyContent: 'flex-end',
                            }}>
                                <Pressable style={{ flex: 1 }} onPress={() => setRoleSheetVisible(false)} />
                                <View style={{
                                    backgroundColor: colors.background,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingHorizontal: responsiveWidth(5),
                                    paddingTop: responsiveHeight(1.5),
                                    paddingBottom: responsiveHeight(3),
                                    maxHeight: '85%',
                                }}>
                                    <View style={{ alignSelf: 'center', width: responsiveWidth(10), height: 4, borderRadius: 2, backgroundColor: colors.surfaces, marginBottom: responsiveHeight(2) }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2.8), fontWeight: '800' }}>
                                            {editingRoleId ? 'Edit role' : 'Add a role'}
                                        </Text>
                                        <Pressable onPress={() => setRoleSheetVisible(false)}>
                                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>Cancel</Text>
                                        </Pressable>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                            JOB TITLE
                                        </Text>
                                        <View style={{
                                            borderWidth: 1.5,
                                            borderColor: currentRole.jobTitle ? colors.primary : colors.surfaces,
                                            borderRadius: 12,
                                            paddingHorizontal: responsiveWidth(4),
                                            height: responsiveHeight(6.5),
                                            justifyContent: 'center',
                                            marginBottom: responsiveHeight(2),
                                        }}>
                                            <TextInput
                                                value={currentRole.jobTitle}
                                                onChangeText={(t) => setCurrentRole(prev => ({ ...prev, jobTitle: t }))}
                                                placeholder="e.g. Barista"
                                                placeholderTextColor={colors.placeholder}
                                                style={{ fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                            />
                                        </View>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                            BUSINESS NAME
                                        </Text>
                                        <View style={{
                                            borderWidth: 1.5,
                                            borderColor: currentRole.businessName ? colors.primary : colors.surfaces,
                                            borderRadius: 12,
                                            paddingHorizontal: responsiveWidth(4),
                                            height: responsiveHeight(6.5),
                                            justifyContent: 'center',
                                            marginBottom: responsiveHeight(2),
                                        }}>
                                            <TextInput
                                                value={currentRole.businessName}
                                                onChangeText={(t) => setCurrentRole(prev => ({ ...prev, businessName: t }))}
                                                placeholder="e.g. Small Batch Coffee"
                                                placeholderTextColor={colors.placeholder}
                                                style={{ fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                            />
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(0.8) }}>
                                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5 }}>
                                                DATES
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>
                                                Month and year
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: responsiveWidth(3), marginBottom: responsiveHeight(2) }}>
                                            <Pressable
                                                onPress={() => setStartDatePickerVisible(true)}
                                                style={{
                                                    flex: 1,
                                                    borderWidth: 1.5,
                                                    borderColor: colors.surfaces,
                                                    borderRadius: 12,
                                                    paddingHorizontal: responsiveWidth(4),
                                                    height: responsiveHeight(6.5),
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}>
                                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8) }}>{currentRole.startDate}</Text>
                                                <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={22} style={{ color: colors.textSecondary }} />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    if (!currentRole.stillHere) {
                                                        setEndDatePickerVisible(true);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    borderWidth: 1.5,
                                                    borderColor: colors.surfaces,
                                                    borderRadius: 12,
                                                    paddingHorizontal: responsiveWidth(4),
                                                    height: responsiveHeight(6.5),
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    opacity: currentRole.stillHere ? 0.5 : 1
                                                }}>
                                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8) }}>{currentRole.stillHere ? 'Still here' : currentRole.endDate}</Text>
                                                <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={22} style={{ color: colors.textSecondary }} />
                                            </Pressable>
                                        </View>
                                        {startDatePickerVisible && (
                                            <MonthPicker
                                                onChange={(event, newDate) => {
                                                    setStartDatePickerVisible(false);
                                                    if (event === 'dateSetAction' && newDate) {
                                                        setCurrentRole(prev => ({ ...prev, startDate: `${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}` }));
                                                    }
                                                }}
                                                value={parseDateString(currentRole.startDate)}
                                                minimumDate={new Date(1950, 0)}
                                                maximumDate={new Date()}
                                                locale="en"
                                            />
                                        )}
                                        {endDatePickerVisible && (
                                            <MonthPicker
                                                onChange={(event, newDate) => {
                                                    setEndDatePickerVisible(false);
                                                    if (event === 'dateSetAction' && newDate) {
                                                        setCurrentRole(prev => ({ ...prev, endDate: `${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}` }));
                                                    }
                                                }}
                                                value={parseDateString(currentRole.endDate)}
                                                minimumDate={parseDateString(currentRole.startDate)}
                                                maximumDate={new Date()}
                                                locale="en"
                                            />
                                        )}

                                        <Pressable
                                            onPress={() => setCurrentRole(prev => ({ ...prev, stillHere: !prev.stillHere, endDate: !prev.stillHere ? 'Still here' : '' }))}
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2.5), marginBottom: responsiveHeight(2.5) }}
                                        >
                                            <View style={{
                                                width: responsiveWidth(6),
                                                aspectRatio: 1,
                                                borderRadius: 6,
                                                backgroundColor: currentRole.stillHere ? colors.primary : 'transparent',
                                                borderWidth: currentRole.stillHere ? 0 : 1.5,
                                                borderColor: colors.surfaces,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                {currentRole.stillHere && (
                                                    <Icon icon={{ type: 'MaterialIcons', name: 'check' }} size={16} style={{ color: colors.white }} />
                                                )}
                                            </View>
                                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>I still work here</Text>
                                        </Pressable>

                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                            DESCRIPTION
                                        </Text>
                                        <View style={{
                                            borderWidth: 1.5,
                                            borderColor: colors.surfaces,
                                            borderRadius: 12,
                                            paddingHorizontal: responsiveWidth(4),
                                            paddingVertical: responsiveHeight(1),
                                            marginBottom: responsiveHeight(2),
                                            minHeight: responsiveHeight(12),
                                        }}>
                                            <TextInput
                                                multiline
                                                value={currentRole.description}
                                                onChangeText={(t) => setCurrentRole(prev => ({ ...prev, description: t }))}
                                                placeholder="Describe your role, responsibilities, achievements..."
                                                placeholderTextColor={colors.placeholder}
                                                style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary, textAlignVertical: 'top' }}
                                            />
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: responsiveWidth(2.5),
                                            backgroundColor: colors.lightBlue,
                                            borderRadius: 12,
                                            padding: responsiveWidth(4),
                                            marginBottom: responsiveHeight(3),
                                        }}>
                                            <Icon icon={{ type: 'MaterialIcons', name: 'info-outline' }} size={20} style={{ color: colors.primary }} />
                                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), flex: 1 }}>
                                                Employers only see the title, business and dates.
                                            </Text>
                                        </View>

                                        <Button
                                            label={loadingRole ? "Saving..." : "Save role"}
                                            backgroundColor={colors.primary}
                                            onPress={async () => {
                                                if (loadingRole) return;
                                                if (!currentRole.jobTitle.trim() || !currentRole.businessName.trim() || !currentRole.description.trim()) {
                                                    Alert.alert("Missing fields", "Please fill in job title, business name, and description.");
                                                    return;
                                                }
                                                setLoadingRole(true);
                                                const start = parseDateString(currentRole.startDate);
                                                const end = currentRole.stillHere ? new Date() : parseDateString(currentRole.endDate);
                                                try {
                                                    if (editingRoleId) {
                                                        const res = await dispatch(EditWorkExperience({
                                                            title: currentRole.jobTitle,
                                                            company: currentRole.businessName,
                                                            date_start: start.toISOString().slice(0, 19).replace('T', ' '),
                                                            date_end: currentRole.stillHere ? null : end.toISOString().slice(0, 19).replace('T', ' '),
                                                            is_currently_working: currentRole.stillHere ? 1 : 0,
                                                            description: currentRole.description,
                                                            id: editingRoleId
                                                        })).unwrap();
                                                        if (res.success) {
                                                            setRoles(prev => prev.map(r => r.id === editingRoleId ? { ...res.data } : r));
                                                            setRoleSheetVisible(false);
                                                        } else {
                                                            Alert.alert("Error", res?.message || "Failed to update role");
                                                        }
                                                    } else {
                                                        const res = await dispatch(AddWorkExperience({
                                                            title: currentRole.jobTitle,
                                                            company: currentRole.businessName,
                                                            date_start: start.toISOString().slice(0, 19).replace('T', ' '),
                                                            date_end: currentRole.stillHere ? null : end.toISOString().slice(0, 19).replace('T', ' '),
                                                            is_currently_working: currentRole.stillHere ? 1 : 0,
                                                            description: currentRole.description,
                                                        })).unwrap();
                                                        if (res.success) {
                                                            const newId = res.data.id
                                                            const newRole: RoleItem = { ...currentRole, id: newId };
                                                            setRoles(prev => [...prev, newRole]);
                                                            setRoleSheetVisible(false);
                                                        } else {
                                                            Alert.alert("Error", res?.message || "Failed to add role");
                                                        }
                                                    }
                                                } catch (e) {
                                                    Alert.alert("Error", "Network error. Please try again.");
                                                } finally {
                                                    setLoadingRole(false);
                                                }
                                            }}
                                        />

                                        {!editingRoleId && (
                                            <Pressable
                                                disabled={loadingRole}
                                                onPress={async () => {
                                                    if (loadingRole) return;
                                                    if (!currentRole.jobTitle.trim() || !currentRole.businessName.trim() || !currentRole.description.trim()) {
                                                        Alert.alert("Missing fields", "Please fill in job title, business name, and description.");
                                                        return;
                                                    }
                                                    setLoadingRole(true);
                                                    const start = parseDateString(currentRole.startDate);
                                                    const end = currentRole.stillHere ? new Date() : parseDateString(currentRole.endDate);
                                                    try {
                                                        const res = await dispatch(AddWorkExperience({
                                                            title: currentRole.jobTitle,
                                                            company: currentRole.businessName,
                                                            date_start: start.toISOString().slice(0, 19).replace('T', ' '),
                                                            date_end: currentRole.stillHere ? null : end.toISOString().slice(0, 19).replace('T', ' '),
                                                            is_currently_working: currentRole.stillHere ? 1 : 0,
                                                            description: currentRole.description,
                                                        })).unwrap();
                                                        if (res.success) {
                                                            const newId = res.data.id
                                                            const newRole: RoleItem = { ...currentRole, id: newId };
                                                            setRoles(prev => [...prev, newRole]);
                                                            setCurrentRole({
                                                                id: 0,
                                                                jobTitle: '',
                                                                businessName: '',
                                                                startDate: 'Jan 2023',
                                                                endDate: 'Still here',
                                                                stillHere: true,
                                                                description: '',
                                                            });
                                                        } else {
                                                            Alert.alert("Error", res?.message || "Failed to add role");
                                                        }
                                                    } catch (e) {
                                                        Alert.alert("Error", "Network error. Please try again.");
                                                    } finally {
                                                        setLoadingRole(false);
                                                    }
                                                }}
                                                style={{ marginTop: responsiveHeight(1.5), alignSelf: 'center' }}
                                            >
                                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>
                                                    Add another after this
                                                </Text>
                                            </Pressable>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    </>
                );

        }
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View
                    style={{
                        backgroundColor: colors.background,
                        paddingBottom: responsiveHeight(2),
                        flex: 1,
                        paddingVertical: responsiveHeight(1),
                        paddingHorizontal: responsiveWidth(5),
                    }}
                >
                    {renderElem()}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>

    )
}

export default ProfileCompelete