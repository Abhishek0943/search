import React, { useCallback, useContext, useState } from 'react'
import {
  ActivityIndicator, Alert, BackHandler, Image, KeyboardAvoidingView, Linking,
  Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View,
} from 'react-native'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import RNFS from 'react-native-fs'
import { responsiveScreenFontSize as fs, responsiveScreenHeight as hp, responsiveFontSize, responsiveHeight, responsiveWidth, responsiveScreenWidth as wp } from 'react-native-responsive-dimensions'
import { CustomTextInput, NavigationBar } from '../../../components'
import Text from '../../../components/Text'
import imagePath from '../../../assets/imagePath'
import { routes } from '../../../constants/values'
import { useAppDispatch } from '../../../store'
import { CandidateProf, SendMessage, UpdateStatus } from '../../../reducer/recruiterReducer'
import { useAlert } from '../../../context/AlertContext'
import { ThemeContext, ThemeProvider } from '../../../context/ThemeProvider'
const C = {
  bg: '#F4F7FD',
  card: '#FFFFFF',
  border: '#E1E8F5',
  navy: '#0F1B3D',
  muted: '#7A869A',
  primary: '#1A73E8',
  primarySoft: '#E8F0FD',
  green: '#1E7D4F',
  greenSoft: '#E3F4EA',
  red: '#D93025',
  chip: '#EEF1F6',
}

/* ---------- helpers ---------- */
const arr = (v: any) => (Array.isArray(v) ? v : [])

const formatApplied = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return sameDay ? time + ' today' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export async function downloadCV(url: string) {
  try {
    const fileName = `candidate_cv_${Date.now()}.pdf`
    const toFile = Platform.OS === 'android'
      ? `${RNFS.DownloadDirectoryPath}/${fileName}`
      : `${RNFS.DocumentDirectoryPath}/${fileName}`
    const { statusCode } = await RNFS.downloadFile({ fromUrl: url, toFile }).promise
    Alert.alert(
      statusCode === 200 ? 'Download complete' : 'Download failed',
      statusCode === 200
        ? (Platform.OS === 'android' ? 'Saved in Downloads folder' : 'Saved in app documents')
        : undefined,
    )
  } catch {
    Alert.alert('Error downloading file')
  }
}

/* ---------- small building blocks ---------- */
const SectionTitle = ({ children, right }: { children: string; right?: string }) => (
  <View style={s.sectionRow}>
    <Text style={s.sectionTitle}>{children}</Text>
    {!!right && <Text style={s.sectionRight}>{right}</Text>}
  </View>
)

const Card = ({ children, style }: any) => <View style={[s.card, style]}>{children}</View>

const PillButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.primary50, borderRadius: 8, paddingHorizontal: responsiveWidth(3), paddingVertical: responsiveHeight(.6) }}>
      <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.8), fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  )
}

const Stat = ({ value, label, divider }: { value: string; label: string; divider?: boolean }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[s.stat, divider && s.statDivider]}>
      <Text style={s.statValue}>{label}</Text>
      <Text style={[s.statLabel, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  )
}

/* ---------- screen ---------- */
function CandidateProfile() {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const route: any = useRoute()
  const applicationId = route.params?.application_id
  const dispatch = useAppDispatch()
  const { showAlert } = useAlert()

  const [app, setApp] = useState<any>(null)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)



  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigation.canGoBack()) {
        (navigation as any).replace(routes.RECRUITERHOME)
        return true
      }
      return false
    })
    if (applicationId) {
      setLoading(true)
      dispatch(CandidateProf({ id: applicationId })).unwrap()
        .then((res: any) => {
          if (res.success !== false) {
            setApp(res.data)            // whole payload: user, answers, submitted_resume...
            setStatus(res.data?.status || '')
          }
        })
        .finally(() => setLoading(false))
    }
    return () => sub.remove()
  }, [applicationId, navigation]))

  /* status change now happens on press only (no request on mount) */
  const changeStatus = async (next: string) => {
    if (next === status) return
    const prev = status
    setStatus(next)
    try {
      await dispatch(UpdateStatus({ status: next, application_id: applicationId })).unwrap()
    } catch {
      setStatus(prev)
      showAlert({ title: 'Failed', message: 'Could not update status. Please try again.' })
    }
  }

  const sendMessage = async () => {
    const text = msgText.trim()
    if (text.length < 2 || !app?.user?.id) return
    try {
      setSending(true)
      await dispatch(SendMessage({ seeker_id: app.user.id, message: text })).unwrap()
      setMsgText('')
      setMsgOpen(false)
      showAlert({ title: 'Success', message: 'Message sent successfully.' })
    } catch {
      showAlert({ title: 'Failed', message: 'Could not send message. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  /* ---------- derive view data ---------- */
  const user = app?.user || {}
  const details = app?.submitted_details || {}
  const profile = details.profile || {}

  const name = user.name || details.name || 'Candidate'
  const initials = user.avatar?.initials || name.slice(0, 2).toUpperCase()
  const photo = user.avatar?.has_image ? user.avatar.url : null
  const location = user.location || profile.location || user.street_address || ''
  const jobTitle = details.job_title || 'Candidate'
  const matchPct = app?.match_percentage ?? app?.match ?? null          // only if backend sends it
  const experienceLabel = user.job_experience?.job_experience || user.job_experience || null
  const answers = arr(app?.answers)
  const mustHave = answers.filter((a: any) => a.is_must_have || a.must_have)
  const screening = answers.filter((a: any) => !(a.is_must_have || a.must_have))
  const passedCount = mustHave.filter((a: any) => a.passed ?? a.is_passed).length

  const availabilities = arr(user.availabilities).filter((a: any) => a.is_active)
  const skills = arr(user.skills).length ? arr(user.skills).map((x: any) => x.skill_name) : arr(profile.skills)
  const experience = arr(app?.profile_experience)
  const education = arr(app?.profile_education)
  const summary = user.profile_summary
  const portfolio = user.portfolio_link
  const videoUrl = typeof user.video === 'string' ? user.video : user.video?.url
  const resume = app?.submitted_resume?.available ? app.submitted_resume : null
  const resumeUrl = resume?.download_url || user.cv?.cv_url
  const resumeName = resume?.title || user.cv?.cv_file || 'Resume.pdf'
  const { colors } = useContext(ThemeContext);
  console.log(experience, "jdhfahsdfjh")

  /* ---------- render ---------- */
  return (
    <NavigationBar navigationBar={false}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(12) }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: responsiveHeight(2) }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ width: responsiveWidth(2.8), aspectRatio: 1 / 2, }}
            >
              <Image style={{ height: '100%', width: '100%' }} source={imagePath.leftAngle} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: "center", textTransform: "uppercase", fontSize: responsiveFontSize(2), fontWeight: "700" }} numberOfLines={1}>{jobTitle}</Text>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ width: responsiveWidth(5), aspectRatio: 1, }}
            >
              <Image source={imagePath.Shear} />
            </Pressable>

          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: hp(30) }} size="large" color={C.primary} />
          ) : (
            <>
              <Card style={{ padding: 0, borderColor: colors.gray }}>
                <View style={{ padding: responsiveWidth(3), flexDirection: 'row', gap: responsiveWidth(3), alignItems: "center" }}>
                  <View style={s.avatar}>
                    {photo
                      ? <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
                      : <Text style={s.avatarText}>{initials}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: responsiveFontSize(3), fontWeight: '800', }} numberOfLines={1}>{name}</Text>
                    {!!location && <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: "500", color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{location}</Text>}
                  </View>
                  {/* {matchPct != null && Number(matchPct) >= 80 && (
                    <View style={s.badge}>
                      <View style={s.badgeDot} />
                      <Text style={s.badgeText}>Strong match</Text>
                    </View>
                  )} */}
                </View>
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.gray, paddingVertical: responsiveHeight(1.6) }}>
                  {matchPct != null && <Stat value={`${matchPct}%`} label="Match" divider />}
                  {!!experienceLabel && <Stat value={String(experienceLabel)} label="Experience" divider />}
                  <Stat value={formatApplied(app?.created_at)} label="Applied" />
                </View>
              </Card>

              {/* must-have questions */}
              {mustHave.length > 0 && (
                <>
                  <SectionTitle right={`${passedCount} of ${mustHave.length} passed`}>Must-have questions</SectionTitle>
                  <Card style={{ padding: 0 }}>
                    {mustHave.map((a: any, i: number) => {
                      const ok = a.passed ?? a.is_passed ?? true
                      return (
                        <View key={i} style={[s.qaRow, i > 0 && s.rowDivider]}>
                          <View style={[s.checkCircle, !ok && { backgroundColor: '#FDE8E7' }]}>
                            <Text style={{ color: ok ? C.primary : C.red, fontWeight: '700' }}>{ok ? '✓' : '✕'}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.question}>{a.question}</Text>
                            <Text style={s.answer}>{String(a.answer)}</Text>
                          </View>
                        </View>
                      )
                    })}
                  </Card>
                </>
              )}

              {/* screening answers */}
              {screening.length > 0 && (
                <>
                  <SectionTitle>Screening answers</SectionTitle>
                  <Card style={{ padding: 0 }}>
                    {screening.map((a: any, i: number) => (
                      <View key={i} style={[s.qaRow, i > 0 && s.rowDivider]}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.question}>{a.question}</Text>
                          <Text style={s.answer}>{String(a.answer)}</Text>
                        </View>
                        {typeof a.rating === 'number' && (
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {[1, 2, 3].map(n => (
                              <View key={n} style={[s.dot, n > a.rating && { backgroundColor: C.border }]} />
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {availabilities.length > 0 && (
                <>
                  <SectionTitle>Availability</SectionTitle>
                  <Card style={[s.chipWrap, { borderColor: colors.gray, }]}>
                    {availabilities.map((a: any) => (
                      <View key={a.id} style={[s.chip, { flexDirection: "row", gap: responsiveWidth(1), alignItems: 'center', backgroundColor: colors.primary50 }]}>
                        <View style={{ width: responsiveWidth(5), aspectRatio: 1, }}>
                          <Image source={imagePath.check} tintColor={colors.primary} style={{ height: "100%", width: "100%", resizeMode: 'contain' }} />
                        </View>
                        <Text style={[s.chipText, { color: colors.primary }]}>
                          {a.availability}</Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* video intro */}
              {!!videoUrl && (
                <>
                  <SectionTitle>Video intro</SectionTitle>
                  <Card style={s.mediaRow}>
                    <View style={s.videoThumb}>
                      <View style={s.playCircle}><Text style={{ color: C.navy, fontSize: 14 }}>▶</Text></View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.mediaTitle}>Video intro</Text>
                    </View>
                    <PillButton label="Play" onPress={() => Linking.openURL(videoUrl)} />
                  </Card>
                </>
              )}

              {/* portfolio */}
              {!!portfolio && (
                <>
                  <SectionTitle>Portfolio</SectionTitle>
                  <Card style={[s.mediaRow, { borderColor: colors.gray }]}>
                    <View style={s.iconBox}><Text style={{ color: C.primary, fontSize: 18 }}>🔗</Text></View>
                    <Text style={[s.mediaTitle, { flex: 1, fontWeight: '500' }]} numberOfLines={1}>
                      {portfolio.replace(/^https?:\/\//, '')}
                    </Text>
                    <PillButton
                      label="Open"
                      onPress={() => Linking.openURL(/^https?:\/\//.test(portfolio) ? portfolio : `https://${portfolio}`)}
                    />
                  </Card>
                </>
              )}

              {/* about */}
              {!!summary?.summary && (
                <>
                  <SectionTitle>{`About ${name.split(' ')[0]}`}</SectionTitle>
                  <Card style={{ borderColor: colors.gray }}><Text style={s.body}>{summary?.summary}</Text></Card>
                </>
              )}

              {skills.length > 0 && (
                <>
                  <SectionTitle>Skills</SectionTitle>
                  <View style={s.skillWrap}>
                    {skills.map((sk: string, i: number) => (
                      <View key={i} style={{ borderWidth: 1, borderColor: colors.gray, borderRadius: 8, paddingHorizontal: responsiveWidth(2), paddingVertical: responsiveHeight(.6) }}><Text style={{ fontSize: responsiveFontSize(1.8), color: colors.textSecondary }}>{sk}</Text></View>
                    ))}
                  </View>
                </>
              )}

              {/* experience */}
              {experience.length > 0 && (
                <>
                  <SectionTitle>Experience</SectionTitle>
                  <Card style={{ padding: 0, borderColor: colors.gray }}>
                    {experience.map((e: any, i: number) => (
                      <View key={i} style={[s.expRow, i > 0 && s.rowDivider]}>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', textTransform: "capitalize" }}>
                          {(e.job_title || e.title || e.position)}{(e.company || e.company_name) ? ` · ${e.company || e.company_name}` : ''}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(1.8), textTransform: "capitalize", fontWeight: "500", color: colors.textSecondary }}>
                          {[new Date(e.date_start).toLocaleDateString(), !e.date_end ? 'now' : new Date(e.date_end).toLocaleDateString()].filter(Boolean).join(' – ')}
                        </Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* education */}
              {education.length > 0 && (
                <>
                  <SectionTitle>Education</SectionTitle>
                  <Card style={{ padding: 0 }}>
                    {education.map((e: any, i: number) => (
                      <View key={i} style={[s.expRow, i > 0 && s.rowDivider]}>
                        <Text style={s.expTitle}>{e.degree_title}</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: "500", color: colors.textSecondary }}>
                          {[e.institution, e.date_completion].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* resume */}
              {!!resumeUrl && (
                <>
                  <SectionTitle>Resume</SectionTitle>
                  <Card style={[s.mediaRow, { borderColor: colors.gray }]}>
                    <View style={{ width: responsiveWidth(10), aspectRatio: 1, }}>
                      <Image source={require("./Document.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', }} numberOfLines={1}>{resumeName}</Text>
                      <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>PDF</Text>
                    </View>
                    {downloading
                      ? <ActivityIndicator color={colors.primary} />
                      : <PillButton
                        label="Open"
                        onPress={async () => {
                          setDownloading(true)
                          await downloadCV(resumeUrl)
                          setDownloading(false)
                        }}
                      />}
                  </Card>
                </>
              )}

              <View style={s.actionBar}>
                <View style={s.actionRow}>
                  <ActionBtn
                    label="Not a fit" icon="✕" color={C.red}
                    bg={C.card} border={status === 'rejected' ? C.red : C.border}
                    onPress={() => changeStatus('rejected')}
                  />
                  <ActionBtn
                    label="Shortlist" icon="⚑" color={C.green}
                    bg={C.greenSoft} border={status === 'shortlist' ? C.green : 'transparent'}
                    onPress={() => changeStatus('shortlist')}
                  />
                  <ActionBtn
                    label="Message" icon="✉" color={C.primary}
                    bg={C.primarySoft} border="transparent"
                    onPress={() => setMsgOpen(true)}
                  />
                </View>
                <TouchableOpacity
                  style={[s.hireBtn, { backgroundColor: colors.primary }]}
                  onPress={() => changeStatus('hired')}
                >
                  <Text style={s.hireText}>
                    {status === 'hired' ? 'Hired' : `Hire ${name.split(' ')[0]}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
        {/* message modal */}
        {msgOpen && (
          <KeyboardAvoidingView
            style={s.overlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => !sending && setMsgOpen(false)} />
            <View style={s.modal}>
              <Text style={{ fontSize: fs(2.2), fontWeight: '700', color: C.navy }}>Send message</Text>
              <Text style={[{ marginTop: responsiveHeight(2) }]}>Write your message to {name.split(' ')[0]}.</Text>
              <CustomTextInput
                value={msgText}
                onChangeText={setMsgText}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                editable={!sending}
                style={s.input}
              />
              <View style={{ flexDirection: 'row', gap: wp(3), marginTop: hp(2) }}>
                <Pressable disabled={sending} onPress={() => setMsgOpen(false)} style={[s.modalBtn, { borderWidth: 1, borderColor: C.border }]}>
                  <Text style={{ color: C.navy }}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={sending || msgText.trim().length < 2}
                  onPress={sendMessage}
                  style={[s.modalBtn, { backgroundColor: sending || msgText.trim().length < 2 ? '#B7C7FF' : C.primary }]}
                >
                  {sending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Send</Text>}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}

      </View>
    </NavigationBar >
  )
}

const ActionBtn = ({ label, icon, color, bg, border, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[s.actionBtn, { backgroundColor: bg, borderColor: border }]}>
    <Text style={{ color, fontSize: 20 }}>{icon}</Text>
    <Text style={{ color, fontSize: fs(1.5), fontWeight: '600', marginTop: 2 }}>{label}</Text>
  </TouchableOpacity>
)

const s = StyleSheet.create({

  scroll: { paddingHorizontal: wp(5), paddingBottom: hp(4) },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: responsiveWidth(4),
    overflow: 'hidden',
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: responsiveHeight(1) },
  sectionTitle: { fontSize: responsiveFontSize(2), fontWeight: '700', },
  sectionRight: { fontSize: fs(1.5), fontWeight: '700', color: C.primary },

  avatar: {
    width: wp(15), height: wp(15), borderRadius: 16, backgroundColor: C.primarySoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarText: { color: C.primary, fontWeight: '700', fontSize: fs(2) },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primarySoft,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start',
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  badgeText: { color: C.primary, fontSize: fs(1.4), fontWeight: '700' },

  statsRow: {},
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { borderRightWidth: 1, borderRightColor: C.border },
  statValue: { fontSize: responsiveFontSize(2.2), fontWeight: '800', },
  statLabel: { fontSize: responsiveFontSize(1.8), fontWeight: "600", marginTop: responsiveHeight(0.6) },

  qaRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3), paddingHorizontal: wp(4), paddingVertical: hp(1.6) },
  rowDivider: { borderTopWidth: 1, borderTopColor: C.border },
  checkCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  question: { fontSize: fs(1.7), color: C.navy },
  answer: { fontSize: fs(1.6), fontWeight: '700', color: C.primary, marginTop: 3 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: responsiveWidth(2), paddingVertical: responsiveHeight(.4), borderRadius: 8 },
  chipText: { fontSize: responsiveFontSize(1.8), textTransform: "capitalize", fontWeight: '700' },

  mediaRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  videoThumb: { width: wp(24), height: wp(15), borderRadius: 8, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  body: { fontSize: fs(1.7), lineHeight: fs(2.6), color: C.navy },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  expRow: { paddingHorizontal: wp(4), paddingVertical: hp(1.6) },

  actionBar: {
    paddingTop: responsiveHeight(3), paddingBottom: responsiveHeight(3), gap: responsiveHeight(1.2),
  },
  actionRow: { flexDirection: 'row', gap: wp(2.5) },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: responsiveHeight(1.2), borderRadius: 12, borderWidth: 1.5 },
  hireBtn: { borderRadius: 12, paddingVertical: responsiveHeight(1.7), alignItems: 'center' },
  hireText: { color: '#fff', fontSize: fs(2), fontWeight: '700' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: wp(5), zIndex: 999 },
  modal: { backgroundColor: '#fff', borderRadius: 18, padding: wp(5) },
  input: {
    marginTop: hp(1.5), borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: wp(4),
    height: hp(18), fontSize: fs(1.7), color: C.navy, backgroundColor: '#FAFBFE',
  },
  modalBtn: { flex: 1, paddingVertical: hp(1.2), borderRadius: 14, alignItems: 'center' },
})

export default CandidateProfile