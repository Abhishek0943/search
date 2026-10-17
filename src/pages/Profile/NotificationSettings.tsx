import React, { useContext, useState } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import NavigationBar from '../../recruiter/components/NavigationBar';
import { ThemeContext } from '../../context/ThemeProvider';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { useAlert } from '../../context/AlertContext';

const NotificationSettings = () => {
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const { showAlert } = useAlert();

    const [settings, setSettings] = useState({
        newApplicationPush: true,
        newApplicationEmail: true,
        messageAlerts: true,
        weeklyDigest: false,
        marketingUpdates: false,
        billingReceipts: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        showAlert({ title: 'Saved', message: 'Notification preferences updated successfully.' });
        navigation.goBack();
    };

    return (
        <NavigationBar navigationBar={false}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Notification Settings
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Choose how and when you want to be notified about candidate applications & activity.
                </Text>

                <View style={[styles.card, { borderColor: colors.gray }]}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>CANDIDATE & APPLICATIONS</Text>

                    <View style={[styles.row, { borderBottomColor: colors.gray }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Push Notifications for New Applicants</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Receive instant push alerts when someone applies to your job.</Text>
                        </View>
                        <Switch
                            value={settings.newApplicationPush}
                            onValueChange={() => toggleSetting('newApplicationPush')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.newApplicationPush ? colors.primary : colors.gray}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomColor: colors.gray }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Email Alerts for New Applicants</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Get detailed candidate summaries sent to your registered email.</Text>
                        </View>
                        <Switch
                            value={settings.newApplicationEmail}
                            onValueChange={() => toggleSetting('newApplicationEmail')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.newApplicationEmail ? colors.primary : colors.gray}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Direct Messages</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Notifications when a candidate messages you.</Text>
                        </View>
                        <Switch
                            value={settings.messageAlerts}
                            onValueChange={() => toggleSetting('messageAlerts')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.messageAlerts ? colors.primary : colors.gray}
                        />
                    </View>
                </View>

                {/* Account & Billing section */}
                <View style={[styles.card, { borderColor: colors.gray }]}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>REPORTS & BILLING</Text>

                    <View style={[styles.row, { borderBottomColor: colors.gray }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Weekly Summary Digest</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>A weekly report on candidate views and application metrics.</Text>
                        </View>
                        <Switch
                            value={settings.weeklyDigest}
                            onValueChange={() => toggleSetting('weeklyDigest')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.weeklyDigest ? colors.primary : colors.gray}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomColor: colors.gray }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Billing & Invoices</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Email notifications for payments, invoices, and plan renewals.</Text>
                        </View>
                        <Switch
                            value={settings.billingReceipts}
                            onValueChange={() => toggleSetting('billingReceipts')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.billingReceipts ? colors.primary : colors.gray}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Product Updates & Tips</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Feature updates and hiring tips for recruiters.</Text>
                        </View>
                        <Switch
                            value={settings.marketingUpdates}
                            onValueChange={() => toggleSetting('marketingUpdates')}
                            trackColor={{ false: colors.gray, true: colors.primary + '80' }}
                            thumbColor={settings.marketingUpdates ? colors.primary : colors.gray}
                        />
                    </View>
                </View>

                <Button
                    label="Save Preferences"
                    onPress={handleSave}
                    style={{ marginTop: responsiveHeight(2), marginBottom: responsiveHeight(4) }}
                />
            </ScrollView>
        </NavigationBar >
    );
};

export default NotificationSettings;

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
        fontSize: responsiveFontSize(1.8),
        fontWeight: '500',
        marginTop: responsiveHeight(0.5),
        marginBottom: responsiveHeight(2.5),
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: responsiveWidth(4),
        marginBottom: responsiveHeight(2.5),
    },
    cardSectionTitle: {
        fontSize: responsiveFontSize(1.9),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: responsiveHeight(1.5),
        borderBottomWidth: 1,
    },
    rowTitle: {
        fontSize: responsiveFontSize(1.9),
        fontWeight: '700',
    },
    rowSubtitle: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '500',
        marginTop: 2,
    },
});
