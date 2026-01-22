import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Switch,
    ActivityIndicator,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
    responsiveScreenFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NavigationBar } from '../../components';
import imagePath from '../../assets/imagePath';
import { CustomDropdown, formatDate } from './PersonalInfo';
import { useAppDispatch } from '../../store';
import { GetCountry, GetState, GetCity, AddWorkExperience, UploadCV } from '../../reducer/jobsReducer';
import { pick, types, keepLocalCopy,  } from '@react-native-documents/picker';
// If you use react-native-date-picker
import DatePicker from 'react-native-date-picker';
import { Header } from '../Company/Company';
import { useAlert } from '../../context/AlertContext';

const EducationForm = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false)
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        cvTitle: '',
        isDefault: false,
        cvFile: null as null | {
            uri: string;
            name: string;
            type: string;
            size?: number;
        },
    });

    const handleChange = (key: string, value: any) => {
        setFormData(prev => {
            return { ...prev, [key]: value };
        });
    };





    const Label = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
            <Text style={{ color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
                {text}
            </Text>
            <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.8) }}> *</Text>
        </View>
    );
const normalizeFileUri = (u?: string) => {
  if (!u) return '';
  if (u.startsWith('/')) return `file://${u}`;
  return u;
};

const pickPdf = async () => {
  try {
    const [doc] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
      mode: 'import',
      copyTo: 'documentDirectory',   // ✅ important (not caches)
    });

    const uri = normalizeFileUri(doc.fileCopyUri || doc.uri);  // ✅ prefer fileCopyUri

    setFormData(prev => ({
      ...prev,
      cvFile: {
        uri,
        name: doc.name ?? 'cv.pdf',
        type: 'application/pdf',
        size: doc.size,
      },
    }));
  } catch (e) {
    console.log('pickPdf error:', e);
  }
};


const onSubmit = () => {
  if (!formData.cvTitle?.trim()) {
    showAlert({ title: "CV Title Required", message: "Please enter a title for your CV." });
    return;
  }

  if (!formData.cvFile?.uri) {
    showAlert({ title: "CV File Required", message: "Please select and upload your CV in PDF format." });
    return;
  }

  const uri = normalizeFileUri(formData.cvFile.uri);

  // Debug once on iOS to confirm it is file://...
  console.log('Uploading CV uri:', uri);

  const fd = new FormData();
  fd.append('title', formData.cvTitle.trim());
  fd.append('is_default', formData.isDefault ? '1' : '0');

  fd.append('cv_file', {
    uri,
    name: formData.cvFile.name || 'cv.pdf',
    type: 'application/pdf',
  } as any);

  setLoading(true);
  dispatch(UploadCV(fd))
    .unwrap()
    .then(res => {
      setLoading(false);
      if (res.success) navigation.goBack();
    })
    .catch(err => {
      setLoading(false);
      console.log('UploadCV error:', err);
    });
};

    const inputStyle = {
        borderWidth: 1,
        width: '100%',
        borderRadius: 6,
        borderColor: colors.mediumGray,
        color: colors.textPrimary,
        paddingHorizontal: responsiveScreenWidth(3),
        fontSize: responsiveScreenFontSize(1.8),
        paddingVertical: responsiveScreenHeight(1.3),
        marginTop: responsiveScreenHeight(1),
    } as const;

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
                <Header title="Add New CV" />

                <Label text="CV" />
                <TextInput
                    value={formData.cvTitle}
                    onChangeText={t => handleChange('cvTitle', t)}
                    style={inputStyle}
                    placeholderTextColor={colors.gray}
                    placeholder="Enter CV Title"
                />

                <Label text="Upload CV" />
                <Pressable
                    onPress={pickPdf}
                    style={{ width: '100%', aspectRatio: 2.44, marginTop: responsiveScreenHeight(1) }}
                >
                    <Image source={imagePath.imageInput} style={{ height: '100%', width: '100%' }} />
                </Pressable>

                {/* Optional: show selected pdf name below */}
                {formData.cvFile?.name ? (
                    <Text style={{ width: '100%', marginTop: responsiveScreenHeight(0.8), color: colors.textSecondary }}>
                        Selected: {formData.cvFile.name}
                    </Text>
                ) : null}
                <View
                    style={{
                        marginTop: responsiveScreenHeight(1.5),
                        width: '100%',
                        borderColor: colors.mediumGray,
                        borderRadius: 6,
                        paddingVertical: responsiveScreenHeight(1.3),
                    }}
                >
                    <Text
                        style={{
                            color: colors.textPrimary,
                            fontSize: responsiveScreenFontSize(1.8),
                            marginBottom: responsiveScreenHeight(1),
                        }}
                    >
                        Set as Default CV
                    </Text>

                    <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(6) }}>
                        {/* YES */}
                        <Pressable
                            onPress={() => handleChange('isDefault', true)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View
                                style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: 9,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8,
                                }}
                            >
                                {formData.isDefault && (
                                    <View
                                        style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                )}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>Yes</Text>
                        </Pressable>

                        {/* NO */}
                        <Pressable
                            onPress={() => handleChange('isDefault', false)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View
                                style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: 9,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8,
                                }}
                            >
                                {!formData.isDefault && (
                                    <View
                                        style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                )}
                            </View>
                            <Text style={{ color: colors.textPrimary }}>No</Text>
                        </Pressable>
                    </View>
                </View>
                <Pressable
                    onPress={onSubmit}
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: responsiveScreenHeight(2),
                        borderRadius: 6,
                        gap: responsiveScreenWidth(1),
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        paddingHorizontal: responsiveScreenWidth(3),
                        paddingVertical: responsiveScreenHeight(1.5),
                    }}
                >
                    {
                        loading ? <ActivityIndicator color={"white"} /> :
                            <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                                Save CV

                            </Text>
                    }
                </Pressable>


            </ScrollView>
        </NavigationBar>
    );
};

export default EducationForm;

const styles = StyleSheet.create({});

