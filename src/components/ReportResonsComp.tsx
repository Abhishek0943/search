// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   Keyboard,
//   ScrollView,
// } from 'react-native';
// import { moderateScale, scale, verticalScale } from '../utils/scaling';
// import { createStyleSheet, useStyles } from 'react-native-unistyles';
// import TextContainer from './atoms/TextContainer';
// import ButtonContainer from './atoms/ButtonContainer';
// // import { Theme } from '../constants/theme';
// import fontFamily from '../constants/fontFamily';
// import imagePath from '../constants/imagePath';

// // Define the types for props and the report reason type
// interface ReportReason {
//   id: string;
//   content: string;
// }

// interface ReportReasonsCompProps {
//   reportReasons: ReportReason[]; // List of reasons to report
//   selectedReportReason: ReportReason | null; // Selected reason
//   reportReasonText: string; // Text input for "Other"
//   onUpdateState: (state: {
//     selectedReportReason?: ReportReason | null;
//     reportReasonText?: string;
//   }) => void; // Callback to update the state
//   onReportSubmit: () => void; // Callback for the Submit button
//   onSelectReacon: () => void; // Callback for the Submit button
//   isSubmitting: boolean; // Loader state for the button
// //   theme: Theme; // Theme object for styling
//   imagePath: {
//     ic_cricleDotActive: any; // Active radio button image source
//     ic_cricleDotInActive: any; // Inactive radio button image source
//   };
// }

// const stylesheet = createStyleSheet(theme => ({
//   textStyle: {
//     fontSize: scale(14),
//     lineHeight: scale(18),
//     fontFamily: fontFamily.regular,
//   },
//   commentText: {
//     fontSize: scale(14),
//     color: theme.colors.typography,
//     lineHeight: scale(18),
//   },
//   paymentMethod: {
//     fontSize: scale(16),
//     fontFamily: fontFamily.bold,
//     color: theme.colors.primary,
//   },
// }));

// const ReportReasonsComp: React.FC<ReportReasonsCompProps> = ({
//   reportReasons,
//   selectedReportReason,
//   reportReasonText,
//   onUpdateState,
//   onReportSubmit,
//   isSubmitting,
//   onSelectReacon
// //   imagePath,
// }) => {
//     const {theme, styles} = useStyles(stylesheet)
//   return (
//     <View style={{ flex: 1, padding: moderateScale(12) }}>
//       <ScrollView
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}>
//         <Text
//           style={{
//             ...styles.paymentMethod,
//             marginBottom: verticalScale(16),
//           }}
        
//         >Select a reason to report"</Text>

//         {reportReasons?.map(itm => (
//           <Pressable
//             key={itm.id}
//             onPress={() => {
//               onSelectReacon(itm);
//             }}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               marginVertical: verticalScale(8),
//             }}>
//             <View style={{ width: '15%' }}>
//               <Image
//                 source={
//                   selectedReportReason?.id === itm.id
//                     ? imagePath.ic_cricleDotActive
//                     : imagePath.ic_cricleDotInActive
//                 }
//                 style={{ width: moderateScale(24), height: moderateScale(24) }}
//                 resizeMode="contain"
//               />
//             </View>
//             <View style={{ width: '85%' }}>
//               <TextContainer
//                 numberOfLines={2}
//                 text={itm.content}
//                 style={{  ...styles.commentText, marginVertical: 0 }}
//               />
//             </View>
//           </Pressable>
//         ))}

//         {/* {selectedReportReason?.content === 'Other' ? (
//           <View
//             style={{
//               borderWidth: 2,
//               height: moderateScale(48),
//               justifyContent: 'center',
//               paddingHorizontal: moderateScale(10),
//               borderColor: theme.colors.backgroundImageColor,
//               borderRadius: moderateScale(16),
//             }}>
//             <TextInput
//               multiline
//               style={{
//                 ...styles.textStyle,
//                 color: theme.colors.typography,
//               }}
//               placeholderTextColor="#AAAAAA"
//               onChangeText={text => onUpdateState(text)}
//               value={reportReasonText}
//               placeholder="Type report..."
//               blurOnSubmit
//               onSubmitEditing={Keyboard.dismiss}
//             />
//           </View>
//         ) : null} */}

//         <ButtonContainer
//           disabled={isSubmitting}
//           isLoading={isSubmitting}
//           style={{ marginVertical: verticalScale(14) }}
//           onPress={onReportSubmit}
//           label="Submit"
//         />
//         <ButtonContainer
//       </ScrollView>
//     </View>
//   );
// };

// export default ReportReasonsComp;

import { View, Text } from 'react-native'
import React from 'react'

const ReportResonsComp = () => {
  return (
    <View>
      <Text>ReportResonsComp</Text>
    </View>
  )
}

export default ReportResonsComp