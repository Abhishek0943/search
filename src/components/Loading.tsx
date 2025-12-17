import React from "react";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { Animated, StyleProp,  ViewStyle } from "react-native";
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)
type LoadingProps = {
    style?: StyleProp<ViewStyle>;
  };
const Loading =  ({ style }: LoadingProps) => {
    const avatarRef = React.useRef<any>()
    React.useEffect(() => {
      if (!avatarRef.current?.getAnimated) return
      const facebookAnimated = Animated.stagger(
        400,
        [
          avatarRef?.current?.getAnimated(),
        ]
      );
      Animated.loop(facebookAnimated).start();
    }, [avatarRef])
    return (
      <>
        <ShimmerPlaceholder
          ref={avatarRef}
          stopAutoRun
          style={[ { borderRadius: 8 },style]}
        />
      </>
    )
  }
  export default Loading