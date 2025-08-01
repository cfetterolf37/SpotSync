import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { WeatherProvider } from "../contexts/WeatherContext";

const { width, height } = Dimensions.get('window');

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Image 
        source={require('../assets/images/SpotSyncSplash.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </View>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash for minimum 1 second (faster than 2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation when ready
  useEffect(() => {
    if (loading || showSplash) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, showSplash]);

  // Show splash while loading or during minimum duration
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashImage: {
    width: width,
    height: height,
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WeatherProvider>
          <RootLayoutNav />
        </WeatherProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

