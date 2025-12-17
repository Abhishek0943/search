import { StyleSheet} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import {fonts, lightColors} from '../../constants/values';
const colors = lightColors;

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap:responsiveScreenWidth(5),
    paddingHorizontal: responsiveScreenWidth(2),
  },
  logoContainer: {
    height: responsiveScreenHeight(6),
  },
  logo: {
    objectFit: 'contain',
    height: '100%',
    width: responsiveScreenWidth(54),
    alignSelf:"flex-start"
  },
  iconContainer: {
    height: responsiveScreenHeight(3),
    flex: 1,
    alignItems: 'flex-end',
  },
  icon: {
    objectFit: 'contain',
    height: '100%',
    aspectRatio: 1,
    margin: 'auto',
  },
  tabContainer: {
    width: 'auto',
    margin: 'auto',
    marginBottom: responsiveScreenHeight(1),
    borderBottomColor:'#D3D3D3',
    borderBottomWidth: 0.5
  },
  flatlist: {
    flexGrow: 0,
    gap: responsiveScreenHeight(1.5),
  },
  flatlistGap: {
    gap: responsiveScreenHeight(1.5),
  },
  scrollContainer: {
    marginHorizontal: responsiveScreenWidth(2.5),
    marginBottom: responsiveScreenHeight(1),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: responsiveScreenHeight(1)
  },
  sectionTitle: {
    fontFamily: fonts.poppinsM,
    width: '50%',
    fontSize: responsiveScreenFontSize(2),
    color: colors.maintext,
  },
  seeAll: {
    fontFamily: fonts.poppins,
    fontSize: responsiveScreenFontSize(1.8),
    textAlign: 'right',
    color: colors.secondaryText,
  },
  loadingTitle: {
    borderRadius: 10,
    width: '30%',
  },
  loadingMore: {
    borderRadius: 10,
    width: '20%',
  },
  flatlistLoading: {
    // paddingTop: responsiveScreenHeight(3),
    flexGrow: 0,
  },
  flatlistGapLarge: {
    gap: responsiveScreenHeight(.2),
  },
});

export const homeStyle2 = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveScreenWidth(0.5),
  },
  metaText: {
   fontWeight:"600",
    fontSize: responsiveScreenFontSize(2),
    textTransform:"capitalize"
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
  },
});
