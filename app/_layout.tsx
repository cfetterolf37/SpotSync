import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { DailyDealsProvider } from "../contexts/DailyDealsContext";
import { VenueProvider, useVenues } from "../contexts/VenueContext";
import { WeatherProvider, useWeather } from "../contexts/WeatherContext";
import { securityService } from "../lib/security";

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
  const { user, loading: authLoading } = useAuth();
  const { loading: weatherLoading } = useWeather();
  const { loading: venueLoading } = useVenues();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [securityValidated, setSecurityValidated] = useState(false);

  // Validate security on app start
  useEffect(() => {
    try {
      securityService.validateEnvironment();
      setSecurityValidated(true);
      console.log('Security validation passed');
    } catch (error) {
      console.error('Security validation failed:', error);
      // In production, you might want to show an error screen
    }
  }, []);

  // Debug logging
  console.log('RootLayoutNav - user:', !!user, 'authLoading:', authLoading, 'weatherLoading:', weatherLoading, 'venueLoading:', venueLoading, 'showSplash:', showSplash, 'securityValidated:', securityValidated);

  // Show splash for minimum 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Splash timer completed');
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation when ready
  useEffect(() => {
    // Wait for auth to be ready, splash to finish, and security to be validated
    if (authLoading || showSplash || !securityValidated) {
      console.log('Still loading auth, showing splash, or security not validated');
      return;
    }

    console.log('Navigation ready - user:', !!user, 'segments:', segments);

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isVenueDetails = segments[0] === "venue-details";

    if (!user && !inAuthGroup) {
      console.log('Navigating to sign-in');
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      console.log('Navigating to tabs');
      router.replace("/(tabs)");
    } else if (user && !inTabsGroup && !inAuthGroup && !isVenueDetails) {
      console.log('User signed in but not in tabs or venue-details, navigating to tabs');
      router.replace("/(tabs)");
    } else {
      console.log('Navigation state is correct, no action needed');
    }
  }, [user, authLoading, segments, showSplash, securityValidated]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || showSplash) {
        console.log('Loading timeout - forcing navigation');
        setShowSplash(false);
        // Force navigation to a safe state
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/sign-in");
        }
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading, showSplash, user]);

  // Show splash while auth is loading or during minimum duration
  if (authLoading || showSplash || !securityValidated) {
    console.log('Showing splash screen');
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="venue-details" options={{ headerShown: false }} />
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
          <VenueProvider>
            <DailyDealsProvider>
              <RootLayoutNav />
            </DailyDealsProvider>
          </VenueProvider>
        </WeatherProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

