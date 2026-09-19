import { StyleSheet } from 'react-native';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';

/**
 * Shared styles for all Auth-flow screens:
 * Login, CompLogin, Signup, CompSingUp, ForgotPassword, Details, ProfileCompelete
 */
const authStyles = StyleSheet.create({
    /** Full-screen container used by most auth screens */
    container: {
        flex: 1,
        paddingBottom: responsiveHeight(2),
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(5),
    },

    /** Full-size background image (height/width 100%) */
    bgImage: {
        height: '100%',
        width: '100%',
    },

    /** Background image with contain resize */
    bgImageContain: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },

    /** Background image with cover resize */
    bgImageCover: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
    },

    /** Back button (left angle) */
    backButton: {
        width: responsiveWidth(2.8),
        aspectRatio: 1 / 2,
    },

    /** Header row: back button + step text */
    stepHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(4),
    },

    /** Progress bar container */
    stepBarRow: {
        width: responsiveWidth(90),
        marginTop: responsiveHeight(2),
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(1.5),
        marginBottom: responsiveHeight(1),
    },

    /** Individual progress bar segment */
    stepBarSegment: {
        flex: 1,
        height: 5,
        borderRadius: 2,
    },

    /** Divider wrapper (full-width Pressable) */
    dividerWrapper: {
        width: responsiveWidth(100),
        marginTop: responsiveHeight(2.5),
        aspectRatio: 350 / 1,
        position: 'relative',
        right: responsiveWidth(5),
    },

    /** Divider wrapper with vertical margin */
    dividerWrapperVertical: {
        width: responsiveWidth(100),
        marginVertical: responsiveHeight(2.5),
        aspectRatio: 350 / 1,
        position: 'relative',
        right: responsiveWidth(5),
    },

    /** Section label (e.g. "Logo", "Workplace photos") */
    sectionLabel: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '700',
    },

    /** Section label row with baseline alignment */
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: responsiveWidth(1),
        marginBottom: responsiveHeight(0.5),
        marginTop: responsiveHeight(1),
    },

    /** Dashed input row (phone, text, upload) */
    dashedInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 15,
        borderStyle: 'dashed',
        height: responsiveHeight(6),
        paddingHorizontal: responsiveWidth(4),
        marginBottom: responsiveHeight(1),
    },

    /** Social login buttons row */
    socialRow: {
        flexDirection: 'row',
        marginTop: responsiveHeight(2.5),
        gap: responsiveWidth(3),
        width: responsiveWidth(90),
    },

    /** Social button (Google / Apple) */
    socialButton: {
        flex: 1,
        aspectRatio: 169 / 56,
    },

    /** Switch to Employer/Employee link */
    switchLink: {
        width: responsiveWidth(90),
        marginTop: responsiveHeight(2.5),
        aspectRatio: 350 / 66,
    },

    /** "New to SearchTalents?" row */
    createAccountRow: {
        marginTop: responsiveHeight(2),
        flexDirection: 'row',
        justifyContent: 'center',
    },

    /** Keep me logged in row */
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveWidth(2),
        marginBottom: responsiveHeight(3),
    },

    /** Checkbox icon */
    checkboxIcon: {
        width: responsiveWidth(4),
        aspectRatio: 1 / 1,
    },

    /** Step number text */
    stepNumberText: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: '800',
    },

    /** Step title text */
    stepTitleText: {
        lineHeight: responsiveFontSize(2.6),
        fontSize: responsiveFontSize(3),
        fontWeight: '800',
    },

    /** Body / description text */
    bodyText: {
        lineHeight: responsiveFontSize(2.6),
        fontSize: responsiveFontSize(1.9),
        fontWeight: '600',
    },

    /** Upload area pressable */
    uploadArea: {
        width: '100%',
        aspectRatio: 350 / 98,
    },

    /** Divider image for login screens (shorter ratio) */
    loginDivider: {
        width: responsiveWidth(90),
        marginTop: responsiveHeight(2.5),
        aspectRatio: 350 / 16,
    },

    /** Eye icon for password toggle */
    eyeIcon: {
        width: responsiveWidth(2.8),
        aspectRatio: 20 / 11.4,
    },

    /** Spacer / flex-1 view */
    flex1: {
        flex: 1,
    },
});

export default authStyles;
