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
import { GetChats, GetChatsSeeker, GetFilter, ProfileData2 } from '../../reducer/jobsReducer'
import { useSocket } from '../../context/SocketProvider'
import { setMessageCount } from '../../reducer/userReducer'
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs'
import { setChatData, setActiveChat, updateChatMessage, clearUnreadCount } from '../../reducer/chatReducer'
const Chat = () => {
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const { user } = useAppSelector(state => state.userStore)
    const { data, active } = useAppSelector(state => state.chatStore)
    const dispatch = useAppDispatch()
    const [search, setSearch] = useState("")
    const { socket, isConnected } = useSocket();
    const [loading, setLoading] = useState(false)
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
    const element = <View style={{ flex: 1, }}>
        <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: 1, flexDirection: "row", marginBottom: responsiveScreenHeight(1), justifyContent: "space-between", paddingHorizontal: responsiveScreenWidth(5), paddingBottom: responsiveScreenHeight(1.5) }}>
            <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Chat</Text>
            {/* <View style={{ backgroundColor: "#F2F2F2", borderRadius: 10, padding: responsiveScreenWidth(1.5) }}>
                <Icon style={{ color: colors.darkGray }} size={responsiveScreenFontSize(2)} icon={{ type: "Ionicons", name: "search" }} />
            </View> */}
        </View>
        <View
            style={{
                borderRadius: 7,
                backgroundColor: colors.lightGrayNatural,
                gap: responsiveScreenWidth(1),
                marginHorizontal: responsiveScreenWidth(5),
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: responsiveScreenWidth(2),
                paddingVertical: responsiveScreenHeight(1.2),
            }}>
            <TouchableOpacity onPress={() => { }}>
                <Image style={{}} source={imagePath.search} />
            </TouchableOpacity>
            <CustomTextInput
                value={search}
                // onFocus={() => { setActiveSearch(true) }}
                onChangeText={e => setSearch(e)}
                placeholder="Search"
                placeholderTextColor={colors.textDisabled}
                hitSlop={30}
                style={{
                    flex: 1,
                    margin: 0,
                    padding: 0,
                    fontSize: responsiveScreenFontSize(1.8),
                }}
            />
        </View>
        {
            !user || !user?.id ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={imagePath.image1} />
                <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600", textAlign: "center", width: responsiveScreenWidth(80) }}>You’re not logged in. Please log in to access this feature</Text>
                <View style={{ marginHorizontal: responsiveScreenWidth(5), flexDirection: "row", gap: responsiveScreenHeight(2), marginTop: responsiveScreenHeight(2) }}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.SIGNUP)} style={{ flex: 1, justifyContent: "center", borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                        <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Register</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.LOGIN)} style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.2) }}>
                        <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View> : <View style={{ paddingVertical: responsiveScreenHeight(2), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, flex: 1, alignItems: "center" }}>
                {loading ? (
                    <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}><ActivityIndicator size={responsiveScreenFontSize(3)} /></View>
                ) : (
                    <FlatList
                        onEndReachedThreshold={0.5}
                        style={{ flex: 1, }} contentContainerStyle={{ gap: responsiveScreenHeight(1) }}
                        data={data.filter(e =>
                            e?.name.toLowerCase().includes(search.toLowerCase())
                        )}
                        ListEmptyComponent={() => <EmptyComp />}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={({ item, index }) => {
                            return (
                                <>
                                    <Pressable onPress={() => {
                                        dispatch(clearUnreadCount(item.id));
                                        dispatch(setMessageCount({ messages_count: user?.messages_count - item?.unread_count }))
                                        navigation.navigate(routes.MESSAGE, { ...item })
                                    }} style={{ marginHorizontal: "auto", backgroundColor: "white", elevation: 1, margin: 1, borderRadius: 16, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(1.5), width: responsiveScreenWidth(93), flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2.5) }}>
                                        <View style={{ width: responsiveScreenWidth(14), borderWidth: 2, borderColor: colors.primary, aspectRatio: 1, borderRadius: 200, overflow: "hidden" }}>
                                            <Image source={{ uri: item.logo }} style={{ height: "100%", width: "100%", resizeMode: "contain" }} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: responsiveScreenWidth(1) }}>
                                                <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(50), fontSize: responsiveScreenFontSize(2), color: "#262626", fontWeight: "700" }}>{item.name}</Text>
                                                <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.5), color: "#262626", fontWeight: "500" }}>{formatConversationTime(item.last_message_at)}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                {
                                                    item.last_message ? <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(65), fontSize: responsiveScreenFontSize(1.8), flex: 1, color: colors.darkGrayNatural, }}>{item.last_message}</Text> : item.attachment_type === "file" ? <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(65), fontSize: responsiveScreenFontSize(1.8), flex: 1, color: colors.darkGrayNatural, }}>Sent a Pdf</Text> : <Text numberOfLines={1} style={{ maxWidth: responsiveScreenWidth(65), fontSize: responsiveScreenFontSize(1.8), flex: 1, color: colors.darkGrayNatural, }}>Sent a Image</Text>
                                                }
                                                {
                                                    item?.unread_count > 0 ?
                                                        <Text numberOfLines={1} style={{ padding: 2, fontSize: responsiveScreenFontSize(1.3), height: responsiveScreenHeight(2), textAlign: "center", color: colors.white, aspectRatio: 1, borderRadius: 100, backgroundColor: colors.primary, }}>{item.unread_count}</Text> : item?.last_message_status === "viewed" ? <Image source={require("./sent2.png")} /> : <Image source={require("./sent3.png")} />
                                                }
                                            </View>
                                        </View>
                                        {/* <Text style={{ fontSize: responsiveScreenFontSize(1.8), color: "rgba(45, 45, 45, 0.9)", fontWeight: "600", alignItems: "center", justifyContent: "center" }}>{formatConversationTime(conversationById[item].last_message?.created_at)} */}
                                        {/* {" "} */}
                                        {/* </Text> */}
                                        {/* {
                                            conversationById[item].unread_count > 0 &&
                                            <Text style={{ backgroundColor: "blue", fontSize: responsiveScreenFontSize(3), aspectRatio: 1, borderRadius: 100, }}>·</Text>
                                        } */}

                                    </Pressable>
                                </>
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