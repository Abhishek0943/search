import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAppDispatch } from "../../../store";
import { JobCandidates } from "../../../reducer/recruiterReducer";
import { useNavigation, useRoute } from "@react-navigation/native";
import { routes } from "../../../constants/values";
import NavigationBar from "../../components/NavigationBar";

// ---- CONFIG -------------------------------------------------------------
const VISIBLE_COUNT = 3; // candidates shown before "Show N more"

const C = {
  bg: "#F3F6FC",
  card: "#FFFFFF",
  border: "#DCE4F2",
  navy: "#0F1B3D",
  text: "#6B7590",
  blue: "#1F5FE0",
  blueSoft: "#E8F0FF",
  amber: "#F2A60C",
  amberSoft: "#FFF1D0",
  amberText: "#B87400",
  gray: "#A9B0BE",
  graySoft: "#ECEFF4",
  grayText: "#4A5368",
  green: "#1F5E3B",
};

// API key -> UI group
const GROUPS = [
  { key: "strong_match", title: "Strong match", dot: C.blue, badgeBg: C.blueSoft, badgeText: C.blue },
  { key: "good_match", title: "Good match", dot: C.blue, badgeBg: C.blueSoft, badgeText: C.blue },
  { key: "review", title: "Needs review", dot: C.amber, badgeBg: C.amberSoft, badgeText: C.amberText },
  { key: "not_meeting", title: "Doesn't meet", dot: C.gray, badgeBg: C.graySoft, badgeText: C.grayText },
];

// ---- SMALL PIECES -------------------------------------------------------
const Chevron = ({ up, color = C.navy, size = 9 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderColor: color,
      transform: [{ rotate: up ? "-135deg" : "45deg" }],
      marginTop: up ? 4 : -3,
      marginRight: 3,
    }}
  />
);

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const shortLocation = (loc = "") => loc.split(",").slice(0, 2).join(",").trim();

const Avatar = ({ user }) =>
  user.image ? (
    <Image
      source={{ uri: user.image }}
      style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.blueSoft }}
    />
  ) : (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: C.blueSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: C.blue }}>{initials(user.name)}</Text>
    </View>
  );

const SkillTag = ({ label }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.blueSoft,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 6,
      marginTop: 6,
    }}
  >
    <Text style={{ fontSize: 11, color: C.blue, fontWeight: "700", marginRight: 4 }}>✓</Text>
    <Text style={{ fontSize: 11, color: C.blue, fontWeight: "500" }}>{label}</Text>
  </View>
);

const CandidateCard = ({ item, onPress }) => {
  const { user, match_percentage, application_id, created_at } = item;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate(routes.CANDIDATEPROFILE, { application_id })}
      style={{
        backgroundColor: C.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <Avatar user={user} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: C.navy }} numberOfLines={1}>
          {user.name}
        </Text>
        {
          created_at && <Text style={{ fontSize: 12, color: C.text, marginTop: 3 }} numberOfLines={1}>
            Applied on {created_at}
          </Text>
        }

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {(user.skills || []).slice(0, 2).map((s) => (
            <SkillTag key={s} label={s} />
          ))}
        </View>
      </View>
      <View
        style={{
          backgroundColor: C.blueSoft,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
          marginLeft: 8,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: C.blue }}>{match_percentage}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const GroupSection = ({ group, items, open, onToggle, onCandidatePress }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, VISIBLE_COUNT);
  const hidden = items.length - visible.length;

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={{
          backgroundColor: C.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.border,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: group.dot, marginRight: 10 }} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: C.navy }}>{group.title}</Text>
        <View
          style={{
            backgroundColor: group.badgeBg,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginLeft: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: group.badgeText }}>{items.length}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Chevron up={open} color={open ? C.text : C.text} />
      </TouchableOpacity>

      {open && (
        <View style={{ marginTop: 10 }}>
          {items.length === 0 ? (
            <Text style={{ fontSize: 13, color: C.text, paddingHorizontal: 6, paddingVertical: 8 }}>
              No candidates in this group yet.
            </Text>
          ) : (
            visible.map((it) => (
              <CandidateCard key={it.application_id} item={it} onPress={onCandidatePress} />
            ))
          )}
          {hidden > 0 && (
            <TouchableOpacity onPress={() => setShowAll(true)} style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.green }}>Show {hidden} more</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ---- BOTTOM TAB BAR (optional – use your navigator's if you have one) ----
const TABS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "jobs", label: "Jobs", icon: "▣" },
  { key: "candidates", label: "Candidates", icon: "☺" },
  { key: "inbox", label: "Inbox", icon: "✉", dot: true },
  { key: "profile", label: "Profile", icon: "◔" },
];

const TabBar = ({ active = "candidates", onChange = () => { } }) => (
  <View
    style={{
      flexDirection: "row",
      backgroundColor: C.card,
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingTop: 10,
      paddingBottom: 14,
    }}
  >
    {TABS.map((t) => {
      const on = t.key === active;
      return (
        <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={{ flex: 1, alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 22, color: on ? C.blue : C.text }}>{t.icon}</Text>
            {t.dot && (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: C.amber,
                }}
              />
            )}
          </View>
          <Text style={{ fontSize: 11, marginTop: 2, fontWeight: on ? "700" : "400", color: on ? C.blue : C.text }}>
            {t.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function CandidatesScreen({
}) {
  const [groups, setGroups] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openKey, setOpenKey] = useState("strong_match");
  const route = useRoute()
  const { jobId, jobTitle } = route.params as { jobId: number, jobTitle: string };
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(JobCandidates({ job_id: jobId }))
      .unwrap()
      .then((res) => {
        setGroups(res.data.match_groups);
        setTotal(res.data.meta?.total ?? 0);
      })
      .catch((err) => {
        setError(typeof err === "string" ? err : err?.message || "Could not load candidates");
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <NavigationBar navigationBar={false} >

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: C.navy, marginBottom: 14 }}>Candidates</Text>

        {/* Job selector */}
        <TouchableOpacity
          activeOpacity={0.85}
          // onPress={onChangeJob}
          style={{
            backgroundColor: C.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: C.navy }}>{jobTitle}</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: C.text, marginRight: 14 }}>{total}</Text>
          <Chevron color={C.navy} />
        </TouchableOpacity>

        <TouchableOpacity
          // onPress={onHowGroupsDecided}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 8 }}
        >
          <Text style={{ fontSize: 13, color: C.text }}>How the groups are decided</Text>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: C.blueSoft,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: C.blue }}>?</Text>
          </View>
        </TouchableOpacity>

        {/* Progress segments */}
        <View style={{ flexDirection: "row", marginBottom: 18 }}>
          {[C.blue, C.blue, C.amber, C.gray].map((color, i) => (
            <View
              key={i}
              style={{
                flex: i === 2 ? 1.6 : i === 3 ? 0.8 : 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: color,
                marginRight: i === 3 ? 0 : 4,
              }}
            />
          ))}
        </View>

        {loading && <ActivityIndicator color={C.blue} style={{ marginTop: 40 }} />}

        {!loading && error && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 14, color: C.text, textAlign: "center" }}>{error}</Text>
            <TouchableOpacity
              onPress={load}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: C.blue,
                borderRadius: 10,
                paddingHorizontal: 18,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: C.blue, fontWeight: "700" }}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading &&
          // !error &&
          groups &&
          GROUPS.map((g) => (
            <GroupSection
              key={g.key}
              group={g}
              items={groups[g.key] || []}
              open={openKey === g.key}
              onToggle={() => setOpenKey(openKey === g.key ? null : g.key)}
              onCandidatePress={() => {

              }}
            />
          ))}
      </ScrollView>
    </NavigationBar>



  );
}