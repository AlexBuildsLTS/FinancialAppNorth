import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';
import { Camera, RefreshCw, Check, AlertTriangle } from 'lucide-react-native';

export default function CameraScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const cameraRef = React.useRef<CameraView>(null);
  const router = useRouter();

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setCapturedImage(photo.uri);
      }
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
        // Navigate to a new screen to process the document
        router.push({
            pathname: '/process-document' as any,
            params: { imageUri: capturedImage }
        });
        // Reset for next time
        setCapturedImage(null);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <AlertTriangle color={colors.textSecondary} size={48} />
        <Text style={[styles.permissionText, { color: colors.text }]}>We need your permission to show the camera</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginTop: 16}} onPress={() => Linking.openSettings()}>
          <Text style={{color: colors.textSecondary}}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
        <ImageBackground source={{ uri: capturedImage }} style={styles.previewContainer}>
            <View style={styles.previewControls}>
                <TouchableOpacity style={styles.controlButton} onPress={() => setCapturedImage(null)}>
                    <RefreshCw color="#fff" size={32} />
                    <Text style={styles.controlButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleUsePhoto}>
                    <Check color="#fff" size={32} />
                    <Text style={styles.controlButtonText}>Use Photo</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Camera color={colors.primary} size={40} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 24,
    fontFamily: 'Inter-Regular',
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
});
