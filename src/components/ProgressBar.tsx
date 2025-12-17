import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { responsiveScreenHeight } from 'react-native-responsive-dimensions';

interface ProgressBarProps {
  /** 1-based current step */
  currentStep: number;
  /** total number of steps */
  totalSteps: number;
  /** bar height (defaults to 1% of screen height) */
  barHeight?: number;
  /** unfilled background color */
  backgroundColor?: string;
  /** filled part color */
  progressColor?: string;
  /** duration of the fill animation in ms */
  animationDuration?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  barHeight = responsiveScreenHeight(1),
  backgroundColor = '#E0E0E0',
  progressColor = '#0666FF',
  animationDuration = 500,
}) => {
  // ratio 0–1
  const ratio = totalSteps > 0 ? Math.min(currentStep / totalSteps, 1) : 0;

  // Animated value between 0 and 1
  const anim = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    // animate to new ratio whenever it changes
    Animated.timing(anim, {
      toValue: ratio,
      duration: animationDuration,
      useNativeDriver: false, // width cannot be driven natively
    }).start();
  }, [ratio, animationDuration, anim]);

  // interpolate to percent strings for width
  const widthInterpolated = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, height: barHeight, },
      ]}
    >
      <Animated.View
        style={[
          styles.filler,
          { width: widthInterpolated, backgroundColor: progressColor },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flex:1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  filler: {
    height: '100%',
    borderRadius: 100,
  },
});

export default ProgressBar;
