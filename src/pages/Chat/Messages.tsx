import { CustomTextInput } from '../../components';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store'
import { GetChats, GetMessage, GetMessageSeeker, UploadCV, UploadDocument } from '../../reducer/jobsReducer'
import NavigationBar from '../../recruiter/components/NavigationBar'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { ThemeContext } from '../../context/ThemeProvider'
import imagePath from '../../assets/imagePath'
import Text from '../../components/Text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSocket } from '../../context/SocketProvider'
import { SendMessage, SendMessageSeeker } from '../../reducer/recruiterReducer'
import { pick, types } from '@react-native-documents/picker'
import Icon from '../../utils/Icon'
import { downloadCV } from '../../recruiter/pages/CandidateProfile/CandidateProfile'
import { updateChatMessage, setActiveChat } from '../../reducer/chatReducer'

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const QUICK_REPLIES = [
    'Yes, I can',
    'What time?',
    'Not available',
];

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
    const { active } = useAppSelector(state => state.chatStore);
    const onLoadMore = React.useCallback(() => {
        if (!meta?.last_page) return;
        if (meta?.current_page >= meta.last_page) return;
        setPages((p) => p + 1);
    }, [meta?.last_page, meta?.current_page]);

    useEffect(() => {
        const login = async () => {
            const role = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            setRole(role)
        }
        login()
    }, [])

    // Set this conversation as the active one so Chat.tsx won't increment unread count
    useFocusEffect(
        useCallback(() => {
            if (dataa?.id) dispatch(setActiveChat(dataa.id));
            return () => { dispatch(setActiveChat(0)); };
        }, [dataa?.id])
    );

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
                        console.log(res.data.groups, "data");
                        const incomingGroups = res.data.groups;
                        setData((prev) => {
                            if (pages === 1) return incomingGroups;
                            return mergeGroupedMessages(prev, incomingGroups);
                        });
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
                const incomingLabel = "Today";
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

            // Update chat list in Redux (unread count will stay 0 because active === dataa.id)
            const num = Number(e?.from_id);
            if (!Number.isNaN(num)) {
                dispatch(updateChatMessage({ companyId: num, lastMessage: e?.message?.message, active }));
            }
        };
        socket.on("message_received", handler);
        return () => {
            socket.off("message_received", handler);
        };
    }, [socket, isConnected, item.id, active]);

    const [document, setDocument] = useState({})
    const [sending, setSending] = useState(false);
    // Track which message IDs are currently being downloaded
    const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
    // Image preview modal
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleDownload = async (id: number, url: string) => {
        if (downloadingIds.has(id)) return;
        setDownloadingIds(prev => new Set(prev).add(id));
        try {
            await downloadCV(url);
        } finally {
            setDownloadingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const onSend = async () => {
        if (sending) return;
        const a = (comment || "").trim();

        if (!a && !document?.cvFile?.name) return;
        setSending(true);
        try {
            setComment("");
            const { cvFile, ...b } = document || {};
            const action =
                role === "seeker"
                    ? SendMessageSeeker({ company_id: dataa.id, message: a, ...b })
                    : SendMessage({ seeker_id: dataa.id, message: a, ...b });
            const res = await dispatch(action).unwrap();
            if (res?.success) {
                setDocument({});
                const msg = res?.data;
                setData((prev) => {
                    const incomingLabel = "Today";
                    const list = Array.isArray(prev) ? prev : [];
                    if (list.length === 0) return [{ label: incomingLabel, messages: [msg] }];
                    const lastIndex = list.length - 1;
                    const lastGroup = list[lastIndex];
                    const existsAnywhere = list.some(g => (g.messages || []).some(m => m.id === msg.id));
                    if (existsAnywhere) return prev;

                    if (lastGroup?.label === incomingLabel) {
                        return [
                            ...list.slice(0, lastIndex),
                            { ...lastGroup, messages: [...(lastGroup.messages || []), msg] },
                        ];
                    }
                    return [...list, { label: incomingLabel, messages: [msg] }];
                });

                socket?.emit("message_delivered", {
                    to_role: role === "seeker" ? "company" : "seeker",
                    to_id: dataa.id,
                    message: msg,
                });
            }
        } finally {
            setSending(false);
        }
    };

    const handleQuickReply = (text: string) => {
        setComment(text);
    };

    const isMine = (e: any) => {
        if (role === "recruiter") return e.type === "reply";
        return e.type !== "reply";
    };

    return (
        <NavigationBar navigationBar={false}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Header */}
                <View style={{
                    paddingHorizontal: responsiveScreenWidth(4),
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: responsiveScreenHeight(1.5),
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.surfaces,
                }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            padding: responsiveScreenWidth(1),
                            marginRight: responsiveScreenWidth(2),
                        }}
                    >
                        <Image
                            source={imagePath.backIcon}
                            style={{ resizeMode: 'contain', width: 22, height: 22 }}
                        />
                    </TouchableOpacity>

                    {/* Avatar */}
                    {item.logo ? (
                        <View style={{
                            width: responsiveScreenWidth(11),
                            aspectRatio: 1,
                            borderRadius: 100,
                            borderWidth: 2,
                            borderColor: colors.primary + '20',
                            overflow: 'hidden',
                            backgroundColor: colors.secondary,
                            marginRight: responsiveScreenWidth(2.5),
                        }}>
                            <Image
                                source={{ uri: item.logo }}
                                style={{ resizeMode: 'contain', height: '100%', width: '100%' }}
                            />
                        </View>
                    ) : (
                        <View style={{
                            width: responsiveScreenWidth(11),
                            aspectRatio: 1,
                            borderRadius: 100,
                            backgroundColor: colors.primary + '15',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: responsiveScreenWidth(2.5),
                        }}>
                            <Text style={{
                                fontSize: responsiveScreenFontSize(1.6),
                                fontWeight: '800',
                                color: colors.primary,
                            }}>{getInitials(dataa?.name || '')}</Text>
                        </View>
                    )}

                    <View style={{ flex: 1 }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: responsiveScreenFontSize(1.9),
                                color: colors.textPrimary,
                                fontWeight: '700',
                            }}
                        >{dataa?.name}</Text>
                        {dataa?.job_title && (
                            <View style={{
                                alignSelf: 'flex-start',
                                backgroundColor: colors.lightBlue,
                                borderRadius: 6,
                                paddingHorizontal: responsiveScreenWidth(2),
                                paddingVertical: 2,
                                marginTop: 3,
                            }}>
                                <Text style={{
                                    fontSize: responsiveScreenFontSize(1.25),
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}>{dataa.job_title}</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={{
                            padding: responsiveScreenWidth(1.5),
                        }}
                    >
                        <Icon
                            icon={{ type: 'Ionicons', name: 'chevron-forward' }}
                            size={responsiveScreenFontSize(2.2)}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Messages List */}
                <View style={{ flex: 1, paddingHorizontal: responsiveScreenWidth(4) }}>
                    <FlatList
                        style={{ paddingVertical: responsiveScreenHeight(1) }}
                        onEndReachedThreshold={0.3}
                        onEndReached={onLoadMore}
                        scrollEventThrottle={16}
                        removeClippedSubviews={false}
                        inverted
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: responsiveScreenHeight(0.5) }}
                        data={[...data].reverse()}
                        renderItem={({ item }) => {
                            return (
                                <>
                                    {
                                        item.messages && [...item.messages].reverse().map((e) => {
                                            const mine = isMine(e);
                                            return (
                                                <View key={e.id} style={{ marginBottom: responsiveScreenHeight(0.5) }}>
                                                    {/* Text message bubble */}
                                                    {e.message && (
                                                        <View style={{
                                                            alignSelf: mine ? 'flex-end' : 'flex-start',
                                                            maxWidth: responsiveScreenWidth(72),
                                                            backgroundColor: mine ? colors.primary : '#F0F2F5',
                                                            borderRadius: 18,
                                                            borderTopRightRadius: mine ? 4 : 18,
                                                            borderTopLeftRadius: mine ? 18 : 4,
                                                            paddingHorizontal: responsiveScreenWidth(4),
                                                            paddingVertical: responsiveScreenHeight(1.2),
                                                        }}>
                                                            <Text style={{
                                                                fontSize: responsiveScreenFontSize(1.7),
                                                                color: mine ? '#FFFFFF' : colors.textPrimary,
                                                                fontWeight: '500',
                                                                lineHeight: responsiveScreenFontSize(2.4),
                                                            }}>{e.message}</Text>
                                                        </View>
                                                    )}

                                                    {/* File attachment */}
                                                    {(e.attachment_type === "file" || e.attachment_type === "pdf") && (() => {
                                                        const isLoading = downloadingIds.has(e.id);
                                                        return (
                                                            <Pressable
                                                                onPress={() => Linking.openURL(e.url).catch(() => Alert.alert("Cannot open file"))}
                                                                onLongPress={() => handleDownload(e.id, e.url)}
                                                                style={{
                                                                    alignSelf: mine ? 'flex-end' : 'flex-start',
                                                                    borderRadius: 14,
                                                                    marginVertical: responsiveScreenHeight(0.3),
                                                                    paddingHorizontal: responsiveScreenWidth(3),
                                                                    paddingVertical: responsiveScreenHeight(1.2),
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    backgroundColor: '#F0F2F5',
                                                                    maxWidth: responsiveScreenWidth(70),
                                                                    gap: responsiveScreenWidth(2.5),
                                                                }}
                                                            >
                                                                {isLoading
                                                                    ? <ActivityIndicator size="small" color={colors.primary} />
                                                                    : <Icon icon={{ type: "Ionicons", name: "document-outline" }} size={responsiveScreenFontSize(2)} color={colors.primary} />
                                                                }
                                                                <View style={{ flex: 1 }}>
                                                                    <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.6), fontWeight: '600', color: colors.textPrimary }}>{e.name}</Text>
                                                                    {isLoading && <Text style={{ fontSize: responsiveScreenFontSize(1.3), color: colors.primary, fontWeight: '500' }}>Downloading…</Text>}
                                                                    {!isLoading && <Text style={{ fontSize: responsiveScreenFontSize(1.3), color: colors.textSecondary, fontWeight: '500' }}>Tap to open · Hold to save</Text>}
                                                                </View>
                                                            </Pressable>
                                                        );
                                                    })()}

                                                    {/* Image attachment */}
                                                    {e.attachment_type === "image" && (() => {
                                                        const isLoading = downloadingIds.has(e.id);
                                                        return (
                                                            <Pressable
                                                                onPress={() => setPreviewImage(e.url)}
                                                                onLongPress={() => handleDownload(e.id, e.url)}
                                                                style={{
                                                                    overflow: 'hidden',
                                                                    alignSelf: mine ? 'flex-end' : 'flex-start',
                                                                    borderRadius: 16,
                                                                    marginVertical: responsiveScreenHeight(0.3),
                                                                }}
                                                            >
                                                                <Image
                                                                    source={{ uri: e.url }}
                                                                    style={{
                                                                        height: responsiveScreenWidth(50),
                                                                        aspectRatio: 1,
                                                                        borderRadius: 16,
                                                                    }}
                                                                />
                                                                {isLoading && (
                                                                    <View style={{
                                                                        position: 'absolute',
                                                                        top: 0, left: 0, right: 0, bottom: 0,
                                                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        borderRadius: 16,
                                                                    }}>
                                                                        <ActivityIndicator size="large" color="#fff" />
                                                                        <Text style={{ color: '#fff', fontSize: responsiveScreenFontSize(1.5), marginTop: 6, fontWeight: '500' }}>Saving…</Text>
                                                                    </View>
                                                                )}
                                                            </Pressable>
                                                        );
                                                    })()}

                                                    {/* Timestamp */}
                                                    <Text style={{
                                                        marginTop: 4,
                                                        alignSelf: mine ? 'flex-end' : 'flex-start',
                                                        color: colors.textSecondary,
                                                        fontSize: responsiveScreenFontSize(1.3),
                                                        fontWeight: '500',
                                                    }}>{new Date(e.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "numeric" })}</Text>
                                                </View>
                                            )
                                        })
                                    }
                                    {/* Day separator */}
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: responsiveScreenWidth(3),
                                        marginVertical: responsiveScreenHeight(1),
                                    }}>
                                        <View style={{ height: 0.5, flex: 1, backgroundColor: colors.surfaces }} />
                                        <Text style={{
                                            fontSize: responsiveScreenFontSize(1.4),
                                            color: colors.textSecondary,
                                            fontWeight: '600',
                                        }}>{item.label}</Text>
                                        <View style={{ height: 0.5, flex: 1, backgroundColor: colors.surfaces }} />
                                    </View>
                                </>
                            )
                        }}
                    />
                </View>

                {/* Quick Reply Chips */}
                {!comment && data.length > 0 && (
                    <View style={{
                        flexDirection: 'row',
                        paddingHorizontal: responsiveScreenWidth(4),
                        paddingBottom: responsiveScreenHeight(1),
                        gap: responsiveScreenWidth(2),
                    }}>
                        {QUICK_REPLIES.map((text) => (
                            <TouchableOpacity
                                key={text}
                                onPress={() => handleQuickReply(text)}
                                activeOpacity={0.7}
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.surfaces,
                                    borderRadius: 20,
                                    paddingHorizontal: responsiveScreenWidth(3.5),
                                    paddingVertical: responsiveScreenHeight(0.9),
                                }}
                            >
                                <Text style={{
                                    fontSize: responsiveScreenFontSize(1.45),
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                }}>{text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Message Input */}
                <View style={{
                    flexDirection: 'row',
                    marginBottom: responsiveScreenHeight(2),
                    marginHorizontal: responsiveScreenWidth(4),
                    gap: responsiveScreenWidth(2),
                    alignItems: 'flex-end',
                }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#F0F2F5',
                            borderRadius: 25,
                            overflow: 'hidden',
                        }}>
                        {
                            document?.cvFile?.name && (
                                <TouchableOpacity onPress={() => setDocument({})}>
                                    <Text style={{
                                        marginLeft: responsiveScreenWidth(4),
                                        marginTop: responsiveScreenHeight(1),
                                        fontSize: responsiveScreenFontSize(1.5),
                                        color: colors.primary,
                                        fontWeight: '600',
                                    }}>📎 {document?.cvFile?.name}</Text>
                                </TouchableOpacity>
                            )
                        }
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CustomTextInput
                                placeholder="Message"
                                placeholderTextColor={colors.textSecondary}
                                value={comment}
                                onChangeText={e => setComment(e)}
                                style={{
                                    flex: 1,
                                    fontSize: responsiveScreenFontSize(1.7),
                                    paddingVertical: responsiveScreenHeight(1.5),
                                    fontWeight: '500',
                                    padding: 0,
                                    marginLeft: responsiveScreenWidth(4),
                                    color: colors.textPrimary,
                                }}
                            />
                            {
                                !comment && !document?.attachment && (
                                    <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(1), paddingRight: responsiveScreenWidth(2) }}>
                                        <Pressable
                                            onPress={async () => {
                                                const [res] = await pick({
                                                    type: [types.pdf],
                                                    allowMultiSelection: false,
                                                    mode: 'import',
                                                    copyTo: 'documentDirectory',
                                                });
                                                setDocument({
                                                    cvFile: {
                                                        uri: res?.fileCopyUri || res.uri,
                                                        name: res?.name || 'cv.pdf',
                                                        type: res?.type || 'application/pdf',
                                                        size: res?.size,
                                                    },
                                                });
                                                const fd = new FormData();
                                                fd.append('attachment', {
                                                    uri: res?.fileCopyUri || res.uri,
                                                    name: res.name || 'cv.pdf',
                                                    type: res.type || 'application/pdf',
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
                                            style={{
                                                padding: responsiveScreenWidth(2),
                                            }}
                                        >
                                            <Image source={require("./pdf.png")} style={{ width: responsiveScreenWidth(5), height: responsiveScreenWidth(5), resizeMode: 'contain', tintColor: colors.textSecondary }} />
                                        </Pressable>
                                        <Pressable
                                            onPress={async () => {
                                                const [res] = await pick({
                                                    type: [types.images],
                                                    allowMultiSelection: false,
                                                    mode: 'import',
                                                    copyTo: 'documentDirectory',
                                                });
                                                setDocument({
                                                    cvFile: {
                                                        uri: res.fileCopyUri || res.uri,
                                                        name: res.name || 'image.jpg',
                                                        type: res.type || 'application/octet-stream',
                                                        size: res.size,
                                                    },
                                                });
                                                const fd = new FormData();
                                                fd.append('attachment', {
                                                    uri: res.fileCopyUri || res.uri,
                                                    name: res.name || 'image.jpg',
                                                    type: res.type || 'application/octet-stream',
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
                                            style={{
                                                padding: responsiveScreenWidth(2),
                                            }}
                                        >
                                            <Image source={require("./camera.png")} style={{ width: responsiveScreenWidth(5), height: responsiveScreenWidth(5), resizeMode: 'contain', tintColor: colors.textSecondary }} />
                                        </Pressable>
                                    </View>
                                )
                            }
                        </View>
                    </View>

                    {/* Send Button */}
                    {(comment || document?.attachment) ? (
                        <Pressable
                            onPress={onSend}
                            disabled={sending}
                            style={{
                                width: responsiveScreenWidth(12),
                                aspectRatio: 1,
                                borderRadius: 100,
                                backgroundColor: colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: sending ? 0.6 : 1,
                            }}
                        >
                            <Icon
                                icon={{ type: 'Ionicons', name: 'arrow-forward' }}
                                size={responsiveScreenFontSize(2.2)}
                                color="#FFFFFF"
                            />
                        </Pressable>
                    ) : null}
                </View>
            </KeyboardAvoidingView>

            {/* ── Full-screen image preview modal ── */}
            <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" }}>
                    <SafeAreaView style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
                        {previewImage && (
                            <Image
                                source={{ uri: previewImage }}
                                style={{ width: "100%", height: "80%" }}
                                resizeMode="contain"
                            />
                        )}
                        <View style={{ flexDirection: "row", gap: responsiveScreenWidth(5), marginTop: responsiveScreenHeight(3) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    const fakeId = Date.now();
                                    if (previewImage) handleDownload(fakeId, previewImage);
                                    setPreviewImage(null);
                                }}
                                style={{ backgroundColor: colors.primary, paddingVertical: responsiveScreenHeight(1.2), paddingHorizontal: responsiveScreenWidth(8), borderRadius: 25, flexDirection: "row", alignItems: "center", gap: 8 }}
                            >
                                <Icon icon={{ type: "Ionicons", name: "download-outline" }} color="#fff" />
                                <Text style={{ color: "#fff", fontSize: responsiveScreenFontSize(1.8), fontWeight: "600" }}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPreviewImage(null)}
                                style={{ backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: responsiveScreenHeight(1.2), paddingHorizontal: responsiveScreenWidth(8), borderRadius: 25 }}
                            >
                                <Text style={{ color: "#fff", fontSize: responsiveScreenFontSize(1.8), fontWeight: "600" }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
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