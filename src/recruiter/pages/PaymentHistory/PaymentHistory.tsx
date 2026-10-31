import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth, responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions'
import { useAppDispatch } from '../../../store'
import { PaymentHistoryApi } from '../../../reducer/recruiterReducer'
import { EmptyComp } from '../OpenJobs/OpenJobs'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import RNFS from 'react-native-fs'
import { useNavigation } from '@react-navigation/native'
const downloadInvoice = async (
  invoiceUrl: string,
  fileName: string,
  setDownloadingId: (id: string | null) => void,
  id: string,
  setDownloadProgress: (progress: number) => void,
) => {
  try {
    setDownloadingId(id);
    setDownloadProgress(0);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const baseDir =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath;
    const destPath = `${baseDir}/${sanitizedFileName}`;

    const result = await RNFS.downloadFile({
      fromUrl: invoiceUrl,
      toFile: destPath,
      progressDivider: 1,
      begin: () => {
        setDownloadProgress(0);
      },
      progress: (res) => {
        let progressPercent = (res.bytesWritten / res.contentLength) * 100;
        setDownloadProgress(Math.round(progressPercent));
      }
    }).promise;

    if (result.statusCode === 200) {
      Alert.alert('Downloaded', 'Invoice saved to Downloads folder.');
    } else {
      Alert.alert('Error', 'Failed to download invoice.');
    }
  } catch (e: any) {
    console.log(e)
    if (e?.message !== 'User did not share') {
      Alert.alert('Error', 'Something went wrong while downloading.');
    }
  } finally {
    setDownloadingId(null);
    setDownloadProgress(0);
  }
};

const PaymentHistory = () => {
  const { colors } = useContext(ThemeContext);
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const [cvs, setCvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [meta, setMeta] = useState<any>()
  const [pages, setPages] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState('All')

  const onLoadMore = React.useCallback(() => {
    if (!meta?.last_page) return;
    if (meta?.current_page >= meta.last_page) return;
    setPages((p) => p + 1);
  }, [meta?.last_page, meta?.current_page]);

  useEffect(() => {
    dispatch(PaymentHistoryApi()).unwrap().then(res => {
      console.log('payment history', res)
      if (res.success !== false) {
        setCvs(res.data)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const renderFilterPill = (label: string) => {
    const isSelected = selectedFilter === label;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFilter(label)}
        style={{
          paddingHorizontal: responsiveWidth(4),
          paddingVertical: responsiveHeight(1),
          backgroundColor: isSelected ? colors.primary : '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isSelected ? colors.primary : '#E2E8F0',
          marginRight: responsiveWidth(2)
        }}
      >
        <Text style={{
          color: isSelected ? '#FFFFFF' : '#0F172A',
          fontWeight: '700',
          fontSize: responsiveFontSize(1.6)
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <NavigationBar navigationBar={false}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FAFAFA' }}
        contentContainerStyle={{
          paddingHorizontal: responsiveScreenWidth(5),
          paddingTop: responsiveScreenHeight(2),
          paddingBottom: responsiveScreenHeight(5),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* <TouchableOpacity style={{ marginBottom: responsiveHeight(2) }} onPress={() => navigation.goBack()}>
          <Image source={imagePath.backIcon} style={{ width: 24, height: 24, tintColor: '#0F172A' }} />
        </TouchableOpacity> */}

        <Text style={{ fontSize: responsiveFontSize(3.5), fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>
          Payment history
        </Text>
        <Text style={{ fontSize: responsiveFontSize(1.8), color: '#64748B', fontWeight: '500', marginBottom: responsiveHeight(3) }}>
          Every invoice, receipt and refund.
        </Text>

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: responsiveWidth(5),
          borderWidth: 1,
          borderColor: '#E2E8F0',
          marginBottom: responsiveHeight(3)
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: responsiveFontSize(1.6), color: '#64748B', fontWeight: '500', marginBottom: 4 }}>
                Paid this financial year
              </Text>
              <Text style={{ fontSize: responsiveFontSize(3), fontWeight: '800', color: '#0F172A' }}>
                {cvs.total?.currency} {cvs.total?.amount}
              </Text>

            </View>
            <View style={{ backgroundColor: '#EDF4FC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: responsiveFontSize(1.6) }}>
                {cvs?.total?.count}  paid
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(2) }}>
          <View style={{ flexDirection: 'row' }}>
            {renderFilterPill('All')}
            {renderFilterPill('2026')}
            {renderFilterPill('2025')}
          </View>

        </View>

        {loading ? (
          <View style={{ marginTop: responsiveScreenHeight(10), alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={cvs.payments}
            ListEmptyComponent={() => <EmptyComp />}
            style={{ marginBottom: responsiveScreenHeight(3) }}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              const invoiceId = `INV-2026-00${31 - index}`; // Mock ID
              const isRefunded = item.package_title?.toLowerCase().includes('refund') || item.package_price?.includes('-');
              return (
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  marginBottom: responsiveHeight(2),
                  overflow: 'hidden'
                }}>
                  <View style={{ padding: responsiveWidth(4), flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: '#EDF4FC',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: responsiveWidth(4)
                    }}>
                      <Image source={imagePath.application} style={{ width: 24, height: 24, tintColor: colors.primary }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#0F172A' }}>
                          {item.package_title || 'Plan'}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#0F172A' }}>
                          {item.package_price || 'AUD 0.00'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B', fontWeight: '500' }}>
                          {invoiceId} · {item.start_date || 'Date'}
                        </Text>
                        <View style={{
                          backgroundColor: isRefunded ? '#FEF3C7' : '#EDF4FC',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4
                        }}>
                          <Text style={{ color: isRefunded ? '#D97706' : colors.primary, fontSize: responsiveFontSize(1.2), fontWeight: '800' }}>
                            {isRefunded ? 'Refunded' : 'Paid'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={{ height: 1, backgroundColor: '#E2E8F0', width: '100%' }} />

                  <View style={{ padding: responsiveWidth(4), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B', fontWeight: '500' }}>
                      {item.payment_method || 'Visa 4242'} · {item.job_quota || '0'} postings
                    </Text>
                    {item.invoice_url ? (
                      <TouchableOpacity
                        disabled={!!downloadingId}
                        onPress={() => downloadInvoice(
                          item.invoice_url,
                          `invoice_${invoiceId}.pdf`,
                          setDownloadingId,
                          String(item.id ?? item.invoice_url),
                          setDownloadProgress,
                        )}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#F8FAFC',
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8
                        }}
                      >
                        {downloadingId === String(item.id ?? item.invoice_url) ? (
                          <ActivityIndicator size={12} color={colors.primary} style={{ marginRight: 6 }} />
                        ) : (
                          <Image source={require('./downlod.png')} style={{ width: 12, height: 12, tintColor: colors.primary, marginRight: 6 }} />
                        )}
                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.4), fontWeight: '700' }}>
                          {downloadingId === String(item.id ?? item.invoice_url) ? `${downloadProgress}%` : 'Download PDF'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#F8FAFC',
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8
                        }}
                      >
                        <Image source={imagePath.application} style={{ width: 12, height: 12, tintColor: colors.primary, marginRight: 6 }} />
                        <Text style={{ color: colors.primary, fontSize: responsiveFontSize(1.4), fontWeight: '700' }}>Download PDF</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            }}
          />
        )}
        {/* <View style={{ marginBottom: responsiveHeight(3) }}>
          <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#0F172A', marginBottom: responsiveHeight(1.5) }}>
            Payment method
          </Text>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            padding: responsiveWidth(4),
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#0F172A',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 6,
              marginRight: responsiveWidth(4)
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: responsiveFontSize(1.6), letterSpacing: 1 }}>VISA</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#0F172A' }}>
                Visa ending 4242
              </Text>
              <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B', fontWeight: '500', marginTop: 2 }}>
                Expires 09 / 28 · default card
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: responsiveFontSize(1.8) }}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}
        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#94A3B8', fontWeight: '500', lineHeight: 20 }}>
          Invoices are emailed to accounts@rozamexicano.com.au{'\n'}Change this in Business details.
        </Text>

      </ScrollView>
    </NavigationBar>
  )
}

export default PaymentHistory
