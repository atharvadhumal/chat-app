import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { Colors } from "../constants/colors";
import { EmptyState } from "../components/EmptyState";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotificationQueries";
import { useOpenChat } from "../hooks/useChatQueries";
import type { AppNotification } from "../services/notification.service";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function NotificationsScreen() {
  const { data: notifications = [], isLoading, refetch, isRefetching } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const openChat = useOpenChat();

  const onPress = async (item: AppNotification) => {
    if (!item.read) markRead.mutate(item.id);

    const data = (item.data || {}) as Record<string, string>;

    if (item.type === "MESSAGE" && data.conversationId) {
      router.replace({
        pathname: "/chat/[id]",
        params: { id: data.conversationId },
      });
      return;
    }

    if (item.type === "FRIEND_REQUEST" || item.type === "FRIEND_ACCEPTED") {
      if (data.fromUserId && item.type === "FRIEND_ACCEPTED") {
        try {
          const conversation = await openChat.mutateAsync(data.fromUserId);
          router.replace({
            pathname: "/chat/[id]",
            params: {
              id: conversation.id,
              name: data.fromUserName,
              otherUserId: data.fromUserId,
            },
          });
          return;
        } catch {
          // fall through
        }
      }
      router.replace("/(tabs)/discover");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={() => markAll.mutate()} hitSlop={10}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <ActivityIndicator
          color={Colors.textPrimary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : styles.list
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, !item.read && styles.unread]}
              onPress={() => onPress(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="You're all caught up"
              subtitle="Friend requests and messages will show up here."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  markAll: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  unread: {
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceElevated,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  time: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
