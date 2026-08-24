import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

const CustomTextInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const { onChangeText, ...rest } = props;
  const handleChangeText = (text: string) => {
    // Regex to remove emojis
    const noEmojiText = text.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25B6}\u{23F8}-\u{23FA}]/gu,
      ''
    );
    if (onChangeText) {
      onChangeText(noEmojiText);
    }
  };

  return (
    <TextInput
      ref={ref}
      contextMenuHidden={true} // Disables copy/paste
      {...rest}
      onChangeText={handleChangeText}
    />
  );
});

export default CustomTextInput;
