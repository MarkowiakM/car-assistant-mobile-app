import React, { FC, useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const SoundWave: FC<{ isRecording: boolean }> = ({ isRecording }) => {
  const animations = useRef(
    [...Array(20)].map(() => new Animated.Value(0)) // Create an array of Animated.Value objects for wave animation
  ).current;

  const backgroundColors = useRef(
    [...Array(20)].map(() => new Animated.Value(0)) // Create another array for background color interpolation
  ).current;

  useEffect(() => {
    if (isRecording) {
      const staggeredAnimations = animations.map((animation, index) =>
        Animated.timing(animation, {
          toValue: Math.sin(index * 0.3),
          duration: 800,
          delay: index * 40,
          useNativeDriver: false,
        })
      );

      const colorAnimations = backgroundColors.map((colorAnim, index) =>
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 800,
          delay: index * 40,
          useNativeDriver: false,
        })
      );

      Animated.loop(
        Animated.parallel([...staggeredAnimations, ...colorAnimations])
      ).start();
    } else {
      animations.forEach((animation) => animation.stopAnimation());
      backgroundColors.forEach((colorAnim) => colorAnim.stopAnimation());
    }
  }, [isRecording]);

  const interpolateScaleY = (animation: Animated.Value) =>
    animation.interpolate({
      inputRange: [-1, 1],
      outputRange: [0.4, 0.8],
    });

  const interpolateBackgroundColor = (colorAnim: Animated.Value) =>
    colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "rgba(172, 238, 246, 0.6)",
        "rgba(172, 238, 246, 1)",
      ],
    });

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        gap: 2,
        alignItems: "center",
      }}
    >
      {[...Array(20)].map((_, index) => (
        <Animated.View
          key={index}
          style={{
            width: 6,
            margin: 2,
            height: (Math.abs(3 - index % 6) + 1) * 50,
            borderRadius: 10,
            backgroundColor: interpolateBackgroundColor(backgroundColors[index]), // Interpolate background color
            transform: [
              {
                scaleY: interpolateScaleY(animations[index]), // Apply wave animation
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

export default SoundWave;
