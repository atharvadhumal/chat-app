import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { UserCard } from "../../components/UserCard";
import { EmptyState } from "../../components/EmptyState";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDiscoverUsers,
  useFriends,
  useRejectFriendRequest,
  useSendFriendRequest,
} from "../../hooks/useFriendQueries";
import { useOpenChat } from "../../hooks/useChatQueries";
import { Avatar } from "../../components/Avatar";
import { ScreenLoader } from "../../components/Loader";

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"people" | "friends">("people");
  const debounced = useDebouncedValue(search, 350);

  const { data: users = [], isLoading, isFetching } = useDiscoverUsers(debounced);
  const { data: friends = [], isLoading: friendsLoading } = useFriends();

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const openChat = useOpenChat();

  const incoming = useMemo(
    () => users.filter((u) => u.relationship === "REQUEST_RECEIVED"),
    [users],
  );

  const openConversation = async (userId: string, name: string) => {
    try {
      const conversation = await openChat.mutateAsync(userId);
      router.push({
        pathname: "/chat/[id]",
        params: { id: conversation.id, name, otherUserId: userId },
      });
    } catch (error) {
      console.error("Failed to open chat:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email"
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isFetching ? (
          <ActivityIndicator size="small" color={Colors.textMuted} />
        ) : null}
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "people" && styles.tabActive]}
          onPress={() => setTab("people")}
        >
          <Text style={[styles.tabText, tab === "people" && styles.tabTextActive]}>
            People
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "friends" && styles.tabActive]}
          onPress={() => setTab("friends")}
        >
          <Text
            style={[styles.tabText, tab === "friends" && styles.tabTextActive]}
          >
            Friends ({friends.length})
          </Text>
        </Pressable>
      </View>

      {tab === "people" ? (
        isLoading && !users.length ? (
          <ScreenLoader />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              incoming.length > 0 ? (
                <Text style={styles.sectionLabel}>
                  Incoming requests · {incoming.length}
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onSendRequest={(id) => sendRequest.mutate(id)}
                onAcceptRequest={(id) => acceptRequest.mutate(id)}
                onRejectRequest={(id) => rejectRequest.mutate(id)}
                onCancelRequest={(id) => cancelRequest.mutate(id)}
                onMessage={(id) => openConversation(id, item.name)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="compass-outline"
                title="No people found"
                subtitle="Try another search, or invite friends to join."
              />
            }
          />
        )
      ) : friendsLoading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            friends.length === 0 ? styles.emptyList : styles.list
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.friendRow}
              onPress={() => openConversation(item.id, item.name)}
            >
              <Avatar
                name={item.name}
                image={item.image}
                id={item.id}
                size={48}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendEmail}>{item.email}</Text>
              </View>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={Colors.textSecondary}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No friends yet"
              subtitle="Send a few friend requests from the People tab."
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.borderLight,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  list: { paddingBottom: 28 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  friendName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  friendEmail: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
