import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';




interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

    const clsx = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ');
    };

  return (
    <View className="mb-4 space-y-2">
      <Text className="text-nf-text font-inter-medium text-sm ml-1">{label}</Text>
      
      <View
        className={clsx(
          "flex-row items-center bg-nf-input rounded-xl border h-12 px-4 transition-all duration-200",
          isFocused ? "border-nf-primary" : "border-nf-border",
          error ? "border-nf-error" : ""
        
        )}
      >
        {icon && <View className="mr-3 opacity-70">{icon}</View>}

        <TextInput
          className="flex-1 text-white font-inter text-base h-full placeholder:text-nf-muted"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8892B0"
          secureTextEntry={!isPasswordVisible && secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="p-1">
            {isPasswordVisible ? (
              <EyeOff size={20} color="#8892B0" />
            ) : (
              <Eye size={20} color="#8892B0" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-nf-error text-xs ml-1 mt-1 font-inter">{error}</Text>
      )}
    </View>
  );
};