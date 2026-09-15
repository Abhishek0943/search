import { CustomTextInput } from '../../components';
import { Image, TouchableOpacity, StyleSheet, Text, View, TextInput, FlatList, Pressable, ActivityIndicator, } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../../context/ThemeProvider'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { NavigationBar, } from '../../components'
import RNavigationBar from '../../recruiter/components/NavigationBar'
import { routes } from '../../constants/values'
import Icon from '../../utils/Icon'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions'
import imagePath from '../../assets/imagePath'
import { useAppDispatch, useAppSelector } from '../../store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GetChats, GetChatsSeeker, } from '../../reducer/jobsReducer'
import { useSocket } from '../../context/SocketProvider'
import { setMessageCount } from '../../reducer/userReducer'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'
import { setChatData, setActiveChat, updateChatMessage, clearUnreadCount } from '../../reducer/chatReducer'

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const Chat = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { user } = useAppSelector(state => state.userStore)
    const { data, active } = useAppSelector(state => state.chatStore)
    const dispatch = useAppDispatch()
    const [search, setSearch] = useState("")
    const { socket, isConnected } = useSocket();
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        if (!socket || !isConnected) return;

        let isMounted = true;
        let handler: any;

        (async () => {
            handler = (e: any) => {
                if (!isMounted) return;
                const num = Number(e?.from_id);
                if (!Number.isNaN(num)) {
                    dispatch(updateChatMessage({ companyId: num, lastMessage: e?.message?.message, active }));
                }
            };

            socket.off("message_received", handler);
            socket.on("message_received", handler);
        })();

        return () => {
            isMounted = false;
            if (handler) socket.off("message_received", handler);
        };
    }, [socket, isConnected, active]);

    useEffect(() => {
        const a = async () => {
            const role = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            setLoading(true)
            if (role === "recruiter") {
                dispatch(GetChats({})).unwrap().then((res) => {
                    if (res.success) {
                        dispatch(setChatData(res.data))
                    }
                }).finally(() => setLoading(false))
            } else {
                dispatch(GetChatsSeeker({})).unwrap().then((res) => {
                    if (res.success) {
                        dispatch(setChatData(res.data))
                    }
                }).finally(() => setLoading(false))
            }
        }
        a()
    }, [])

    useFocusEffect(() => {
        dispatch(setActiveChat(0))
    })

    const filteredData = data
        .filter(e => e?.name?.toLowerCase().includes(search.toLowerCase()))
        .filter(e => filter === 'all' ? true : (e?.unread_count > 0));

    const unreadTotal = data.reduce((sum, e) => sum + (e?.unread_count || 0), 0);

    const element = <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
            paddingHorizontal: responsiveScreenWidth(5),
            paddingBottom: responsiveScreenHeight(1),
        }}>
            <Text style={{
                fontSize: responsiveScreenFontSize(3.2),
                fontWeight: '800',
                color: colors.textPrimary,
                letterSpacing: -0.5,
            }}>Inbox</Text>
        </View>

        {/* Filter Tabs */}
        <View style={{
            flexDirection: 'row',
            paddingHorizontal: responsiveScreenWidth(5),
            gap: responsiveScreenWidth(2),
            marginBottom: responsiveScreenHeight(1.5),
        }}>
            <TouchableOpacity
                onPress={() => setFilter('all')}
                activeOpacity={0.7}
                style={{
                    backgroundColor: filter === 'all' ? colors.primary : colors.secondary,
                    paddingHorizontal: responsiveScreenWidth(4.5),
                    paddingVertical: responsiveScreenHeight(0.9),
                    borderRadius: 20,
                }}
            >
                <Text style={{
                    fontSize: responsiveScreenFontSize(1.6),
                    fontWeight: '700',
                    color: filter === 'all' ? '#FFFFFF' : colors.textSecondary,
                }}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setFilter('unread')}
                activeOpacity={0.7}
                style={{
                    backgroundColor: filter === 'unread' ? colors.primary : colors.secondary,
                    paddingHorizontal: responsiveScreenWidth(4.5),
                    paddingVertical: responsiveScreenHeight(0.9),
                    borderRadius: 20,
                }}
            >
                <Text style={{
                    fontSize: responsiveScreenFontSize(1.6),
                    fontWeight: '700',
                    color: filter === 'unread' ? '#FFFFFF' : colors.textSecondary,
                }}>Unread {unreadTotal > 0 ? unreadTotal : ''}</Text>
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
            style={{
                borderRadius: 12,
                backgroundColor: colors.secondary,
                gap: responsiveScreenWidth(2),
                marginHorizontal: responsiveScreenWidth(5),
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: responsiveScreenWidth(3.5),
                paddingVertical: responsiveScreenHeight(1.3),
                marginBottom: responsiveScreenHeight(1.5),
            }}>
            <TouchableOpacity onPress={() => { }}>
                <Image style={{ width: 18, height: 18, tintColor: colors.textSecondary, resizeMode: 'contain' }} source={imagePath.search} />
            </TouchableOpacity>
            <CustomTextInput
                value={search}
                onChangeText={e => setSearch(e)}
                placeholder="Search conversations"
                placeholderTextColor={colors.textSecondary}
                hitSlop={30}
                style={{
                    flex: 1,
                    margin: 0,
                    padding: 0,
                    fontSize: responsiveScreenFontSize(1.7),
                    fontWeight: '500',
                    color: colors.textPrimary,
                }}
            />
        </View>

        {/* Content */}
        {
            !user || !user?.id ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={imagePath.image1} />
                <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", textAlign: "center", width: responsiveScreenWidth(80) }}>You're not logged in. Please log in to access this feature</Text>
                <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(2) }}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                        <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Register</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                        <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View> : <View style={{ flex: 1, backgroundColor: colors.background }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={responsiveScreenFontSize(3)} color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        onEndReachedThreshold={0.5}
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: responsiveScreenWidth(4),
                            paddingBottom: responsiveScreenHeight(2),
                            gap: responsiveScreenHeight(1),
                        }}
                        data={filteredData}
                        ListEmptyComponent={() => <EmptyComp heading="No messages yet" text="Your conversations will appear here" />}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        ListFooterComponent={() => (
                            filteredData.length > 0 ? (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.secondary,
                                    borderRadius: 14,
                                    padding: responsiveScreenWidth(4),
                                    marginTop: responsiveScreenHeight(1),
                                    gap: responsiveScreenWidth(3),
                                }}>
                                    <View style={{
                                        width: responsiveScreenWidth(10),
                                        aspectRatio: 1,
                                        borderRadius: 100,
                                        backgroundColor: colors.lightBlue,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Icon
                                            icon={{ type: 'Ionicons', name: 'information-circle-outline' }}
                                            size={responsiveScreenFontSize(2.2)}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: responsiveScreenFontSize(1.6),
                                            fontWeight: '700',
                                            color: colors.textPrimary,
                                            marginBottom: 2,
                                        }}>Employers message you here</Text>
                                        <Text style={{
                                            fontSize: responsiveScreenFontSize(1.4),
                                            color: colors.textSecondary,
                                            fontWeight: '500',
                                        }}>You cannot start a chat until they reply first.</Text>
                                    </View>
                                </View>
                            ) : null
                        )}
                        renderItem={({ item, index }) => {
                            const hasUnread = item?.unread_count > 0;
                            return (
                                <Pressable
                                    onPress={() => {
                                        dispatch(clearUnreadCount(item.id));
                                        dispatch(setMessageCount({ messages_count: user?.messages_count - item?.unread_count }))
                                        navigation.navigate(routes.MESSAGE, { ...item })
                                    }}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        paddingHorizontal: responsiveScreenWidth(4),
                                        paddingVertical: responsiveScreenHeight(1.8),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: responsiveScreenWidth(3),
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.06,
                                        shadowRadius: 6,
                                        elevation: 2,
                                    }}
                                >
                                    {/* Avatar */}
                                    {item.logo ? (
                                        <View style={{
                                            width: responsiveScreenWidth(13),
                                            aspectRatio: 1,
                                            borderRadius: 100,
                                            borderWidth: 2,
                                            borderColor: colors.primary + '20',
                                            overflow: 'hidden',
                                            backgroundColor: colors.secondary,
                                        }}>
                                            <Image
                                                source={{ uri: item.logo }}
                                                style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{
                                            width: responsiveScreenWidth(13),
                                            aspectRatio: 1,
                                            borderRadius: 100,
                                            backgroundColor: colors.primary + '15',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                fontSize: responsiveScreenFontSize(1.8),
                                                fontWeight: '800',
                                                color: colors.primary,
                                            }}>{getInitials(item.name)}</Text>
                                        </View>
                                    )}

                                    {/* Content */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: 3,
                                        }}>
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    maxWidth: responsiveScreenWidth(48),
                                                    fontSize: responsiveScreenFontSize(1.85),
                                                    color: colors.textPrimary,
                                                    fontWeight: '700',
                                                }}
                                            >{item.name}</Text>
                                            <Text style={{
                                                fontSize: responsiveScreenFontSize(1.35),
                                                color: colors.textSecondary,
                                                fontWeight: '500',
                                            }}>{formatConversationTime(item.last_message_at)}</Text>
                                        </View>

                                        {/* Job role badge */}
                                        {item.job_title && (
                                            <View style={{
                                                alignSelf: 'flex-start',
                                                backgroundColor: colors.lightBlue,
                                                borderRadius: 8,
                                                paddingHorizontal: responsiveScreenWidth(2.5),
                                                paddingVertical: 3,
                                                marginBottom: 5,
                                            }}>
                                                <Text style={{
                                                    fontSize: responsiveScreenFontSize(1.3),
                                                    fontWeight: '700',
                                                    color: colors.primary,
                                                }}>{item.job_title}</Text>
                                            </View>
                                        )}

                                        {/* Last message + unread indicator */}
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            {
                                                item.last_message
                                                    ? <Text
                                                        numberOfLines={1}
                                                        style={{
                                                            flex: 1,
                                                            fontSize: responsiveScreenFontSize(1.55),
                                                            color: hasUnread ? colors.textPrimary : colors.textSecondary,
                                                            fontWeight: hasUnread ? '600' : '500',
                                                        }}
                                                    >{item.last_message}</Text>
                                                    : item.attachment_type === "file"
                                                        ? <Text
                                                            numberOfLines={1}
                                                            style={{
                                                                flex: 1,
                                                                fontSize: responsiveScreenFontSize(1.55),
                                                                color: colors.textSecondary,
                                                                fontWeight: '500',
                                                            }}
                                                        >Sent a PDF</Text>
                                                        : <Text
                                                            numberOfLines={1}
                                                            style={{
                                                                flex: 1,
                                                                fontSize: responsiveScreenFontSize(1.55),
                                                                color: colors.textSecondary,
                                                                fontWeight: '500',
                                                            }}
                                                        >Sent an Image</Text>
                                            }
                                            {hasUnread ? (
                                                <View style={{
                                                    width: responsiveScreenWidth(2.8),
                                                    aspectRatio: 1,
                                                    borderRadius: 100,
                                                    backgroundColor: '#EAA31E',
                                                    marginLeft: responsiveScreenWidth(2),
                                                }} />
                                            ) : (
                                                item?.last_message_status === "viewed"
                                                    ? <Image source={require("./sent2.png")} style={{ marginLeft: responsiveScreenWidth(2) }} />
                                                    : <Image source={require("./sent3.png")} style={{ marginLeft: responsiveScreenWidth(2) }} />
                                            )}
                                        </View>
                                    </View>
                                </Pressable>
                            )
                        }} />
                )}
            </View>
        }
    </View>

    const [role, setRole] = useState<"seeker" | "recruiter">()
    useEffect(() => {
        const set = async () => {
            const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            setRole(a)
        }
        set()
    }, [])

    return (
        <>
            {
                role === "recruiter" ?
                    <RNavigationBar name={routes.CHAT}>
                        {element}
                    </RNavigationBar>
                    :
                    <NavigationBar name={routes.CHAT}>
                        {element}
                    </NavigationBar>
            }

        </>
    );
}

export default Chat

const styles = StyleSheet.create({})



export function formatConversationTime(input: string | number | Date, timeZone?: Tz): string {
    if (!input) return ""
    const d = new Date(input);
    const now = new Date();

    // 1) "ago" math is absolute; timezone doesn't matter here.
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;

    // 2) Day-bucket checks must use the target timezone.
    const dayKey = (dt: Date) => {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(dt);
        // build YYYY-MM-DD
        const y = parts.find(p => p.type === 'year')!.value;
        const m = parts.find(p => p.type === 'month')!.value;
        const dd = parts.find(p => p.type === 'day')!.value;
        return `${y}-${m}-${dd}`;
    };

    const dKey = dayKey(d);
    const nowKey = dayKey(now);

    // yesterday key in target TZ
    const yesterdayKey = (() => {
        // get midnight "today" in target TZ via parts, then subtract 1 day
        const midnightStr = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(now); // "DD/MM/YYYY, HH:MM:SS" in TZ
        // We just need a Date for 'now'—we'll subtract 24h in ms (timezone safe for key compare)
        const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return dayKey(yest);
    })();

    if (dKey === nowKey) return formatTime12h(d, timeZone);
    if (dKey === yesterdayKey) return 'Yesterday';

    return formatDDMMYY(d, timeZone);
}
type Tz = string | undefined;
function formatTime12h(d: Date, timeZone?: Tz): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric', minute: '2-digit', hour12: true,
    }).formatToParts(d);
    const hour = parts.find(p => p.type === 'hour')!.value;
    const minute = parts.find(p => p.type === 'minute')!.value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod')!.value.toUpperCase(); // AM/PM
    // Ensure 2-digit minutes (some locales already do; this keeps it tidy)
    const mm = minute.padStart(2, '0');
    return `${hour}:${mm} ${dayPeriod}`;
}

function formatDDMMYY(d: Date, timeZone?: Tz): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: '2-digit', month: '2-digit', day: '2-digit',
    }).formatToParts(d);
    const dd = parts.find(p => p.type === 'day')!.value;
    const mm = parts.find(p => p.type === 'month')!.value;
    const yy = parts.find(p => p.type === 'year')!.value;
    return `${dd}/${mm}/${yy}`;
}