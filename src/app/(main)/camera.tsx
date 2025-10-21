import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { useTheme } from '@/shared/context/ThemeProvider';

export default function CameraScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [type, setType] = useState('back');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.getCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const requestPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setCapturedImage(photo.uri);
        }
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return (
            <ScreenContainer>
                <View style={styles.permissionContainer}>
                    <Text style={[styles.permissionText, { color: colors.text }]}>We need access to your camera to scan documents.</Text>
                    <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
                        <Text style={styles.controlText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    if (capturedImage) {
        return (
            <ScreenContainer>
                <Image source={{ uri: capturedImage }} style={styles.fullScreen} />
                <View style={styles.previewControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={() => setCapturedImage(null)}>
                        <Text style={styles.controlText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={() => Alert.alert('Image Saved', 'The image has been saved.')}>
                        <Text style={styles.controlText}>Use Photo</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <CameraView style={styles.fullScreen} facing={type as any} ref={cameraRef}>
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={() => {
                        setType(type === 'back' ? 'front' : 'back');
                    }}>
                        <MaterialIcons name="flip-camera-ios" size={36} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
                    <View style={{ width: 60 }} />{/* Placeholder for spacing */}
                </View>
            </CameraView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    fullScreen: {
        flex: 1,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    previewControls: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 5,
        borderColor: '#ccc',
    },
    controlButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        borderRadius: 10,
    },
    controlText: {
        color: 'white',
        fontSize: 18,
    },
});
