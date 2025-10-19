import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { useTheme } from '@/shared/context/ThemeProvider';

export default function CameraScreen() {
    const { colors } = useTheme();
    return (
        <ScreenContainer>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.text, { color: colors.text }]}>Camera Screen</Text>
                <Text style={[styles.subText, { color: colors.textSecondary }]}>This is a placeholder for the camera functionality.</Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
