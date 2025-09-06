import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Correct import for modern Expo Camera
import { Flashlight, Zap, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

// Load uploadDocument at runtime to avoid top-level resolution/type errors in environments
// where the module path may not be available to the bundler at build time.
let uploadDocument: ((file: any, options?: { folder?: string }) => Promise<any>) | null = null;
if (typeof require !== 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
        const mod = require('@/services/documentService');
        uploadDocument = (mod && (mod.uploadDocument ?? mod.default ?? mod)) as typeof uploadDocument;
    } catch (e) {
        // module not available — keep uploadDocument as null and handle at call-site
    }
}

export default function CameraScreen() {
    const { colors } = useTheme();
    const { profile } = useAuth();
    const router = useRouter();
    const cameraRef = useRef<CameraView | null>(null); // Correctly typed ref for CameraView
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        if (!cameraRef.current || !profile) return;

        setIsUploading(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
            if (photo && photo.base64) {
                if (!uploadDocument) {
                    throw new Error('Upload module is not available.');
                }
                const fileName = `scan_${Date.now()}`;
                // pass base64 and folder option to match the service signature
                await uploadDocument(photo.base64, { folder: profile.id });
                Alert.alert('Success', 'Document uploaded and is now being processed.');
                router.back();
            } else {
                throw new Error('Failed to capture image data.');
            }
        } catch (error) {
            console.error('Failed to take or upload picture:', error);
            Alert.alert('Error', (error as Error).message ?? 'Could not upload the document. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };
    
    if (!permission) {
        return <View style={styles.permissionContainer}><ActivityIndicator color={colors.primary} /></View>;
    }
    
    if (!permission.granted) {
        return (
            <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>
                    We need your permission to show the camera.
                </Text>
                <TouchableOpacity onPress={requestPermission} style={[styles.permissionButton, {backgroundColor: colors.primary}]}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing='back'
                flash={flash}
            />
            
            {isUploading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.uploadingText}>Uploading & Processing...</Text>
                </View>
            )}

            <View style={styles.topControls}>
                <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                    {flash === 'on' ? <Zap color="white" size={24} /> : <Flashlight color="white" size={24} />}
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => router.back()} style={styles.controlButton}>
                    <X color="white" size={28} />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
                <TouchableOpacity 
                    onPress={takePicture} 
                    style={styles.captureButtonOuter} 
                    disabled={isUploading}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    permissionButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    uploadingText: { color: 'white', fontSize: 16, marginTop: 12, fontWeight: 'bold' },
    topControls: { position: 'absolute', top: 60, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, zIndex: 5 },
    bottomControls: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center', zIndex: 5 },
    controlButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 30 },
    captureButtonOuter: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.8)' },
    captureButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' },
});
