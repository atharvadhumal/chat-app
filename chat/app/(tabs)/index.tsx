import { useLayoutEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useConversations } from "../../hooks/useChatQueries";
import { useUnreadNotificationCount } from "../../hooks/useNotificationQueries";
import { ConversationRow } from "../../components/ConversationRow";
import { EmptyState } from "../../components/EmptyState";
import { ScreenLoader } from "../../components/Loader";

export default function ChatsScreen() {
  const navigation = useNavigation();
  const { data: conversations = [], isLoading, refetch, isRefetching } =
    useConversations();
  const { data: unread = 0 } = useUnreadNotificationCount();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/notifications")}
          style={styles.bell}
          hitSlop={12}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.textPrimary}
          />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ),
    });
  }, [navigation, unread]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.list
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() =>
                router.push({
                  pathname: "/chat/[id]",
                  params: {
                    id: item.id,
                    name: item.otherUser.name,
                    otherUserId: item.otherUser.id,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No conversations yet"
              subtitle="Find people on Discover, add them as friends, then start chatting."
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sep: {
    height: 1,
    backgroundColor: Colors.border,
  },
  bell: {
    marginRight: 4,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: "700",
  },
});
