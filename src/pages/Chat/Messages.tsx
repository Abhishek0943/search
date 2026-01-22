import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { GetChats, GetMessage, GetMessageSeeker, ProfileData2, UploadCV, UploadDocument } from '../../reducer/jobsReducer'
import NavigationBar from '../../recruiter/components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import imagePath from '../../assets/imagePath'
import Text from '../../components/Text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSocket } from '../../context/SocketProvider'
import { SendMessage, SendMessageSeeker } from '../../reducer/recruiterReducer'
import { pick } from '@react-native-documents/picker'
import Icon from '../../utils/Icon'
import { setMessageCount } from '../../reducer/userReducer'

const Messages = () => {
    const route = useRoute()
    const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
    const dataa = route?.params
    const [meta, setMeta] = useState({})
    const [pages, setPages] = useState(1)
    const dispatch = useAppDispatch()
    const [item, setItem] = useState({})
    const [comment, setComment] = useState("")
    const [data, setData] = useState([])
    const [role, setRole] = useState<"seeker" | "recruiter" | "">()
    const { socket, isConnected } = useSocket();
    const onLoadMore = React.useCallback(() => {
        if (!meta?.last_page) return;
        if (meta?.current_page >= meta.last_page) return;
        setPages((p) => p + 1);
    }, [meta?.last_page, meta?.current_page]);
    useEffect(() => {
        if (!socket || !isConnected) return;

        // join room
        // socket.emit("chat:join", { conversationId });

        // receive new message
        // const onNewMessage = (data: Message) => {
        //   setMessages(prev => [data, ...prev]);
        // };

        socket.on("message_delivered", (e) => {
        });

        // optional: load history


        return () => {
            // socket.off("chat:new_message", onNewMessage);
            socket.emit("chat:leave");
        };
    }, [socket, isConnected]);
    useEffect(() => {
        const login = async () => {
            const role = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            setRole(role)
        }
        login()
    }, [])
    useEffect(() => {
        const a = async () => {
            if (!dataa?.id) return
            if (role === "recruiter") {
                dispatch(GetMessage({ id: dataa.id, pages })).unwrap().then((res) => {
                    if (!res.success) return;
                    const incomingGroups = res.data.groups;
                    setData((prev) => {
                        if (pages === 1) return incomingGroups;
                        return mergeGroupedMessages(prev, incomingGroups);
                    });
                    setMeta(res.data.pagination);
                })
                setItem(dataa)
            } else {
                dispatch(GetMessageSeeker({ id: dataa.id, pages })).unwrap().then((res) => {
                    if (res.success) {
                        setData(res.data.groups)
                        setMeta(res.data.pagination)

                    }
                })
                setItem(dataa)
            }
        }
        a()
    }, [dataa, role, pages])
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handler = (e: any) => {
            const msg = e?.message;
            if (!msg?.id) return;

            setData((prev) => {
                const incomingLabel = "Today"; // or "Today" if you really want
                const list = Array.isArray(prev) ? prev : [];
                if (list.length === 0) {
                    return [{ label: incomingLabel, messages: [msg] }];
                }
                const lastIndex = list.length - 1;
                const lastGroup = list[lastIndex];
                const alreadyExists = lastGroup?.messages.find((m: any) => m.id === msg.id)
                if (alreadyExists) return prev;
                if (lastGroup?.label === incomingLabel) {
                    const updatedLastGroup = {
                        ...lastGroup,
                        messages: [...(lastGroup.messages || []), msg],
                    };
                    return [...list.slice(0, lastIndex), updatedLastGroup];
                }
                return [...list, { label: incomingLabel, messages: [msg] }];
            });
        };
        socket.on("message_received", handler);
        return () => {
            socket.off("message_received", handler);
        };
    }, [socket, isConnected, item.id]);
    const [document, setDocument] = useState({})

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0} // adjust if needed
            >
                <View style={{ paddingHorizontal: responsiveScreenWidth(5), flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(3), paddingBottom: responsiveScreenHeight(1) }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={imagePath.backIcon} style={{ resizeMode: 'contain', transform: [{ scale: 1.1 }] }} />
                    </TouchableOpacity>
                    <View style={{ width: responsiveScreenWidth(14), borderWidth: 2, borderColor: colors.primary, aspectRatio: 1, borderRadius: 200, overflow: "hidden" }}>
                        <Image source={{ uri: item.logo }} style={{ height: "100%", width: "100%" }} />
                    </View>
                    <View>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: "rgba(11, 11, 11, 0.9)", fontWeight: "600" }}>{dataa.name}</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(2), color: colors.darkGrayNatural, fontWeight: "600" }}>online</Text>
                    </View>

                </View>

                <View style={{ flex: 1, borderTopWidth: .5, paddingHorizontal: responsiveScreenWidth(5) }}>
                    <FlatList
                    style={{paddingVertical:responsiveScreenHeight(2)}}
                        onEndReachedThreshold={0.3}    
                        onEndReached={onLoadMore}       
                        scrollEventThrottle={16}
                        removeClippedSubviews={false}
                        inverted showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: responsiveScreenHeight(1) }} data={[...data].reverse()} renderItem={({ item }) => {
                            return (
                                <>
                                    {
                                        item.messages && [...item.messages].reverse().map((e) => {
                                            if (role === "recruiter") {
                                                return (
                                                    <>
                                                        {e.message && <Text style={{ backgroundColor: e.type === "reply" ? colors.primary : colors.lightGray, maxWidth: responsiveScreenWidth(70), alignSelf: e.type === "reply" ? "flex-end" : "flex-start", color: e.type === "reply" ? colors.white : colors.darkGray, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(1.3), borderTopRightRadius: e.type === "reply" ? 0 : 20, borderTopLeftRadius: e.type === "reply" ? 20 : 0, borderRadius: 20, fontSize: responsiveScreenFontSize(1.8), }}>{e.message}</Text>}
                                                        {
                                                            e.attachment_type === "file" &&
                                                            <View style={{ alignSelf: e.type === "reply" ? "flex-end" : "flex-start", borderRadius: 16, marginVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.lightGrayNatural, maxWidth: responsiveScreenWidth(70) }}>
                                                                <Icon icon={{ type: "Ionicons", name: "document-outline" }} /> <Text>{e.name}</Text>
                                                            </View>
                                                        }
                                                        {
                                                            e.attachment_type === "image" &&
                                                            <View style={{ overflow: "hidden", alignSelf: e.type === "reply" ? "flex-end" : "flex-start", borderRadius: 16, marginVertical: responsiveScreenHeight(.5), }}>
                                                                <Image source={{ uri: e.url }} style={{ height: responsiveScreenWidth(50), aspectRatio: 1 }} />
                                                            </View>
                                                        }
                                                        <Text style={{ marginTop: responsiveScreenHeight(1), alignSelf: e.type === "reply" ? "flex-end" : "flex-start", color: colors.darkGrayNatural, fontSize: responsiveScreenFontSize(1.5), }}>{new Date(e.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "numeric" })}</Text>
                                                    </>
                                                )
                                            }
                                            return (
                                                <>

                                                    {e.message && <Text style={{ backgroundColor: e.type !== "reply" ? colors.primary : colors.lightGray, maxWidth: responsiveScreenWidth(70), alignSelf: e.type !== "reply" ? "flex-end" : "flex-start", color: e.type !== "reply" ? colors.white : colors.darkGray, paddingHorizontal: responsiveScreenWidth(4), paddingVertical: responsiveScreenHeight(1.3), borderTopRightRadius: e.type !== "reply" ? 0 : 20, borderTopLeftRadius: e.type !== "reply" ? 20 : 0, borderRadius: 20, fontSize: responsiveScreenFontSize(1.8), }}>{e.message}</Text>}
                                                    {
                                                        e.attachment_type === "file" &&
                                                        <View style={{ alignSelf: e.type !== "reply" ? "flex-end" : "flex-start", borderRadius: 16, marginVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.lightGrayNatural, maxWidth: responsiveScreenWidth(70) }}>
                                                            <Icon icon={{ type: "Ionicons", name: "document-outline" }} /> <Text>{e.name}</Text>
                                                        </View>
                                                    }
                                                    {
                                                        e.attachment_type === "image" &&
                                                        <View style={{ overflow: "hidden", alignSelf: e.type !== "reply" ? "flex-end" : "flex-start", borderRadius: 16, marginVertical: responsiveScreenHeight(.5), }}>
                                                            <Image source={{ uri: e.url }} style={{ height: responsiveScreenWidth(50), aspectRatio: 1 }} />
                                                        </View>
                                                    }
                                                    <Text style={{ marginTop: responsiveScreenHeight(1), alignSelf: e.type !== "reply" ? "flex-end" : "flex-start", color: colors.darkGrayNatural, fontSize: responsiveScreenFontSize(1.5), }}>{new Date(e.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "numeric" })}</Text>
                                                </>
                                            )
                                        })
                                    }
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(2) }}>
                                        <View style={{ height: 1, flex: 1, backgroundColor: colors.darkGrayNatural }}></View>
                                        <Text style={{ fontSize: responsiveScreenFontSize(1.6), color: colors.darkGrayNatural }}>{item.label}</Text>
                                        <View style={{ height: 1, flex: 1, backgroundColor: colors.darkGrayNatural }}></View>
                                    </View>
                                </>
                            )
                        }} />
                </View>
                <View style={{
                    flexDirection: "row", marginBottom: responsiveScreenHeight(2),
                    marginHorizontal: responsiveScreenWidth(5),
                    gap: responsiveScreenWidth(2)
                }}>

                    <View
                        style={{
                            flex: 1,

                            backgroundColor: colors.lightGrayNatural,
                            gap: responsiveScreenWidth(2),
                            borderRadius: 23,
                            overflow: "hidden"
                        }}>
                        {
                            document?.cvFile?.name && <Text onPress={() => setDocument({})} style={{ marginLeft: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(1.4), fontSize: responsiveScreenFontSize(1.8) }}>{document?.cvFile?.name}</Text>
                        }
                        <View style={{ flexDirection: "row" }}>
                            <TextInput
                                placeholder="Type something"
                                placeholderTextColor="#555"
                                value={comment}
                                // onSubmitEditing={sendMessage}
                                onChangeText={e => setComment(e)}
                                style={{
                                    flex: 1,
                                    fontSize: responsiveScreenFontSize(1.8),
                                    paddingVertical: responsiveScreenHeight(1.8),
                                    fontWeight: "500",
                                    padding: 0,
                                    marginLeft: responsiveScreenWidth(5),
                                }}
                            />
                            {
                                (comment || document?.attachment) &&
                                <>

                                    <Pressable onPress={() => {
                                        const a = comment
                                        setComment("")
                                        const { cvFile, ...b } = document
                                        if (role === "seeker") {
                                            dispatch(SendMessageSeeker({ company_id: dataa.id, message: a, ...b })).unwrap().then((res) => {
                                                if (res.success) {
                                                    setDocument({})
                                                    const msg = res?.data
                                                    setData((prev) => {
                                                        const incomingLabel = "Today"; // or "Today" if you really want
                                                        const list = Array.isArray(prev) ? prev : [];
                                                        if (list.length === 0) {
                                                            return [{ label: incomingLabel, messages: [msg] }];
                                                        }
                                                        const lastIndex = list.length - 1;
                                                        const lastGroup = list[lastIndex];
                                                        const alreadyExists = lastGroup?.messages.find((m: any) => m.id === msg.id)
                                                        if (alreadyExists) return prev;
                                                        if (lastGroup?.label === incomingLabel) {
                                                            const updatedLastGroup = {
                                                                ...lastGroup,
                                                                messages: [...(lastGroup.messages || []), msg],
                                                            };
                                                            return [...list.slice(0, lastIndex), updatedLastGroup];
                                                        }
                                                        return [...list, { label: incomingLabel, messages: [msg] }];
                                                    });
                                                }
                                                socket?.emit("message_delivered", { to_role: "company", to_id: dataa.id, message: res.data }, (res: any) => {
                                                });
                                            })
                                        }
                                        else {
                                            dispatch(SendMessage({ seeker_id: dataa.id, message: a, ...b })).unwrap().then((res) => {
                                                if (res.success) {
                                                    const msg = res?.data
                                                    setDocument({})

                                                    setData((prev) => {
                                                        const incomingLabel = "Today"; // or "Today" if you really want
                                                        const list = Array.isArray(prev) ? prev : [];
                                                        if (list.length === 0) {
                                                            return [{ label: incomingLabel, messages: [msg] }];
                                                        }
                                                        const lastIndex = list.length - 1;
                                                        const lastGroup = list[lastIndex];
                                                        const alreadyExists = lastGroup?.messages.find((m: any) => m.id === msg.id)
                                                        if (alreadyExists) return prev;
                                                        if (lastGroup?.label === incomingLabel) {
                                                            const updatedLastGroup = {
                                                                ...lastGroup,
                                                                messages: [...(lastGroup.messages || []), msg],
                                                            };
                                                            return [...list.slice(0, lastIndex), updatedLastGroup];
                                                        }
                                                        return [...list, { label: incomingLabel, messages: [msg] }];
                                                    });
                                                }
                                                socket?.emit("message_delivered", { to_role: "seeker", to_id: dataa.id, message: res.data }, (res: any) => {
                                                });
                                            })
                                        }

                                    }} style={{ alignSelf: "stretch", aspectRatio: 1, overflow: "hidden" }}>
                                        <Image source={require("./button.png")} style={{ height: "100%", width: "100%" }} />
                                    </Pressable>
                                </>
                            }
                        </View>

                    </View>
                    {
                        !comment && !document?.cvFile?.name && <>
                            <Pressable onPress={async () => {
                                const res = await pick({
                                    type: ["application/pdf"],
                                    copyTo: 'cachesDirectory',
                                });
                                setDocument({
                                    cvFile: {
                                        uri: res[0].fileCopyUri || res[0].uri,
                                        name: res[0].name || 'cv.pdf',
                                        type: res[0].type || 'application/pdf',
                                        size: res[0].size,
                                    },
                                });
                                const fd = new FormData();
                                fd.append('attachment', {
                                    uri: res[0].fileCopyUri || res[0].uri,
                                    name: res[0].name || 'cv.pdf',
                                    type: res[0].type || 'application/pdf',
                                } as any);
                                dispatch(UploadDocument(fd))
                                    .unwrap()
                                    .then(res => {
                                        if (res.success) {
                                            setDocument((prev) => ({ ...prev, ...res.data }))
                                        }
                                    })
                                    .catch(err => {
                                    });
                            }} style={{ alignSelf: "center", overflow: "hidden", width: responsiveScreenWidth(8), aspectRatio: 1 }}>
                                <Image source={require("./pdf.png")} style={{ height: "100%", width: "100%" }} />
                            </Pressable>
                            <Pressable
                                onPress={async () => {
                                    const res = await pick({
                                        type: ["image/*"],
                                        copyTo: 'cachesDirectory',
                                    });
                                    setDocument({
                                        cvFile: {
                                            uri: res[0].fileCopyUri || res[0].uri,
                                            name: res[0].name || 'image.jpg',
                                            type: res[0].type || 'application/octet-stream',
                                            size: res[0].size,
                                        },
                                    });
                                    const fd = new FormData();
                                    fd.append('attachment', {
                                        uri: res[0].fileCopyUri || res[0].uri,
                                        name: res[0].name || 'image.jpg',
                                        type: res[0].type || 'application/octet-stream',
                                    } as any);
                                    dispatch(UploadDocument(fd))
                                        .unwrap()
                                        .then(res => {
                                            if (res.success) {
                                                setDocument((prev) => ({ ...prev, ...res.data }))
                                            }
                                        })
                                        .catch(err => {
                                        });
                                }}

                                style={{ alignSelf: "center", overflow: "hidden", width: responsiveScreenWidth(8), aspectRatio: 1 }}>
                                <Image source={require("./camera.png")} style={{ height: "100%", width: "100%" }} />
                            </Pressable>
                        </>
                    }
                </View>
            </KeyboardAvoidingView>
        </NavigationBar>
    )
}

export default Messages
type Msg = { id: number; created_at: string;[k: string]: any };
type Group = { date: string; label: string; messages: Msg[] };

const mergeGroupedMessages = (prev: Group[], incoming: Group[]) => {
    const map = new Map<string, Group>();

    // 1) seed with prev
    (prev || []).forEach((g) => {
        map.set(g.date, { ...g, messages: [...(g.messages || [])] });
    });

    // 2) merge incoming into map
    (incoming || []).forEach((g) => {
        const existing = map.get(g.date);

        if (!existing) {
            map.set(g.date, { ...g, messages: [...(g.messages || [])] });
            return;
        }

        // merge messages + dedupe by id
        const merged = [...(g.messages || []), ...(existing.messages || [])];
        const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());

        // sort messages by created_at (old -> new)
        unique.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));

        map.set(g.date, { ...existing, label: existing.label || g.label, messages: unique });
    });

    // 3) return groups sorted by date (old -> new)
    const out = Array.from(map.values());
    out.sort((a, b) => +new Date(a.date) - +new Date(b.date));

    return out;
};
const styles = StyleSheet.create({})