import React from 'react';
import { Platform, View, Text } from 'react-native';
// Only import the community slider on Native to avoid web bundling issues
const RNCSlider =
  Platform.OS !== 'web'
    ? require('@react-native-community/slider').default
    : null;

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  label?: string;
}

export const NFSlider: React.FC<SliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  minimumTrackTintColor = '#009688',
  maximumTrackTintColor = '#D1D5DB',
  thumbTintColor = '#009688',
  label,
}) => {
  if (Platform.OS === 'web') {
    // High-performance standard HTML5 Range Input for Web
    // This avoids the findDOMNode crash entirely
    return (
      <View className="w-full py-2">
        {label && (
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </Text>
        )}
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: thumbTintColor,
            cursor: 'pointer',
          }}
        />
      </View>
    );
  }

  // Native Implementation (iOS/Android)
  return (
    <View className="w-full py-2">
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}
      <RNCSlider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        style={{ width: '100%', height: 40 }}
      />
    </View>
  );
};
