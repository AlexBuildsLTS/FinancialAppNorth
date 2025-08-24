import { useEffect, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export function useFrameworkReady(): boolean {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // You can add other async tasks here if needed, like loading assets
    if (fontsLoaded) {
      setIsReady(true);
    }
  }, [fontsLoaded]);

  return isReady;
}