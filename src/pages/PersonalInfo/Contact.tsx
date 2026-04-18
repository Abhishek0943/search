import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, KeyboardAvoidingView, Button, TouchableOpacity } from 'react-native';
import { responsiveScreenWidth, responsiveScreenHeight, responsiveScreenFontSize } from 'react-native-responsive-dimensions'; // assuming these are used for responsive sizing
import { NavigationBar } from '../../components';
import { Header } from '../Company/Company';
import { useAppDispatch } from '../../store';
import { ContactT } from '../../reducer/jobsReducer';
import { useAlert } from '../../context/AlertContext';

const Contact = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const { showConfirm, showAlert } = useAlert();

    const handleSubmit = async () => {
        const a = await showConfirm({
            title: "Submit Mail",
            message: "Are you sure you want to submit this mail?",
            okText: "Report",
            cancelText: "Cancel",
            waitForOk: true,
            //             onOkPress: async () => {
            //                 try {

            //                 } catch (error) {
            //                     // Handle any errors during the dispatch
            //                     showAlert({
            //                         title: "Error",
            //                         message: "There was an issue sending the mail.",
            //                     });
            //                 }
            //                 return true;
            //             },
        })
        if (a) {
            const res = await dispatch(
                ContactT({ full_name: fullName, email, phone, subject, message_txt: message })
            ).unwrap();
            showAlert({
                title: res.success ? "Success" : "Error",
                message: res.success ? "Mail sent successfully" : res.message,
            });
        }

    };
    const dispatch = useAppDispatch()
    return (
        <NavigationBar statusbar={false} navigationBar={false}>
            <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Header title="Contact Support" />
                    <Image source={require('./c.png')} style={{ margin: 'auto', marginVertical: responsiveScreenHeight(2) }} />
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Full Name</Text>
                        <TextInput
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

                    {/* Email Input */}
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Email</Text>
                        <TextInput
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

                    {/* Phone Input */}
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Phone</Text>
                        <TextInput
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

                    {/* Subject Input */}
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Subject</Text>
                        <TextInput
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

                    {/* Message Input */}
                    <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: responsiveScreenWidth(6), marginTop: responsiveScreenHeight(1) }}>
                        <Text style={{ marginBottom: 8, fontSize: responsiveScreenFontSize(1.8), color: '#000000', fontWeight: '500' }}>Message</Text>
                        <View style={{ height: responsiveScreenHeight(20), borderWidth: 1, borderRadius: 6, borderColor: '#BEBEBE' }}>
                            <TextInput
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
