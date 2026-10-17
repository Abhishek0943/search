import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NavigationBar from '../../recruiter/components/NavigationBar';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import { InPutWithLabel } from '../../components';
import Button from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { useAlert } from '../../context/AlertContext';
import { GetNumberOfEmployees } from '../../reducer/jobsReducer';
import { UpdateRegistrationDetails } from '../../reducer/recruiterReducer';
import { CustomDropdown } from '../PersonalInfo/PersonalInfo';

const BusinessDetails = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const { user } = useAppSelector(state => state.userStore);

    const [staffSizes, setStaffSizes] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock data for dropdowns
    const [businessTypes] = useState([{ id: 'Company - Pty Ltd', name: 'Company - Pty Ltd' }, { id: 'Sole Trader', name: 'Sole Trader' }]);
    const [establishedYears] = useState(
        Array.from({ length: 50 }, (_, i) => ({ id: (2024 - i).toString(), name: (2024 - i).toString() }))
    );
    const [countries] = useState([{ id: 'Australia', name: 'Australia' }]);
    const [states] = useState([{ id: 'South Australia', name: 'South Australia' }, { id: 'Victoria', name: 'Victoria' }]);

    const [formData, setFormData] = useState({
        legalbusinessname: user?.legalbusinessname || 'Roza Mexicano Pty Ltd',
        trendingname: user?.name,
        abn: user?.abn,
        acn: user?.acn,
        businesstype: user?.businesstype || 'Company - Pty Ltd',
        no_of_employees: String(user?.no_of_employees),
        established: user?.established || '2018',
        country: user?.country || 'Australia',
        state: user?.state || 'South Australia',
        city: user?.city || 'Norwood',
        postcode: user?.postcode || '5067',
        businessaddress: user?.businessaddress || '142 The Parade\nNorwood SA 5067',
        invoiceemail: user?.invoiceemail || 'accounts@rozamexicano.com.au',
    });

    useEffect(() => {
        dispatch(GetNumberOfEmployees())
            .unwrap()
            .then(res => {
                if (res?.success && res?.data) {
                    setStaffSizes(res.data);
                }
            })
            .catch(() => { });
    }, [dispatch]);

    const handleSave = () => {
        if (!formData.trendingname?.trim()) {
            showAlert({ title: 'Validation', message: 'Please enter your Trading Name.' });
            return;
        }

        setLoading(true);
        dispatch(UpdateRegistrationDetails(formData))
            .unwrap()
            .then(res => {
                setLoading(false);
                if (res?.success) {
                    showAlert({ title: 'Success', message: 'Business details updated successfully.' });
                    navigation.goBack();
                } else {
                    showAlert({ title: 'Error', message: res?.message || 'Failed to update details.' });
                }
            })
            .catch(err => {
                setLoading(false);
                showAlert({ title: 'Error', message: err?.message || 'Something went wrong.' });
            });
    };

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Business details
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Update your registered business name, ABN, and contact details.
                    </Text>

                    <InPutWithLabel
                        label="Trading Name"
                        inputContainerStyle={{
                            marginBottom: responsiveHeight(0.5),
                        }}
                        value={formData.trendingname}
                        onChangeText={text => setFormData(prev => ({ ...prev, trendingname: text }))}
                        placeholder="e.g. Acme Corp PTY LTD"
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />

                    <InPutWithLabel
                        label="ABN"
                        value={formData.abn}
                        inputContainerStyle={{
                            marginBottom: responsiveHeight(0.5),
                        }}
                        onChangeText={text => setFormData(prev => ({ ...prev, abn: text }))}
                        placeholder="e.g. 51 824 753 556"
                        keyboardType="numeric"
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />

                    <InPutWithLabel
                        label="ACN (Optional)"
                        value={formData.acn}
                        inputContainerStyle={{
                            marginBottom: responsiveHeight(0.5),
                        }}
                        onChangeText={text => setFormData(prev => ({ ...prev, acn: text }))}
                        placeholder="e.g. 004 085 616"
                        keyboardType="numeric"
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />

                    <View style={{ marginBottom: responsiveHeight(1.5) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            BUSINESS TYPE
                        </Text>
                        <CustomDropdown
                            data={businessTypes}
                            placeholder="Select business type"
                            selectedValue={formData.businesstype}
                            onSelect={val => setFormData(prev => ({ ...prev, businesstype: String(val) }))}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}
                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>

                    <View style={{ marginBottom: responsiveHeight(1.5) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            Number of Employees
                        </Text>
                        <CustomDropdown
                            data={staffSizes.map(item => ({ id: Number(item.id), name: item.name }))}
                            placeholder="Select staff size"
                            selectedValue={Number(formData.no_of_employees) || 0}
                            onSelect={val => setFormData(prev => ({ ...prev, no_of_employees: String(val) }))}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}

                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>

                    <View style={{ marginBottom: responsiveHeight(1.5) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            ESTABLISHED
                        </Text>
                        <CustomDropdown
                            data={establishedYears}
                            placeholder="Select year"
                            selectedValue={formData.established}
                            onSelect={val => setFormData(prev => ({ ...prev, established: String(val) }))}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}

                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>


                    <View style={{ marginBottom: responsiveHeight(1.5) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            COUNTRY
                        </Text>
                        <CustomDropdown
                            data={countries}
                            placeholder="Select country"
                            selectedValue={formData.country}
                            onSelect={val => setFormData(prev => ({ ...prev, country: String(val) }))}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}

                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>

                    <View style={{ marginBottom: responsiveHeight(1.5) }}>
                        <Text
                            style={{
                                color: colors.primary2,
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '700',
                            }}
                        >
                            STATE
                        </Text>
                        <CustomDropdown
                            data={states}
                            placeholder="Select state"
                            selectedValue={formData.state}
                            onSelect={val => setFormData(prev => ({ ...prev, state: String(val) }))}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}

                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>
                    <InPutWithLabel
                        label="CITY OR SUBURB"
                        value={formData.city}
                        onChangeText={text => setFormData(prev => ({ ...prev, city: text }))}
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />
                    <InPutWithLabel
                        label="POSTCODE"
                        value={formData.postcode}
                        onChangeText={text => setFormData(prev => ({ ...prev, postcode: text }))}
                        keyboardType="numeric"
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />

                    <InPutWithLabel
                        label="FULL STREET ADDRESS"
                        value={formData.businessaddress}
                        inputContainerStyle={{ marginBottom: responsiveHeight(1.5), }}
                        onChangeText={text => setFormData(prev => ({ ...prev, businessaddress: text }))}
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />
                    <InPutWithLabel
                        label="INVOICE EMAIL"
                        value={formData.invoiceemail}
                        inputContainerStyle={{ marginBottom: responsiveHeight(0.2) }}
                        onChangeText={text => setFormData(prev => ({ ...prev, invoiceemail: text }))}
                        keyboardType="email-address"
                        mainColor={colors.primary}
                        secondaryColor={colors.primary2}
                    />
                </ScrollView>
                <Button
                    label={loading ? 'Saving...' : 'Save changes'}
                    onPress={handleSave}
                    disabled={loading}
                    style={{ marginTop: responsiveHeight(1), alignSelf: "center", marginBottom: responsiveHeight(4) }}
                />
            </KeyboardAvoidingView>

        </NavigationBar >
    );
};

export default BusinessDetails;

const styles = StyleSheet.create({
    container: {
        width: responsiveWidth(90),
        alignSelf: 'center',
        paddingTop: responsiveHeight(2),
        paddingBottom: responsiveHeight(5),
    },
    headerTitle: {
        fontSize: responsiveFontSize(2.8),
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '500',
        marginTop: responsiveHeight(0.5),
        marginBottom: responsiveHeight(2),
    },


    helperText: {
        fontSize: responsiveFontSize(1.3),
        marginBottom: responsiveHeight(1.5),
        marginTop: responsiveHeight(0.2),
    },


    dropdownStyle: {
        borderRadius: 14,
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(1.6),
        borderWidth: 1.5,

    },

});
