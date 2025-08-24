import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { lightColors, darkColors } from '../theme/colors';

export const getModalStackOptions = (isDark: boolean): NativeStackNavigationOptions => {
    const colors = isDark ? darkColors : lightColors;
    return {
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        presentation: 'modal',
    };
};
