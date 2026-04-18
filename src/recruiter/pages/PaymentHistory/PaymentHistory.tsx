import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, Pressable, Alert, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NavigationBar } from '../../../components'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import { Header } from '../../../pages/Company/Company'
import { useAppDispatch } from '../../../store'
import { JobCandidates, PaymentHistoryApi } from '../../../reducer/recruiterReducer'
import { EmptyComp } from '../OpenJobs/OpenJobs'
import { ThemeContext } from '../../../context/ThemeProvider'
import imagePath from '../../../assets/imagePath'
import RNFS from 'react-native-fs'

const downloadInvoice = async (
  invoiceUrl: string,
  fileName: string,
  setDownloadingId: (id: string | null) => void,
  id: string,
) => {
  try {
    setDownloadingId(id);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const destPath = `${RNFS.DownloadDirectoryPath}/${sanitizedFileName}`;
    const result = await RNFS.downloadFile({
      fromUrl: invoiceUrl,
      toFile: destPath,
    }).promise;
    if (result.statusCode === 200) {
      Alert.alert('Downloaded', 'Invoice saved to Downloads folder.');
    } else {
      Alert.alert('Error', 'Failed to download invoice.');
    }
  } catch (e) {
    Alert.alert('Error', 'Something went wrong while downloading.');
  } finally {
    setDownloadingId(null);
  }
};

const PaymentHistory = () => {
  const { colors } = useContext(ThemeContext);

  const dispatch = useAppDispatch()
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [meta, setMeta] = useState()
  const [pages, setPages] = useState(1)
  const onLoadMore = React.useCallback(() => {
    // guard: agar last page aa chuka hai
    if (!meta?.last_page) return;
    if (meta?.current_page >= meta.last_page) return;
    setPages((p) => p + 1);
  }, [meta?.last_page, meta?.current_page]);
  useEffect(() => {
    dispatch(PaymentHistoryApi()).unwrap().then(res => {
      if (res.success !== false) {
        setCvs(res.data)
      }
      setLoading(false)
    })
  }, [])
  return (
    <NavigationBar navigationBar={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: responsiveScreenWidth(90),
          alignSelf: 'center',
          alignItems: 'center',
          paddingBottom: responsiveScreenHeight(3),
        }}
      >
        <Header title={"Payment History"} />
        {
          loading ? <View style={{ flex: 1, marginTop: responsiveScreenHeight(40) }}>
            <ActivityIndicator size={responsiveScreenFontSize(3)} style={{}} />
          </View> :
            <FlatList
              data={cvs}

              ListEmptyComponent={() => <EmptyComp />}
              style={{ marginBottom: responsiveScreenHeight(2) }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={{ marginVertical: 10, width: responsiveScreenWidth(90), backgroundColor: colors.lightGrayNatural, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(1.5), borderRadius: 10, position: "relative", gap: responsiveScreenHeight(2) }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Package Title</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.package_title}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Price</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.package_price}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Jobs Quota</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.job_quota}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Payment Method</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.payment_method}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Package Start Date</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.start_date}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2), fontWeight: "600" }}>Package End Date</Text>
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "400", color: colors.darkGrayNatural }}>{item?.end_date}</Text>
                  </View>
                  {/* <View style={{ borderRadius: 100, borderWidth: 1, borderColor: colors.primary, padding: 2, backgroundColor: colors.white, overflow: "hidden", height: responsiveScreenHeight(8), aspectRatio: 1, marginHorizontal: "auto" }}>
                    <Image source={{ uri: item.image || item.user.image }} style={{ borderRadius: 100, height: "100%", backgroundColor: "white", }} />
                  </View>
                  <Text style={{ textTransform: "capitalize", textAlign: "center", marginTop: responsiveScreenHeight(.5), fontSize: responsiveScreenFontSize(2), fontWeight: "700" }}>{item.name || item.user.name}</Text>
                  {
                    item.profile_summary &&
                    <Text numberOfLines={2} style={{ textAlign: "center", marginTop: responsiveScreenHeight(.5), color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>{item.profile_summary}</Text>
                  }
                  {
                    item.location &&
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: responsiveScreenWidth(.5), marginTop: responsiveScreenHeight(.5) }}>
                      <Image source={imagePath.location} style={{ transform: [{ scale: 0.8 }] }} />
                      <Text numberOfLines={1} style={{ textAlign: "center", color: colors.darkGray, fontSize: responsiveScreenFontSize(1.5), fontWeight: "500" }}>{item.location}</Text>
                    </View>
                  } */}

                  {item?.invoice_url && (
                    <TouchableOpacity
                      disabled={!!downloadingId}
                      onPress={() => downloadInvoice(
                        item.invoice_url,
                        `invoice_${item?.package_title ? `${item.package_title}_` : ''}${Date.now()}.pdf`,
                        setDownloadingId,
                        String(item?.id ?? item?.invoice_url),
                      )}
                      style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: responsiveScreenWidth(1.5), backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(0.8), borderRadius: 8, opacity: downloadingId === String(item?.id ?? item?.invoice_url) ? 0.7 : 1 }}
                    >
                      {downloadingId === String(item?.id ?? item?.invoice_url) ? (
                        <ActivityIndicator size={18} color="#fff" />
                      ) : (
                        <Image source={require('./downlod.png')} style={{ width: 18, height: 18, tintColor: '#fff' }} />
                      )}
                      <Text style={{ color: '#fff', fontSize: responsiveScreenFontSize(1.7), fontWeight: '600' }}>
                        {downloadingId === String(item?.id ?? item?.invoice_url) ? 'Downloading...' : 'Download Invoice'}
                      </Text>
                    </TouchableOpacity>
                  )}

                </View>
              )}
              onEndReachedThreshold={0.3}     // ✅ important
              onEndReached={onLoadMore}       // ✅
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            />
        }

      </ScrollView>
    </NavigationBar>
  )
}

export default PaymentHistory