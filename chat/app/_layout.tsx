import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/auth-context";
import { SocketProvider } from "../contexts/socket-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../utils/query-client";
import { useEffect, useState } from "react";
import { Colors } from "../constants/colors";
import { AppLoader } from "../components/Loader";
import { usePushNotifications } from "../hooks/usePushNotifications";

const MIN_LOADER_MS = 900;

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <StatusBar style="light" />
          <Layout />
        </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function Layout() {
  const { user, isLoading } = useAuth();
  usePushNotifications();
  const isLoggedIn = !!user;
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), MIN_LOADER_MS);
    return () => clearTimeout(id);
  }, []);

  if (isLoading || !minElapsed) {
    return <AppLoader />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "fade",
      }}
    >
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: true,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
