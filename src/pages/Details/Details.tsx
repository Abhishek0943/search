import { ParamListBase, useNavigation, } from '@react-navigation/native';
import { NativeStackNavigationProp, } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState, } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth, } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel, CustomTextInput } from '../../components';
import { useAppDispatch } from '../../store';
import Button from '../../components/Button';
import { Industries, GetNumberOfEmployees } from '../../reducer/jobsReducer';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchSelectDropdown from '../../components/SearchSelectDropdown';
import { useAlert } from '../../context/AlertContext';
import { UpdateRegistrationDetails } from '../../reducer/recruiterReducer';
import { routes } from '../../constants/values';
import imagePath from '../../assets/imagePath';

const Details = () => {
    const { colors } = useContext(ThemeContext);
    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ComponentSingUp
                        type={'comp'}
                        mainColor={colors.compPrimary}
                        secondaryColor={colors.compPrimary2}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>

        </>
    );
};

export default Details;

export const ComponentSingUp = ({
    mainColor,
    secondaryColor,
    type = 'jobSeeker',
}: {
    mainColor: string;
    secondaryColor: string;
    type: 'comp' | 'jobSeeker';
    emailText?: string;
}) => {
    type StaffOption = {
        id: string;
        name: string;
    };


    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { colors } = useContext(ThemeContext);
    const [industries, setIndustries] = useState([]);
    const [staffSizes, setStaffSizes] = useState<StaffOption[]>([]);

    const [user, setUser] = useState<{
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
    }>({
        no_of_employees: '',
        industry_id: '',
        acn: '',
        industryIds: [],
        aboutCompany: '',
        availabilityIds: [],
        abn: '',
        businessaddress: '',
        trendingname: '',
        mobile: '',
    });
    const handleInputChange = (data: { name: string; value: string }) => {
        setUser(prev => ({ ...prev, [data.name]: data.value }));
    };
    const updateRegistration = async (
        body: any,
        onSuccess: () => void
    ) => {
        try {
            const res = await dispatch(
                UpdateRegistrationDetails(body)
            ).unwrap();

            console.log(
                "Update Registration Details:",
                res
            );

            if (res.success) {
                onSuccess();
            } else {
                showAlert({
                    title: "Error",
                    message:
                        res.message ||
                        "Unable to update company details.",
                });
            }

        } catch (error: any) {
            console.log(
                "Update Registration Error:",
                error
            );

            showAlert({
                title: "Error",
                message:
                    error?.message ||
                    "Something went wrong.",
            });
        }
    };
    const [step, setStep] = useState(1)
    const dispatch = useAppDispatch()
    const { showAlert } = useAlert();
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
                                    Step 2 of 3
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
                            {[1, 2, 3].map(i => (
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
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    resizeMode: 'contain',
                                }}
                                source={require('./Devider2.png')}
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

                            {/* ABN */}
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

                            {/* ACN */}
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
                                    ACN
                                </Text>

                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.2),
                                        fontWeight: '400',
                                        lineHeight: responsiveFontSize(1.9),
                                        color: colors.textSecondary,
                                    }}
                                >
                                    (Optional)
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderRadius: 15,
                                    borderColor: colors.surfaces,
                                    borderStyle: 'dashed',
                                    height: responsiveHeight(6),
                                    paddingHorizontal: responsiveWidth(4),
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                <CustomTextInput
                                    style={{
                                        flex: 1,
                                        fontSize: responsiveFontSize(2),
                                        fontWeight: '400',
                                        color: colors.textPrimary,
                                        paddingVertical: 0,
                                    }}
                                    value={user.acn}

                                    onChangeText={(text: string) =>
                                        handleInputChange({
                                            name: 'acn',
                                            value: text,
                                        })
                                    }
                                    placeholder="ACN"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="number-pad"
                                />
                            </View>

                            {/* Trading Name */}
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

                            {/* Business Address */}
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

                            {/* Staff Size */}
                            <SearchSelectDropdown
                                label="Staff Size"
                                options={staffSizes}
                                placeholder="Search staff size..."
                                multiSelect={false}
                                selectedId={user.no_of_employees}
                                onSelect={(id: string) => {
                                    console.log('Selected staff ID:', id);

                                    setUser(prev => ({
                                        ...prev,
                                        no_of_employees: id,
                                    }));
                                }}
                            />

                        </ScrollView>

                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                        </Pressable>
                        <Button
                            label="Continue"
                            backgroundColor={mainColor}
                            onPress={() => {
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

                                const noOfEmployees = Number(user.no_of_employees);

                                if (Number.isNaN(noOfEmployees)) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Invalid staff size selected.",
                                    });
                                    return;
                                }

                               

                                updateRegistration(
                                    {
                                        abn: user.abn.trim(),
                                        acn: user.acn.trim() || undefined,
                                        name: user.trendingname.trim(),
                                        location: user.businessaddress.trim(),
                                        no_of_employees: noOfEmployees,
                                    },
                                    () => {
                                        setStep(2);
                                    },
                                );                            }}
                        />
                        <Text style={{ color: colors.textSecondary, borderWidth: 1, lineHeight: responsiveFontSize(2.6), fontSize: responsiveFontSize(1.9), fontWeight: '600', marginTop: responsiveHeight(1), textAlign: 'center' }}>Next Your venue</Text>
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
                                onPress={() => setStep(3)}
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
                                    Step 3 of 3
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
                            {[1, 2, 3].map(i => (
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
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    resizeMode: 'contain',
                                }}
                                source={require('./Devider2.png')}
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

                            <View
                                style={{
                                    width: responsiveWidth(90),
                                    marginTop: responsiveHeight(1),
                                    marginBottom: responsiveHeight(2),
                                }}
                            >
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
                            </View>


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
                                    About the company
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderRadius: 15,
                                    borderColor: colors.surfaces,
                                    borderStyle: 'dashed',
                                    height: responsiveHeight(6),
                                    paddingHorizontal: responsiveWidth(4),
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                <CustomTextInput
                                    style={{
                                        flex: 1,
                                        fontSize: responsiveFontSize(1.9),
                                        fontWeight: '400',
                                        color: colors.textPrimary,
                                        minHeight: responsiveHeight(25),
                                        lineHeight: responsiveFontSize(2.4),
                                        paddingVertical: responsiveHeight(1),
                                    }}
                                    value={user.aboutCompany}
                                    onChangeText={(text: string) => {
                                        if (text.length <= 300) {
                                            handleInputChange({
                                                name: 'aboutCompany',
                                                value: text,
                                            });
                                        }
                                    }}
                                    placeholder={`Two or three lines on who you are and what\nit is like to work here.`} placeholderTextColor={colors.placeholder}
                                    numberOfLines={2}
                                    multiline={true}
                                    maxLength={300}
                                />
                                <Text
                                    style={{
                                        position: 'absolute',
                                        right: responsiveWidth(3),
                                        bottom: responsiveHeight(0.7),
                                        color: colors.textSecondary,
                                        fontSize: responsiveFontSize(1.2),
                                        fontWeight: '400',
                                    }}
                                >
                                    {user.aboutCompany.length} / 300
                                </Text>
                            </View>

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
                                    Logo
                                </Text>

                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderRadius: 15,
                                    borderColor: colors.surfaces,
                                    borderStyle: 'dashed',
                                    height: responsiveHeight(6),
                                    paddingHorizontal: responsiveWidth(4),
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                <CustomTextInput
                                    style={{
                                        flex: 1,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '400',
                                        color: colors.textPrimary,
                                        minHeight: responsiveHeight(25),
                                        lineHeight: responsiveFontSize(2.4),
                                        paddingVertical: responsiveHeight(1),
                                    }}
                                    value={user.aboutCompany}
                                    onChangeText={(text: string) => {
                                        if (text.length <= 300) {
                                            handleInputChange({
                                                name: 'aboutCompany',
                                                value: text,
                                            });
                                        }
                                    }}
                                    placeholder="Square image works best — shows on every ad."
                                    placeholderTextColor={colors.placeholder}
                                    numberOfLines={2}
                                />
                            </View>

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

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderRadius: 15,
                                    borderColor: colors.surfaces,
                                    borderStyle: 'dashed',
                                    height: responsiveHeight(6),
                                    paddingHorizontal: responsiveWidth(4),
                                    marginBottom: responsiveHeight(1),
                                }}
                            >
                                <CustomTextInput
                                    style={{
                                        flex: 1,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '400',
                                        color: colors.textPrimary,
                                        minHeight: responsiveHeight(25),
                                        lineHeight: responsiveFontSize(2.4),
                                        paddingVertical: responsiveHeight(1),
                                    }}
                                    value={user.aboutCompany}
                                    onChangeText={(text: string) => {
                                        if (text.length <= 300) {
                                            handleInputChange({
                                                name: 'aboutCompany',
                                                value: text,
                                            });
                                        }
                                    }}
                                    placeholder="Up to 5. The floor, the team, a busy night."
                                    placeholderTextColor={colors.placeholder}
                                    numberOfLines={2}
                                />
                            </View>
                        </ScrollView>

                        <View style={{ flex: 1 }}>
                        </View>
                        <Pressable style={{ width: responsiveWidth(100), marginTop: responsiveHeight(2.5), aspectRatio: 350 / 1, position: "relative", right: responsiveWidth(5), }}>
                            <Image style={{ height: "100%", width: "100%", resizeMode: "contain" }} source={require("./Devider2.png")} />
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

                                const industryId =
                                    Number(user.industryIds[0]);

                                if (isNaN(industryId)) {
                                    showAlert({
                                        title: "Validation",
                                        message: "Invalid industry selected.",
                                    });
                                    return;
                                }

                                updateRegistration(
                                    {
                                        industry_id: industryId,

                                        description:
                                            user.aboutCompany.trim() ||
                                            undefined,
                                    },
                                    () => {

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
                                );
                            }}
                        />
                        <Text style={{ color: colors.compPrimary, borderWidth: 1, lineHeight: responsiveFontSize(3), fontSize: responsiveFontSize(2), fontWeight: '900', marginTop: responsiveHeight(1), textAlign: 'center' }}>Skip - finish this step</Text>
                    </>
                );
        }
    };

    useEffect(() => {
        dispatch(Industries())
            .unwrap()
            .then(res => {
                console.log('Industries API:', res);

                if (res?.success) {
                    const industryList = (res.data || []).map((item: any) => ({
                        id: String(item.id),
                        name: item.name,
                    }));

                    setIndustries(industryList);
                }
            })
            .catch(error => {
                console.log('Industries API Error:', error);
            });
    }, [dispatch]);

    useEffect(() => {
        dispatch(GetNumberOfEmployees())
            .unwrap()
            .then(res => {
                console.log(
                    '========== STAFF API RESPONSE ==========',
                    JSON.stringify(res, null, 2)
                );

                if (res?.success) {
                    const staffList = (res.data || []).map((item: any) => {
                        console.log('STAFF ITEM:', item);

                        return {
                            id: String(item.id),
                            name: item.name,
                        };
                    });

                    console.log(
                        '========== STAFF DROPDOWN OPTIONS ==========',
                        staffList
                    );

                    setStaffSizes(staffList);
                }
            })
            .catch(error => {
                console.log('Staff Sizes API Error:', error);
            });
    }, [dispatch]);

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
