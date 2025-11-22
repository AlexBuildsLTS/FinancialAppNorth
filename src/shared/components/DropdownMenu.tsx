// src/components/common/DropdownMenu.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/shared/context/ThemeProvider';
type DropdownMenuProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export const DropdownMenu = ({ trigger, children }: DropdownMenuProps) => { 
  const { theme: { colors } } = useTheme();  
  
    const [isOpen, setIsOpen] = useState(false);    

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <View>
      <Pressable onPress={toggleMenu}>{trigger}</Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu}>
          <Animated.View
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
            style={[
              styles.dropdown,
              { backgroundColor: colors.surface, borderColor: colors.border },
              Platform.OS === 'web' && styles.dropdownWeb,
            ]}
          >
            {/* By wrapping children in a Pressable that does nothing, we prevent the modal from closing when tapping inside */}
            <Pressable>{children}</Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: 60, // Position below the header
    right: 16, // Align to the right
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownWeb: {
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  },
});