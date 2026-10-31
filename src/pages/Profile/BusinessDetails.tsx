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
import { GetCity, GetCountry, GetNumberOfEmployees, GetOwnership, GetState } from '../../reducer/jobsReducer';
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
    const [businessTypes, setBusinessTypes] = useState([]);
    const [establishedYears] = useState(
        Array.from({ length: 50 }, (_, i) => ({ id: (2024 - i).toString(), name: (2024 - i).toString() }))
    );
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState({
        trendingname: user?.name,
        abn: user?.abn_number,
        acn: user?.acn_number,
        businesstype: user?.ownership_type_id,
        no_of_employees: String(user?.no_of_employees),
        established: user?.established_in,
        country: user?.country,
        state: user?.state,
        city: user?.city,
        postcode: user?.postcode,
        businessaddress: user?.company_address,
        invoiceemail: user?.email,
    });

    useEffect(() => {
        dispatch(GetNumberOfEmployees()).unwrap().then(res => res?.success && res?.data && setStaffSizes(res.data))
        dispatch(GetCountry()).unwrap().then(res => res?.success && res?.data && setCountries(res.data))
        dispatch(GetOwnership()).unwrap().then(res => res?.success && res?.data && setBusinessTypes(res.data))
        if (user?.country) dispatch(GetState({ id: user?.country })).unwrap().then(res => res?.success && res?.data && setStates(res.data))
        if (user?.state) dispatch(GetCity({ id: user?.state })).unwrap().then(res => res?.success && res?.data && setCities(res.data))
    }, [dispatch, user]);

    const handleSave = () => {
        if (!formData.trendingname?.trim()) {
            showAlert({ title: 'Validation', message: 'Please enter your Trading Name.' });
            return;
        }

        setLoading(true);
        const data = {
            name: formData.trendingname,
            abn: formData.abn,
            acn: formData.acn,
            ownership_type_id: formData.businesstype,
            no_of_employees: formData.no_of_employees,
            established_in: formData.established,
            country_id: formData.country,
            state_id: formData.state,
            city_id: formData.city,
            postcode: formData.postcode,
            location: formData.businessaddress,
            email: formData.invoiceemail,
        }
        dispatch(UpdateRegistrationDetails(data))
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
                            onSelect={val => {
                                console.log(val, "valvalval")
                                setFormData({ ...formData, businesstype: val })
                            }}
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
                            data={staffSizes}
                            placeholder="Select staff size"
                            selectedValue={formData.no_of_employees}
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
                            onSelect={val => {
                                dispatch(GetState({ id: val })).unwrap().then(res => res?.success && res?.data && setStates(res.data))
                                setFormData({ ...formData, country: val })
                            }}
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
                            onSelect={val => {
                                dispatch(GetCity({ id: val })).unwrap().then(res => res?.success && res?.data && setCities(res.data))
                                setFormData({ ...formData, state: val })
                            }}
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
                            CITY
                        </Text>
                        <CustomDropdown
                            data={cities}
                            placeholder="Select City"
                            selectedValue={formData.city}
                            onSelect={val => {
                                setFormData(prev => ({ ...prev, city: val }))
                            }}
                            labelKey="name"
                            valueKey="id"
                            fontSize={responsiveFontSize(2)}
                            style={[styles.dropdownStyle, { borderColor: colors.surfaces }]}
                        />
                    </View>
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
