import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Plus, Send, Download, Camera, LucideIcon } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');

interface Action {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
}

export function QuickActions() {
  const { colors, isDark } = useTheme();

  const actions: Action[] = [
    { title: 'Add Transaction', icon: Plus, onPress: () => console.log('Add') },
    { title: 'Send Money', icon: Send, onPress: () => console.log('Send') },
    { title: 'Scan Receipt', icon: Camera, onPress: () => console.log('Scan') },
    {
      title: 'Export Data',
      icon: Download,
      onPress: () => console.log('Export'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(300 + index * 50).springify()}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={action.onPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDark
                        ? colors.background
                        : colors.surface,
                    },
                  ]}
                >
                  <IconComponent size={20} color={colors.primary} />
                </View>
                <Text
                  style={[
                    styles.buttonText,
                    { color: isDark ? colors.background : colors.surface },
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    width: (width - 52) / 2.2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
