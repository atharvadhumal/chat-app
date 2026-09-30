import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/auth-context";
import { SocketProvider } from "../contexts/socket-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../utils/query-client";
import { Colors } from "../constants/colors";
import { ActivityIndicator, View } from "react-native";
import { usePushNotifications } from "../hooks/usePushNotifications";

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

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
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
