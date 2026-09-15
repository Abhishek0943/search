import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../../context/ThemeProvider';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { ProfileData } from '../../reducer/jobsReducer';
import { NavigationBar } from '../../components';
import imagePath from '../../assets/imagePath';
import Text from '../../components/Text';

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
};

const getShortName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    return parts[0];
};

// --- Section Title ---
const SectionTitle = ({ title, right }: { title: string; right?: string }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(3), marginBottom: responsiveHeight(1) }}>
            <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
            {right && <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '600', color: colors.textSecondary }}>{right}</Text>}
        </View>
    );
};

// --- Verified Row ---
const VerifiedRow = ({ title, subtitle }: { title: string; subtitle: string }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F0FAF4', borderRadius: 12,
            paddingHorizontal: responsiveWidth(4), paddingVertical: responsiveHeight(1.5),
            marginBottom: responsiveHeight(1),
        }}>
            <View style={{
                width: responsiveWidth(6), height: responsiveWidth(6), borderRadius: responsiveWidth(3),
                backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center',
                marginRight: responsiveWidth(3),
            }}>
                <Text style={{ fontSize: responsiveFontSize(1.2), color: '#FFFFFF', fontWeight: '800' }}>✓</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
                <Text style={{ fontSize: responsiveFontSize(1.35), color: colors.textSecondary, marginTop: responsiveHeight(0.15) }}>{subtitle}</Text>
            </View>
        </View>
    );
};

// --- Skill Chip ---
const SkillChip = ({ label }: { label: string }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={{
            borderWidth: 1.2, borderColor: colors.gray, borderRadius: 20,
            paddingHorizontal: responsiveWidth(3.5), paddingVertical: responsiveHeight(0.65),
            marginRight: responsiveWidth(2), marginBottom: responsiveHeight(0.8),
        }}>
            <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
        </View>
    );
};

// --- Stat Column ---
const StatColumn = ({ value, label }: { value: string; label: string }) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '800', color: colors.textPrimary }}>{value}</Text>
            <Text style={{ fontSize: responsiveFontSize(1.35), color: colors.textSecondary, marginTop: responsiveHeight(0.2) }}>{label}</Text>
        </View>
    );
};

const ProfilePreview = () => {
    const { colors } = useContext(ThemeContext);
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const { user } = useAppSelector(state => state.userStore);
    const dispatch = useAppDispatch();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(ProfileData())
            .unwrap()
            .then((res) => {
                if (res.success) setProfile(res.data);
                else setProfile(user);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading || !profile) {
        return (
            <NavigationBar navigationBar={false}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={responsiveFontSize(3)} color={colors.primary} />
                </View>
            </NavigationBar>
        );
    }

    const initials = getInitials(profile.name || '');
    const shortName = getShortName(profile.name || '');

    return (
        <NavigationBar navigationBar={false}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(12) }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Arrow */}
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2, marginTop: responsiveHeight(1.5), marginBottom: responsiveHeight(1) }}
                    >
                        <Image style={{ height: '100%', width: '100%' }} source={imagePath.leftAngle} />
                    </Pressable>

                    {/* Profile Card */}
                    <View style={{
                        borderWidth: 1, borderColor: colors.gray, borderRadius: 16,
                        overflow: 'hidden', marginTop: responsiveHeight(1),
                    }}>
                        {/* Top: Avatar + Name */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: responsiveWidth(4), paddingVertical: responsiveHeight(2),
                        }}>
                            <View style={{
                                width: responsiveWidth(14), aspectRatio: 1, borderRadius: 18,
                                backgroundColor: colors.primary + '18',
                                justifyContent: 'center', alignItems: 'center',
                                marginRight: responsiveWidth(3.5), overflow: 'hidden',
                            }}>
                                {profile.image ? (
                                    <Image source={{ uri: profile.image }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
                                ) : (
                                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: colors.primary }}>{initials}</Text>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(2.6), fontWeight: '800', color: colors.textPrimary }}>{shortName}</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.textSecondary, marginTop: responsiveHeight(0.2) }}>
                                    {profile.location || profile.city || 'Brunswick, VIC · Australia'}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(0.5) }}>
                                    <View style={{
                                        width: responsiveWidth(4), height: responsiveWidth(4), borderRadius: responsiveWidth(2),
                                        backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginRight: responsiveWidth(1.5),
                                    }}>
                                        <Text style={{ fontSize: responsiveFontSize(0.9), color: '#FFFFFF', fontWeight: '800' }}>✓</Text>
                                    </View>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '700', color: '#2E7D32' }}>Verified</Text>
                                </View>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={{
                            flexDirection: 'row', borderTopWidth: 1, borderColor: colors.gray,
                            paddingVertical: responsiveHeight(1.2),
                        }}>
                            <StatColumn value={profile.experience_years || '3 yrs'} label="Bar work" />
                            <View style={{ width: 1, backgroundColor: colors.gray }} />
                            <StatColumn value="RSA" label="Verified" />
                            <View style={{ width: 1, backgroundColor: colors.gray }} />
                            <StatColumn value="Evenings" label="Available" />
                        </View>
                    </View>

                    {/* About */}
                    <SectionTitle title="About" />
                    <Text style={{ fontSize: responsiveFontSize(1.65), color: colors.textSecondary, lineHeight: responsiveFontSize(2.5) }}>
                        {profile.about || profile.bio || 'Reliable, on time, happy on a busy bar.'}
                    </Text>

                    {/* Documents */}
                    <SectionTitle title="Documents" />
                    {profile.education && profile.education.length > 0 ? (
                        profile.education.map((edu: any, i: number) => (
                            <VerifiedRow
                                key={i}
                                title={edu.degree || edu.title || 'Certification'}
                                subtitle={edu.institution || 'Confirmed'}
                            />
                        ))
                    ) : (
                        <>
                            <VerifiedRow title="Current SA RSA" subtitle="Valid to Mar 2028" />
                            <VerifiedRow title="Full Australian work rights" subtitle="Confirmed by VEVO" />
                        </>
                    )}

                    {/* Video intro */}
                    <SectionTitle title="Video intro" />
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: '#F0FAF4', borderRadius: 14,
                        paddingHorizontal: responsiveWidth(4), paddingVertical: responsiveHeight(1.5),
                    }}>
                        <View style={{
                            width: responsiveWidth(12), aspectRatio: 1, borderRadius: 14,
                            backgroundColor: '#DFF0E8', justifyContent: 'center', alignItems: 'center',
                            marginRight: responsiveWidth(3),
                        }}>
                            <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.textPrimary }}>▶</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.textPrimary }}>30 second intro</Text>
                            <Text style={{ fontSize: responsiveFontSize(1.35), color: colors.textSecondary, marginTop: responsiveHeight(0.15) }}>Recorded 12 Aug</Text>
                        </View>
                    </View>

                    {/* Portfolio */}
                    <SectionTitle title="Portfolio" right={`${profile.projects?.length || 4} photos`} />
                    <View style={{ flexDirection: 'row', gap: responsiveWidth(2) }}>
                        {(profile.projects && profile.projects.length > 0
                            ? profile.projects.slice(0, 4)
                            : [1, 2, 3, 4]
                        ).map((_: any, i: number) => (
                            <View key={i} style={{
                                flex: 1, aspectRatio: 1, borderRadius: 10,
                                backgroundColor: '#E8F5EE',
                            }} />
                        ))}
                    </View>

                    {/* Skills */}
                    <SectionTitle title="Skills" />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {profile.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill: any, i: number) => (
                                <SkillChip key={i} label={typeof skill === 'string' ? skill : skill.name || skill.title || 'Skill'} />
                            ))
                        ) : (
                            <>
                                <SkillChip label="Espresso" />
                                <SkillChip label="POS · Square" />
                                <SkillChip label="Table service" />
                                <SkillChip label="Cash handling" />
                                <SkillChip label="Open / close" />
                            </>
                        )}
                    </View>

                    {/* Experience */}
                    <SectionTitle title="Experience" />
                    {profile.experience && profile.experience.length > 0 ? (
                        profile.experience.map((exp: any, i: number) => (
                            <View key={i} style={{
                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                                paddingVertical: responsiveHeight(1),
                            }}>
                                <View>
                                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.textPrimary }}>
                                        {exp.title || exp.position} · {exp.company || exp.location}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: colors.textSecondary }}>
                                    {exp.start_date || exp.from} – {exp.end_date || exp.to || 'now'}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: responsiveHeight(1) }}>
                                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.textPrimary }}>Bartender · The Alley</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: colors.textSecondary }}>2023 – now</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: responsiveHeight(1) }}>
                                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.textPrimary }}>Floor staff · Nonna's</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: colors.textSecondary }}>2021 – 2023</Text>
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Bottom Bar: Preview mode */}
                <View style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: colors.textPrimary,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: responsiveWidth(5),
                    paddingVertical: responsiveHeight(2),
                    paddingBottom: responsiveHeight(4),
                }}>
                    <View>
                        <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '800', color: '#FFFFFF' }}>Preview mode</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#FFFFFFB0', marginTop: responsiveHeight(0.2) }}>This is what employers see.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            backgroundColor: '#FFFFFF', borderRadius: 10,
                            paddingHorizontal: responsiveWidth(6), paddingVertical: responsiveHeight(1),
                        }}
                    >
                        <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '800', color: colors.textPrimary }}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </NavigationBar>
    );
};

export default ProfilePreview;
