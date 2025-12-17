import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Pressable, Image } from 'react-native';
import { responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Video from 'react-native-video';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import imagePath from '../constants/imagePath.js';
import convertToProxyURL from 'react-native-video-cache';
import { setMuteVideo } from '../reducer/jobsReducer.js';
import { useAppDispatch } from '../store';
import colors from '../styles/colors.js';

interface VideoPlayerProps {
  uri: string;
  isActive: boolean;
  onpressVideo: () => void;
}

const VIdeoComp: React.FC<VideoPlayerProps> = ({ uri, isActive, onpressVideo }) => {
  const playerRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isMuted = useSelector((state: any) => state.posts?.isMutedVideo || false);
  const isStoryPlaying = useSelector((state: any) => state.posts?.isStoryPlaying);
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setIsBuffering(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsBuffering(false);
    setLoading(false); // ✅ Ensure spinner hides
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsBuffering(false);
    setLoading(false); // ✅ Ensure spinner hides even on error
  }, []);

  const handleBuffer = useCallback(({ isBuffering }: { isBuffering: boolean }) => {
    setIsBuffering(isBuffering);
  }, []);

  const toggleMute = () => {
    dispatch(setMuteVideo(!isMuted));

  }
  // useEffect(() => {
  //   dispatch(setMuteVideo(false));
  //   return () => {
  //     dispatch(setMuteVideo(true));
  //   }
  // }, [])
  const shouldPause = !isActive || !isFocused || isStoryPlaying;
  const shouldMute = !isActive || isMuted || !isFocused;

  return (
    <>
      <Pressable onPress={onpressVideo} style={styles.container}>
        <Video
          ref={playerRef}
          source={{ uri: convertToProxyURL(uri) }}
          style={styles.video}
          resizeMode="contain"
          paused={shouldPause}
          muted={shouldMute}
          repeat
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          onBuffer={handleBuffer}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 30000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
          maxBitRate={2000000}
          selectedVideoTrack={{
            type: 'auto',
            value: 480,
          }}
        />
        {(loading || isBuffering) && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={toggleMute}
        style={styles.muteButton}>
        <Image
          style={styles.muteIcon}
          source={shouldMute ? imagePath.volumeInActive : imagePath.volumeActive}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: responsiveScreenHeight(50),
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.black
  },
  video: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  muteButton: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 100,
    bottom: responsiveScreenHeight(1),
    right: responsiveScreenWidth(2),
    padding: 6,
    zIndex: 99,
  },
  muteIcon: {
    tintColor: '#fff',
    height: responsiveScreenWidth(6),
    width: responsiveScreenWidth(6),
  },
});

export default React.memo(VIdeoComp);
