import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getStrength(password);
  
  const barStyle = useAnimatedStyle(() => {
    const colors = ['#334155', '#EF4444', '#F59E0B', '#10B981', '#64FFDA']; // Gray, Red, Orange, Green, Teal
    return {
      width: withTiming(`${(strength / 4) * 100}%`, { duration: 300 }),
      backgroundColor: withTiming(colors[strength] || '#334155')
    };
  });

  const Requirement = ({ label, met }: { label: string; met: boolean }) => (
    <View className="flex-row items-center gap-1.5 mb-1 mr-3">
      <View className={`w-4 h-4 rounded-full items-center justify-center ${met ? 'bg-[#64FFDA]' : 'bg-white/10'}`}>
        {met && <Check size={10} color="#0A192F" strokeWidth={4} />}
      </View>
      <Text className={`text-xs ${met ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>
        {label}
      </Text>
    </View>
  );

  return (
    <View className="mt-2">
      {/* Animated Bar */}
      <View className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 w-full">
        <Animated.View style={[{ height: '100%' }, barStyle]} />
      </View>
      
      {/* Requirements List */}
      <View className="flex-row flex-wrap">
        <Requirement label="8+ Chars" met={password.length >= 8} />
        <Requirement label="Uppercase" met={/[A-Z]/.test(password)} />
        <Requirement label="Number" met={/[0-9]/.test(password)} />
        <Requirement label="Symbol" met={/[^A-Za-z0-9]/.test(password)} />
      </View>
    </View>
  );
};