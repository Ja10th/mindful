import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay,
  interpolate,
  withRepeat
} from 'react-native-reanimated';
import { Heart, Sparkles, Moon } from 'lucide-react-native';

export default function LoadingScreen() {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Main heart animation
    scale.value = withSequence(
      withDelay(500, withSpring(1, { damping: 8 })),
      withDelay(1000, withSpring(1.1, { damping: 10 })),
      withSpring(1, { damping: 8 })
    );

    // Sparkles rotation
    rotation.value = withRepeat(
      withSpring(360, { duration: 3000 }),
      -1,
      false
    );

    // Text fade in
    opacity.value = withDelay(1500, withSpring(1));
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-gradient-to-br from-sage-50 to-lavender-50 items-center justify-center">
      <View className="relative items-center">
        {/* Sparkles */}
        <Animated.View style={sparkleStyle} className="absolute -top-4 -right-4">
          <Sparkles color="#bcb0ff" size={20} />
        </Animated.View>
        <Animated.View style={sparkleStyle} className="absolute -bottom-4 -left-4">
          <Sparkles color="#a3b5a3" size={16} />
        </Animated.View>
        
        {/* Main Heart Icon */}
        <Animated.View style={heartStyle}>
          <Heart color="#9d87ff" size={80} fill="#bcb0ff" />
        </Animated.View>
        
        {/* Moon decoration */}
        <View className="absolute -top-8 left-8">
          <Moon color="#cbd5e1" size={24} />
        </View>
      </View>
      
      <Animated.View style={textStyle} className="mt-12 items-center">
        <Text className="text-5xl font-bold text-calm-700 mb-2 text-white">Mindful</Text>
        <Text className="text-xs text-calm-500 text-center text-gray-200 px-8">
          Your pocket companion for daily reflection
        </Text>
        <Text className="text-sm text-calm-400 mt-4">
          Loading your peaceful space...
        </Text>
      </Animated.View>
    </View>
  );
}