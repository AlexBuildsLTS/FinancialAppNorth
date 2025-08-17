import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ColorScheme } from '@/theme/colors';

export const getClientStackScreenOptions = (colors: ColorScheme): NativeStackNavigationOptions => ({
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: 'bold',
  },
});