import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { NavigationBar } from "../components";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import { useAppDispatch } from "../store";
import { GetJobDetaild, Tokien } from "./recruiterReducer";
import { useRoute } from "@react-navigation/native";
import { openBrowser } from "../pages/Resume/Resume";
import { ThemeContext } from "../context/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const C = {
    bg: "#EEF4FF",
    card: "#FFFFFF",
    border: "#DCE6F7",
    primary: "#3F74F0",
    navy: "#16204A",
    muted: "#4A5578",
    chip: "#EAF1FF",
    success: "#3F8F5B",
};

const STEPS = [
    { label: "Profile & CV", state: "done" },
    { label: "Screening", state: "done" },
    { label: "Assessment", state: "active", n: 3 },
    { label: "Complete", state: "todo", n: 4 },
];

const SECTIONS = ["Games", "Customer moments", "Incident report"];

const TIPS = [
    { icon: "👤", title: "Use a quiet place", text: "Find a distraction-free environment so you can focus." },
    { icon: "◷", title: "Complete in one sitting if possible", text: "The assessment usually takes around 7 minutes." },
    { icon: "▤", title: "Your progress is saved", text: "If you need to stop, you can come back later from your email or Applications." },
];

const JOURNEY = [
    { title: "Start assessment", text: "Complete the short assessment (approx. 7 min)." },
    { title: "Finish assessment", text: "Your responses are submitted automatically." },
    { title: "Employer review", text: "The employer will review your application and assessment results." },
    { title: "Status updates", text: "We'll keep you updated by email and in your Applications." },
];

const Stepper = () => (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 16 }}>
        {STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
                <View style={{ alignItems: "center" }}>
                    <View
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: s.state === "todo" ? "#fff" : C.primary,
                            borderWidth: s.state === "todo" ? 1 : 0,
                            borderColor: C.border,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: responsiveFontSize(1.5),
                                fontWeight: "700",
                                color: s.state === "todo" ? C.navy : "#fff",
                            }}
                        >
                            {s.state === "done" ? "✓" : s.n}
                        </Text>
                    </View>
                    <Text
                        style={{
                            marginTop: 4,
                            fontSize: responsiveFontSize(1.4),
                            fontWeight: s.state === "todo" ? "400" : "600",
                            color: s.state === "todo" ? C.navy : C.primary,
                        }}
                    >
                        {s.label}
                    </Text>
                </View>
                {i < STEPS.length - 1 && (
                    <View style={{ flex: 1, height: 1, backgroundColor: C.border, marginHorizontal: 6, marginBottom: 16 }} />
                )}
            </React.Fragment>
        ))}
    </View>
);

const Card = ({ children, style }) => (
    <View
        style={[
            {
                backgroundColor: C.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.border,
                padding: 16,
                shadowColor: "#1B2B6B",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            },
            style,
        ]}
    >
        {children}
    </View>
);

const Chip = ({ icon, text }) => (
    <View
        style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.chip,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginRight: 8,
        }}
    >
        <Text style={{ fontSize: 12, color: C.muted, marginRight: 6 }}>{icon}</Text>
        <Text style={{ fontSize: 12, color: C.navy }}>{text}</Text>
    </View>
);

const IconBox = ({ icon, round, size = 32 }) => (
    <View
        style={{
            width: size,
            height: size,
            borderRadius: round ? size / 2 : 8,
            backgroundColor: C.chip,
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <Text style={{ fontSize: size * 0.45, color: C.primary }}>{icon}</Text>
    </View>
);

const Divider = () => <View style={{ height: 1, backgroundColor: C.border, marginVertical: 16 }} />;

export default function AssessmentScreen({
    company = "Hbfhx",
    user = "kebbos",
    title = "Retail Sales Assistant — shift simulation",
    onResume = () => { },
    onRestart = () => { },
    onLater = () => { },
}) {
    const route = useRoute()
    const id = route?.params?.id
    const dispatch = useAppDispatch()
    const { colors } = useContext(ThemeContext)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        dispatch(GetJobDetaild({ id: id })).unwrap().then((res) => {
            console.log(res.data, "kjasdfghjkasdfhjkadfhkuasdfhikua")
            setData(res.data)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            setLoading(false)
        })

    }, [id])

    return (
        <NavigationBar>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                <Text style={{ fontSize: responsiveFontSize(3), fontWeight: "800", color: C.navy }}>Assessment for {company}</Text>
                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: "600", color: C.navy, marginTop: 6 }}>{user}</Text>
                <Stepper />

                <Card style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
                    <View
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: C.success,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>✓</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: C.navy }}>Your assessment is in progress</Text>
                        <Text style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 }}>
                            Your application has been saved. You can also finish the assessment later from your email or in your
                            Applications.
                        </Text>
                    </View>
                </Card>

                {/* Main card */}
                <Card style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <IconBox icon="▤" />
                        <Text style={{ flex: 1, fontSize: 17, fontWeight: "800", color: C.navy, marginLeft: 12 }}>
                            {title}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 12 }}>
                        <Chip icon="◷" text="Approx. 7 min" />
                        <Chip icon="▥" text="6 activities" />
                    </View>

                    <Divider />

                    <Text style={{ fontSize: 13, fontWeight: "700", color: C.navy }}>What you'll complete</Text>
                    <Text style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 17 }}>
                        This assessment includes a range of activities to help the employer understand how you might approach real
                        work situations.
                    </Text>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginHorizontal: -4 }}>
                        {SECTIONS.map((s) => (
                            <View key={s} style={{ width: "50%", padding: 4 }}>
                                <View style={{ backgroundColor: C.chip, borderRadius: 6, paddingVertical: 12, paddingHorizontal: 10 }}>
                                    <Text style={{ fontSize: 12, color: C.navy }}>{s}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <Divider />

                    <Text style={{ fontSize: 13, fontWeight: "700", color: C.navy, marginBottom: 12 }}>Before you start</Text>
                    {TIPS.map((t) => (
                        <View key={t.title} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
                            <IconBox icon={t.icon} round size={30} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: C.navy }}>{t.title}</Text>
                                <Text style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 }}>{t.text}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Actions */}
                    <TouchableOpacity
                        onPress={async () => {
                            const token = await AsyncStorage.getItem("token")
                            console.log(data.assignment.url + `?token=${token}`, "asdfghjk")
                            openBrowser(data.assignment.url + `?token=${token}`, colors.primary, false)
                        }}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: C.primary,
                            borderRadius: 8,
                            paddingVertical: 13,
                            alignItems: "center",
                            marginTop: 4,
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Resume assessment →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onRestart}
                        activeOpacity={0.85}
                        style={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: C.primary,
                            paddingVertical: 13,
                            alignItems: "center",
                            marginTop: 10,
                        }}
                    >
                        <Text style={{ color: C.primary, fontSize: 13, fontWeight: "700" }}>Restart assessment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onLater}
                        activeOpacity={0.85}
                        style={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: C.primary,
                            paddingVertical: 13,
                            alignItems: "center",
                            marginTop: 10,
                        }}
                    >
                        <Text style={{ color: C.primary, fontSize: 13, fontWeight: "700" }}>◷  Do this later</Text>
                    </TouchableOpacity>
                </Card>

                {/* What happens next */}
                <Card>
                    <IconBox icon="💡" size={28} />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: C.primary, marginTop: 10, letterSpacing: 0.4 }}>
                        WHAT HAPPENS NEXT
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: C.navy, marginTop: 4, marginBottom: 14 }}>
                        Your assessment journey
                    </Text>

                    {JOURNEY.map((j, i) => (
                        <View key={j.title} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
                            <View
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: C.chip,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: "700", color: C.primary }}>{i + 1}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: C.navy }}>{j.title}</Text>
                                <Text style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 }}>{j.text}</Text>
                            </View>
                        </View>
                    ))}
                </Card>
            </ScrollView>
        </NavigationBar>

    );
}