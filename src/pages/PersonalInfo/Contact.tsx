import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, KeyboardAvoidingView, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { responsiveScreenWidth, responsiveScreenHeight, responsiveScreenFontSize } from 'react-native-responsive-dimensions'; // assuming these are used for responsive sizing
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { useAppDispatch } from '../../store';
import { ContactT, GetContactDetails } from '../../reducer/jobsReducer';
import { useAlert } from '../../context/AlertContext';
import Icon from '../../utils/Icon';
import { CustomTextInput } from '../../components';

const Contact = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [contactDetails, setContactDetails] = useState<{ phone?: string; email?: string; adderess?: string } | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(true);
    const { showConfirm, showAlert } = useAlert();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(GetContactDetails())
            .unwrap()
            .then(res => {
                if (res.success) {
                    console.log(res)
                    setContactDetails((res as any).data);
                }
            })
            .catch(() => { })
            .finally(() => setDetailsLoading(false));
    }, []);

    const handleSubmit = async () => {
        const a = await showConfirm({
            title: "Submit Mail",
            message: "Are you sure you want to submit this mail?",
            okText: "Submit",
            cancelText: "Cancel",
            waitForOk: true,
            onOkPress: async () => {
                if (!fullName || !email || !phone || !subject || !message) {
                    showAlert({
                        title: "Error",
                        message: "Please fill all the fields",
                    });
                    return false;
                }
                const res = await dispatch(
                    ContactT({ full_name: fullName, email, phone, subject, message_txt: message })
                ).unwrap();
                if (!res.success) {
                    showAlert({
                        title: "Error",
                        message: res.message,
                    });
                    return false;
                }
                return true;
            },
        })
        if (a) {
            showAlert({
                title: "Success",
                message: "Mail sent successfully",
            });
            setFullName("");
            setEmail("");
            setPhone("");
            setSubject("");
            setMessage("");
        }

    };
    return (
        <NavigationBar statusbar={true} navigationBar={false}>
            <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
                <Header title="Contact Support" />
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={{ width: '100%', paddingHorizontal: responsiveScreenWidth(6), paddingVertical: responsiveScreenHeight(2), maxWidth: 400 }}>
                        <Text style={{ fontSize: responsiveScreenFontSize(3.5), fontWeight: 'bold', color: '#000' }}>Need Help?</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: '#555', marginTop: 8, maxWidth: '60%' }}>Our support team is here to assist you anytime.</Text>

                        <View style={{ marginTop: responsiveScreenHeight(3) }}>
                            {detailsLoading ? (
                                <ActivityIndicator size="small" color="#4880FF" style={{ marginVertical: responsiveScreenHeight(2) }} />
                            ) : (
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveScreenHeight(2) }}>
                                        <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#4880FF', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon icon={{ type: 'Feather', name: 'phone-call' }} size={24} style={{ color: 'white' }} />
                                        </View>
                                        <View style={{ marginLeft: 15 }}>
                                            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: 'bold', color: '#000' }}>Phone</Text>
                                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: '#333', marginTop: 4 }}>{contactDetails?.phone || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#eee', marginBottom: responsiveScreenHeight(2) }} />

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveScreenHeight(2) }}>
                                        <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#4880FF', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon icon={{ type: 'Feather', name: 'mail' }} size={24} style={{ color: 'white' }} />
                                        </View>
                                        <View style={{ marginLeft: 15 }}>
                                            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: 'bold', color: '#000' }}>Email Address</Text>
                                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: '#333', marginTop: 4 }}>{contactDetails?.email || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#eee', marginBottom: responsiveScreenHeight(2) }} />

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveScreenHeight(2) }}>
                                        <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#4880FF', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon icon={{ type: 'Feather', name: 'map-pin' }} size={24} style={{ color: 'white' }} />
                                        </View>
                                        <View style={{ marginLeft: 15, flex: 1 }}>
                                            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: 'bold', color: '#000' }}>Address</Text>
                                            <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: '#333', marginTop: 4, lineHeight: 22 }}>{contactDetails?.adderess || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#eee', marginBottom: responsiveScreenHeight(2) }} />
                                </>
                            )}
                        </View>

                        <Text style={{ fontSize: responsiveScreenFontSize(3.5), fontWeight: 'bold', color: '#000', marginTop: responsiveScreenHeight(1) }}>Send Us Email</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: '#555', marginTop: 8, marginBottom: responsiveScreenHeight(2) }}>Feel free to write</Text>
                    </View>
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Full Name</Text>
                        <CustomTextInput
                            style={{
                                width: '100%',
                                paddingHorizontal: responsiveScreenWidth(4),
                                paddingVertical: responsiveScreenHeight(1.5),
                                color: '#000000',
                                borderWidth: 1,
                                borderColor: '#BEBEBE',
                                borderRadius: 6,
                                fontSize: 14,
                            }}
                            placeholder="Enter Your Name"
                            placeholderTextColor="#888"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Email</Text>
                        <CustomTextInput
                            style={{
                                width: '100%',
                                paddingHorizontal: responsiveScreenWidth(4),
                                paddingVertical: responsiveScreenHeight(1.5),
                                color: '#000000',
                                borderWidth: 1,
                                borderColor: '#BEBEBE',
                                borderRadius: 6,
                                fontSize: 14,
                            }}
                            placeholder="Enter Your Email"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Phone</Text>
                        <CustomTextInput
                            style={{
                                width: '100%',
                                paddingHorizontal: responsiveScreenWidth(4),
                                paddingVertical: responsiveScreenHeight(1.5),
                                color: '#000000',
                                borderWidth: 1,
                                borderColor: '#BEBEBE',
                                borderRadius: 6,
                                fontSize: 14,
                            }}
                            placeholder="Enter Your Phone"
                            placeholderTextColor="#888"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Subject</Text>
                        <CustomTextInput
                            style={{
                                width: '100%',
                                paddingHorizontal: responsiveScreenWidth(4),
                                paddingVertical: responsiveScreenHeight(1.5),
                                color: '#000000',
                                borderWidth: 1,
                                borderColor: '#BEBEBE',
                                borderRadius: 6,
                                fontSize: 14,
                            }}
                            placeholder="Enter Your Subject"
                            placeholderTextColor="#888"
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Message</Text>
                        <View style={{ height: responsiveScreenHeight(20), borderWidth: 1, borderRadius: 6, borderColor: '#BEBEBE' }}>
                            <CustomTextInput
                                style={{
                                    width: '100%',
                                    paddingHorizontal: responsiveScreenWidth(4),
                                    paddingVertical: responsiveScreenHeight(1.5),
                                    color: '#000000',
                                    fontSize: 14,
                                }}
                                multiline={true}
                                placeholder="Enter Your Message"
                                placeholderTextColor="#888"
                                value={message}
                                onChangeText={setMessage}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={{}} onPress={handleSubmit}>
                        <Image source={require('./button.png')} style={{ marginHorizontal: 'auto', marginVertical: responsiveScreenHeight(2) }} />
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </NavigationBar>
    );
};

export default Contact;
