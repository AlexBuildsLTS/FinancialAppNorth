// shim.d.ts
declare module 'react-native-get-random-values';
declare module 'react-native-modal-datetime-picker';
declare module 'react-native-quick-crypto';
declare module 'react-native-reanimated';
declare module 'react-native-picker';   
declare module 'react-native-linear-gradient';
declare module 'react-native-svg-transformer';
declare module 'react-native-url-polyfill';
declare module 'react-native-gifted-charts';
declare module 'supabase';
declare module '@supabase/supabase-js';
declare module '@reactsvg';
declare module '@react-navigation/native' {
        import { Theme } from '@react-navigation/native';
        export function useTheme<T extends Theme = Theme>(): T;
}
declare module '@react-navigation/native-stack' {
    import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
    export type { NativeStackNavigationOptions };
}
declare module '@react-navigation/stack' {
    import { StackNavigationOptions } from '@react-navigation/stack';
    export type { StackNavigationOptions };
}
