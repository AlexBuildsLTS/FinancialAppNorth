import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Plus, Send, Camera, FileDown } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: React.ElementType;
  onPress: () => void;
}

export default function QuickActions() {
  const { colors } = useTheme();
  const styles = createStyles(colors, width);

  const actions: QuickAction[] = [
    {
      id: '1',
      title: 'Add Transaction',
      icon: Plus,
      onPress: () => console.log('Add Transaction'),
    },
    {
      id: '2',
      title: 'Send Money',
      icon: Send,
      onPress: () => console.log('Send Money'),
    },
    {
      id: '3',
      title: 'Scan Receipt',
      icon: Camera,
      onPress: () => console.log('Scan Receipt'),
    },
    {
      id: '4',
      title: 'Export Data',
      icon: FileDown,
      onPress: () => console.log('Export Data'),
    },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Animated.View
              key={action.id}
              entering={FadeInUp.delay(300 + index * 100)
                .duration(600)
                .springify()}
              style={styles.actionWrapper}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconComponent color={colors.surface} size={24} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const actionWidth = (screenWidth - 64) / 2; // Account for padding and gap
  
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    actionWrapper: {
      width: actionWidth,
    },
    actionButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      minHeight: 120,
      justifyContent: 'center',
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  });
};