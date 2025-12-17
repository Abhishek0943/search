import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
// import { height, moderateScale } from '../utils/scaling';

const {height} = Dimensions.get('window');

type CustomModalProps = {
  renderModalContent?: () => React.ReactNode;
  onBackdropPress?: () => void;
  isVisible?: boolean;
  mainViewStyle?: ViewStyle;
};

const CustomModal: React.FC<CustomModalProps> = ({
  renderModalContent = () => null,
  onBackdropPress = () => {},
  isVisible = false,
  mainViewStyle = {},
}) => {
  return (
    <ReactNativeModal
      onBackdropPress={onBackdropPress}
      isVisible={isVisible}
      style={{
        margin: 0,
        justifyContent: 'flex-end',
        // marginBottom: keyboardHeight,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{
            height: height / 2.5,
            borderTopLeftRadius:  16,
            borderTopRightRadius:16,
            // backgroundColor:'#2E2E2E',
            backgroundColor:'#fff',
            ...mainViewStyle,
          }}
        >
          {renderModalContent()}
        </View>
      </KeyboardAvoidingView>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({});

export default React.memo(CustomModal);