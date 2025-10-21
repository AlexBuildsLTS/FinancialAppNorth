import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

/**
 * Hook to load all critical app assets (like fonts) before rendering.
 * This is used in the root layout to prevent FOUT and manage splash screen.
 */
export function useFrameworkReady(): boolean {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    // Add other font weights as needed by the design
  });

  // In a real app, you might also load other assets here.
  // We can also log the fontError if it occurs.
  if (fontError) {
    console.error("Failed to load fonts:", fontError);
  }

  return fontsLoaded;
}