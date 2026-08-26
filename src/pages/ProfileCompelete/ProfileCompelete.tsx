import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { Image, Pressable, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native'
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
import { GetAllAvailabilities, GetAllWorkRights, GetSkills, Industries } from '../../reducer/jobsReducer';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';

function ProfileCompelete(): ReactElement {
    const { colors } = useContext(ThemeContext);
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
        prompt1: string;
        prompt2: string;
    }>({
        name: '',
        address: '',
        availabilityIds: [],
        workRightsId: '',
        industryId: '',
        skillIds: [],
        prompt1: "",
        prompt2: "",

    });

    // ─── Step 4: Experience & Proof state ───
    interface RoleItem {
        id: string;
        jobTitle: string;
        businessName: string;
        suburb: string;
        startDate: string;
        endDate: string;
        stillHere: boolean;
    }
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [roleSheetVisible, setRoleSheetVisible] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleItem>({
        id: '',
        jobTitle: '',
        businessName: '',
        suburb: '',
        startDate: 'Jan 2023',
        endDate: 'Still here',
        stillHere: true,
    });
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [certifications, setCertifications] = useState<{ id: string; name: string; status: string }[]>([]);
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [resumeFileName, setResumeFileName] = useState('');
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
                            onPress={() => {
                                setStep(2)
                                // if (type === "jobSeeker") {
                                //     dispatch(UserRegister({ email: user.email, password: user.password, password_confirmation: user.confirmPassword, terms_of_use: true })).unwrap().then((res) => {
                                //         if (res.success) {
                                //             startTimer();
                                //             setStep(2)
                                //         } else {
                                //             showAlert({
                                //                 title: "Validation",
                                //                 message: res.message,
                                //             })
                                //         }
                                //     })

                                // } else {
                                //     dispatch(RecruiterRegister({ email: user.email, password: user.password, password_confirmation: user.confirmPassword, })).unwrap().then((res) => {
                                //         if (res.success) {
                                //             startTimer();
                                //             setStep(2)
                                //         } else {
                                //             showAlert({
                                //                 title: "Validation",
                                //                 message: res.message,
                                //             })
                                //         }
                                //     })

                                // }
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
                            onPress={() => {
                                setStep(3)
                                // const a = otp.join("")
                                // if (type === "jobSeeker") {
                                //     dispatch(UserVerification({ email: user.email, code: a }))
                                //         .unwrap()
                                //         .then(async (res) => {
                                //             if (res.success) {
                                //                 showAlert({
                                //                     title: "Success",
                                //                     message: "Your account registered successfully",
                                //                 });
                                //                 await AsyncStorage.setItem('token', res.data.token)
                                //                 dispatch(ProfileData()).unwrap().then((res) => {
                                //                     if (res.success) {
                                //                         if (res.data.login_step === 1) {
                                //                             navigation.reset({
                                //                                 index: 0,
                                //                                 routes: [{ name: routes.USERSTEPS }]
                                //                             });

                                //                         }
                                //                     }
                                //                 });
                                //             } else {
                                //                 showAlert({
                                //                     title: "Error",
                                //                     message: res.message,
                                //                 });
                                //             }
                                //         });
                                // } else {
                                //     dispatch(CompanyVerification({ email: user.email, code: a }))
                                //         .unwrap()
                                //         .then(async (res) => {
                                //             if (res.success) {
                                //                 showAlert({
                                //                     title: "Success",
                                //                     message: "Your account registered successfully",
                                //                 });
                                //                 await AsyncStorage.setItem('token', res.data.token)
                                //             } else {
                                //                 showAlert({
                                //                     title: "Error",
                                //                     message: res.message,
                                //                 });
                                //             }
                                //         });
                                // }
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
                                }}>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'person' }} size={responsiveWidth(8)} style={{ color: colors.textSecondary }} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Pressable style={{
                                        backgroundColor: colors.primary,
                                        borderRadius: 10,
                                        paddingVertical: responsiveHeight(1.5),
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        gap: responsiveWidth(2),
                                        marginBottom: responsiveHeight(0.8),
                                    }}>
                                        <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={18} style={{ color: colors.white }} />
                                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>Upload Profile Photo</Text>
                                    </Pressable>
                                    <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5) }}>Clear face, no sunglasses.</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(1) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        VIDEO INTRO
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
                            </View>

                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.surfaces,
                                padding: responsiveWidth(4),
                                marginBottom: responsiveHeight(2),
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: responsiveWidth(3), marginBottom: responsiveHeight(1.5) }}>
                                    <View style={{
                                        width: responsiveWidth(18),
                                        aspectRatio: 1,
                                        borderRadius: 10,
                                        backgroundColor: colors.textPrimary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
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
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.9), fontWeight: '600', marginBottom: responsiveHeight(0.3) }}>
                                            Say your name, where you have worked, when you can work.
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5) }}>
                                            30 seconds. Never scripted.
                                        </Text>
                                    </View>
                                </View>
                                <Pressable style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.primary,
                                    borderRadius: 10,
                                    paddingVertical: responsiveHeight(1.5),
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: responsiveWidth(2),
                                }}>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={18} style={{ color: colors.primary }} />
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>Upload a file</Text>
                                </Pressable>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(1) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        PROMPT 1 OF 2
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(1) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        PROMPT 2 OF 2
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
                            </View>
                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2), fontWeight: '800', marginBottom: responsiveHeight(1) }}>
                                What are you looking to learn?
                            </Text>
                            <View style={{
                                borderWidth: 1.5,
                                borderRadius: 12,
                                borderColor: colors.surfaces,
                                padding: responsiveWidth(4),
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
                                <Text style={{ alignSelf: 'flex-end', color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    {(user.prompt2 || '').length} / 200
                                </Text>
                            </View>

                            {/* Hint box */}
                            <View style={{
                                marginBottom: responsiveHeight(2),
                                width: responsiveWidth(90),
                                aspectRatio: 350 / 70
                            }}>
                                <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./InfoButton.png")} />
                            </View>
                        </ScrollView>

                        <View style={{ flex: 1 }} />

                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(2), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5) }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Continue"
                            backgroundColor={colors.primary}
                            onPress={() => { setStep(4) }}
                        />
                        <Pressable style={{ marginTop: responsiveHeight(1.5), alignSelf: 'center' }}>
                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>
                                Skip this step — finish it later
                            </Text>
                        </Pressable>
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
                            {/* ─── Description Text ─── */}
                            <Text style={{ color: colors.textSecondary, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1.5) }}>
                                A verified certificate moves you above people without one.
                            </Text>

                            {/* ═══════════════════════════════════════════════
                                CERTIFICATIONS
                            ═══════════════════════════════════════════════ */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(0.5) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        CERTIFICATIONS
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), marginBottom: responsiveHeight(1) }}>
                                Upload a photo of each card — RSA, White Card, anything.
                            </Text>

                            {/* Upload photo button */}
                            <Pressable style={{
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 12,
                                borderStyle: 'dashed',
                                paddingVertical: responsiveHeight(2),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(1.5),
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={20} style={{ color: colors.primary }} />
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>Upload a photo</Text>
                                </View>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    JPG or PNG · up to 5 MB each
                                </Text>
                            </Pressable>

                            {/* Certification cards */}
                            {certifications.map((cert) => (
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
                                    }}>
                                        <Icon icon={{ type: 'MaterialIcons', name: 'image' }} size={24} style={{ color: colors.textSecondary }} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>{cert.name}</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>{cert.status}</Text>
                                    </View>
                                    <Text style={{ color: colors.red, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Remove</Text>
                                </View>
                            ))}

                            {/* ═══════════════════════════════════════════════
                                WORK EXPERIENCE
                            ═══════════════════════════════════════════════ */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(0.5) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        WORK EXPERIENCE
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.5), marginBottom: responsiveHeight(1) }}>
                                One line per role. Two is plenty.
                            </Text>

                            {/* Role cards */}
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
                                            {role.businessName}{role.suburb ? `, ${role.suburb}` : ''}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>
                                            {role.startDate} — {role.stillHere ? 'now' : role.endDate}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => {
                                        setEditingRoleId(role.id);
                                        setCurrentRole({ ...role });
                                        setRoleSheetVisible(true);
                                    }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Edit</Text>
                                    </Pressable>
                                </View>
                            ))}

                            {/* + Add a role button */}
                            <Pressable
                                onPress={() => {
                                    setEditingRoleId(null);
                                    setCurrentRole({
                                        id: '',
                                        jobTitle: '',
                                        businessName: '',
                                        suburb: '',
                                        startDate: 'Jan 2023',
                                        endDate: 'Still here',
                                        stillHere: true,
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

                            {/* ═══════════════════════════════════════════════
                                PORTFOLIO LINK
                            ═══════════════════════════════════════════════ */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(0.5) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        PORTFOLIO LINK
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
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

                            {/* ═══════════════════════════════════════════════
                                RESUME
                            ═══════════════════════════════════════════════ */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(0.5) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '700', letterSpacing: 0.5 }}>
                                        RESUME
                                    </Text>
                                    <View style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, borderStyle: 'dashed', paddingHorizontal: responsiveWidth(1.5), paddingVertical: responsiveHeight(0.2) }}>
                                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.3), fontWeight: '700' }}>SKIPPABLE</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.6), fontWeight: '700' }}>Skip</Text>
                            </View>

                            <Pressable style={{
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 12,
                                borderStyle: 'dashed',
                                paddingVertical: responsiveHeight(2),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: responsiveHeight(0.5),
                                marginTop: responsiveHeight(1),
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveWidth(2) }}>
                                    <Icon icon={{ type: 'MaterialIcons', name: 'upload' }} size={20} style={{ color: colors.primary }} />
                                    <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.9), fontWeight: '700' }}>Choose a file</Text>
                                </View>
                                <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: responsiveHeight(0.5) }}>
                                    PDF or Word · up to 5 MB
                                </Text>
                            </Pressable>
                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4), marginBottom: responsiveHeight(3) }}>
                                Most shift jobs never ask for one. Your profile is enough.
                            </Text>
                        </ScrollView>

                        {/* ─── Bottom actions ─── */}
                        <Pressable style={{ width: responsiveWidth(100), marginBottom: responsiveHeight(1), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5) }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("../Auth/Devider2.png")} />
                        </Pressable>

                        <Button
                            label="Finish — show me jobs"
                            backgroundColor={colors.primary}
                            onPress={() => {
                                // Final submit
                            }}
                        />
                        <Pressable style={{ marginTop: responsiveHeight(1.5), marginBottom: responsiveHeight(1), alignSelf: 'center' }}>
                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>
                                Skip this step
                            </Text>
                        </Pressable>

                        {/* ═══════════════════════════════════════════════
                            ADD A ROLE BOTTOM SHEET MODAL
                        ═══════════════════════════════════════════════ */}
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
                                    {/* Handle bar */}
                                    <View style={{ alignSelf: 'center', width: responsiveWidth(10), height: 4, borderRadius: 2, backgroundColor: colors.surfaces, marginBottom: responsiveHeight(2) }} />

                                    {/* Sheet header */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(2.8), fontWeight: '800' }}>
                                            {editingRoleId ? 'Edit role' : 'Add a role'}
                                        </Text>
                                        <Pressable onPress={() => setRoleSheetVisible(false)}>
                                            <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: '700' }}>Cancel</Text>
                                        </Pressable>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                        {/* JOB TITLE */}
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
                                            marginBottom: responsiveHeight(1),
                                        }}>
                                            <TextInput
                                                value={currentRole.jobTitle}
                                                onChangeText={(t) => setCurrentRole(prev => ({ ...prev, jobTitle: t }))}
                                                placeholder="e.g. Barista"
                                                placeholderTextColor={colors.placeholder}
                                                style={{ fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                            />
                                        </View>

                                        {/* Suggestion chips */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveWidth(2), marginBottom: responsiveHeight(2) }}>
                                            {['Bartender', 'Floor staff', 'Kitchen hand'].map((tag) => (
                                                <Pressable
                                                    key={tag}
                                                    onPress={() => setCurrentRole(prev => ({ ...prev, jobTitle: tag }))}
                                                    style={{
                                                        borderWidth: 1.5,
                                                        borderColor: colors.surfaces,
                                                        borderRadius: 20,
                                                        paddingHorizontal: responsiveWidth(3.5),
                                                        paddingVertical: responsiveHeight(0.8),
                                                    }}
                                                >
                                                    <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.6), fontWeight: '500' }}>{tag}</Text>
                                                </Pressable>
                                            ))}
                                        </View>

                                        {/* BUSINESS NAME */}
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

                                        {/* SUBURB */}
                                        <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5, marginBottom: responsiveHeight(0.8) }}>
                                            SUBURB
                                        </Text>
                                        <Pressable style={{
                                            borderWidth: 1.5,
                                            borderColor: currentRole.suburb ? colors.primary : colors.surfaces,
                                            borderRadius: 12,
                                            paddingHorizontal: responsiveWidth(4),
                                            height: responsiveHeight(6.5),
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: responsiveHeight(2),
                                        }}>
                                            <TextInput
                                                value={currentRole.suburb}
                                                onChangeText={(t) => setCurrentRole(prev => ({ ...prev, suburb: t }))}
                                                placeholder="e.g. Brunswick, VIC"
                                                placeholderTextColor={colors.placeholder}
                                                style={{ flex: 1, fontSize: responsiveFontSize(1.9), color: colors.textPrimary }}
                                            />
                                            <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={24} style={{ color: colors.textSecondary }} />
                                        </Pressable>

                                        {/* DATES */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(0.8) }}>
                                            <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.5), fontWeight: '700', letterSpacing: 0.5 }}>
                                                DATES
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: responsiveFontSize(1.4) }}>
                                                Month and year
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: responsiveWidth(3), marginBottom: responsiveHeight(2) }}>
                                            <Pressable style={{
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
                                            <Pressable style={{
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
                                                <Text style={{ color: colors.textPrimary, fontSize: responsiveFontSize(1.8) }}>{currentRole.stillHere ? 'Still here' : currentRole.endDate}</Text>
                                                <Icon icon={{ type: 'MaterialIcons', name: 'keyboard-arrow-down' }} size={22} style={{ color: colors.textSecondary }} />
                                            </Pressable>
                                        </View>

                                        {/* I still work here checkbox */}
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

                                        {/* Info box */}
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

                                        {/* Save role button */}
                                        <Button
                                            label="Save role"
                                            backgroundColor={colors.primary}
                                            onPress={() => {
                                                if (!currentRole.jobTitle.trim()) return;
                                                if (editingRoleId) {
                                                    setRoles(prev => prev.map(r => r.id === editingRoleId ? { ...currentRole } : r));
                                                } else {
                                                    const newRole: RoleItem = { ...currentRole, id: Date.now().toString() };
                                                    setRoles(prev => [...prev, newRole]);
                                                }
                                                setRoleSheetVisible(false);
                                            }}
                                        />

                                        {/* Add another after this */}
                                        {!editingRoleId && (
                                            <Pressable
                                                onPress={() => {
                                                    if (!currentRole.jobTitle.trim()) return;
                                                    const newRole: RoleItem = { ...currentRole, id: Date.now().toString() };
                                                    setRoles(prev => [...prev, newRole]);
                                                    setCurrentRole({
                                                        id: '',
                                                        jobTitle: '',
                                                        businessName: '',
                                                        suburb: '',
                                                        startDate: 'Jan 2023',
                                                        endDate: 'Still here',
                                                        stillHere: true,
                                                    });
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