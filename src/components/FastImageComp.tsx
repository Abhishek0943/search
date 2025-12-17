import React, { memo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image'

interface CachedImageProps extends Omit<FastImageProps, 'source'> {
  uri: string;
  placeholder?: React.ReactNode;
  loaderSize?: 'small' | 'large';
  loaderColor?: string;
  style?: ImageStyle;
  containerStyle?:ViewStyle;
  resizeMode?:string
}

const FastImageComp: React.FC<CachedImageProps> = ({
  uri,
  placeholder,
  loaderSize = 'small',
  loaderColor = '#3FC2C2',
  style,
  containerStyle,
  resizeMode ,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);


  return (
    <View style={[styles.container, containerStyle]}>
      {/* {isLoading && (
        <View style={[styles.loaderContainer, style]}>
          {placeholder || (
            <ActivityIndicator size={loaderSize} color={loaderColor} />
          )}
        </View>
      )} */}
      <FastImage
        resizeMode={resizeMode ? resizeMode : FastImage.resizeMode.cover }
        onLoadStart={() => setIsLoading(true)}
        style={[StyleSheet.absoluteFill, style]}
        source={{ uri, priority: FastImage.priority.high }}
        onLoadEnd={() => setIsLoading(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
 
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#D9D9D9',
    overflow:'hidden',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});

export default memo(FastImageComp);



