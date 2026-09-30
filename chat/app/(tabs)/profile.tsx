import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../contexts/auth-context";
import { Avatar } from "../../components/Avatar";
import { useFriends } from "../../hooks/useFriendQueries";
import { useConversations, useOpenChat } from "../../hooks/useChatQueries";
import { useUnreadNotificationCount } from "../../hooks/useNotificationQueries";
import { userService } from "../../services/notification.service";
import { AvatarPickerModal } from "../../components/AvatarPickerModal";
import { useQueryClient } from "@tanstack/react-query";
import { USER_KEYS } from "../../hooks/useFriendQueries";
import { CHAT_KEYS } from "../../hooks/useChatQueries";

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
};

function MenuRow({ icon, label, value, onPress, danger, last }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && onPress && styles.rowPressed,
      ]}
    >
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? Colors.error : Colors.textPrimary}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut, updateAvatar } = useAuth();
  const queryClient = useQueryClient();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: conversations = [] } = useConversations();
  const { data: unread = 0 } = useUnreadNotificationCount();
  const openChat = useOpenChat();
  const [signingOut, setSigningOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const recentFriends = useMemo(() => friends.slice(0, 6), [friends]);

  const openFriendChat = async (friendId: string, friendName: string) => {
    try {
      const conversation = await openChat.mutateAsync(friendId);
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: conversation.id,
          name: friendName,
          otherUserId: friendId,
        },
      });
    } catch (error) {
      console.error("Failed to open chat:", error);
    }
  };

  const copyEmail = async () => {
    if (!user?.email) return;
    try {
      await Clipboard.setStringAsync(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  const onSaveAvatar = async (url: string) => {
    setSavingAvatar(true);
    const err = await updateAvatar(url);
    setSavingAvatar(false);
    if (err) {
      Alert.alert("Avatar", err);
      return;
    }
    setPickerOpen(false);
    queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
  };

  const onSignOut = () => {
    Alert.alert("Sign out", "You’ll need to sign in again to keep chatting.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await userService.clearPushToken();
          } catch {
            // ignore
          }
          await signOut();
          setSigningOut(false);
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={styles.avatarPress}
        >
          <View style={styles.avatarRing}>
            <Avatar
              name={user.name}
              image={user.image}
              id={user.id}
              size={104}
            />
            <View style={styles.onlineDot} />
            <View style={styles.editBadge}>
              <Ionicons name="sparkles" size={14} color={Colors.background} />
            </View>
          </View>
        </Pressable>
        <Text style={styles.name}>{user.name}</Text>
        <Pressable onPress={copyEmail} style={styles.emailRow} hitSlop={8}>
          <Text style={styles.email}>{user.email}</Text>
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={14}
            color={copied ? Colors.success : Colors.textMuted}
          />
        </Pressable>
        <Pressable
          style={styles.changeAvatarBtn}
          onPress={() => setPickerOpen(true)}
        >
          <Ionicons name="shuffle" size={14} color={Colors.textPrimary} />
          <Text style={styles.changeAvatarText}>Change avatar</Text>
        </Pressable>
        <View style={styles.chip}>
          <View style={styles.chipDot} />
          <Text style={styles.chipText}>Online</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Pressable
          style={styles.stat}
          onPress={() => router.push("/(tabs)/discover")}
        >
          <Text style={styles.statValue}>{friends.length}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </Pressable>
        <View style={styles.statDivider} />
        <Pressable
          style={styles.stat}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.statValue}>{conversations.length}</Text>
          <Text style={styles.statLabel}>Chats</Text>
        </Pressable>
        <View style={styles.statDivider} />
        <Pressable
          style={styles.stat}
          onPress={() => router.push("/notifications")}
        >
          <Text style={styles.statValue}>{unread}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <Pressable onPress={() => router.push("/(tabs)/discover")}>
            <Text style={styles.sectionAction}>
              {friends.length > 0 ? "See all" : "Find people"}
            </Text>
          </Pressable>
        </View>

        {friendsLoading ? (
          <ActivityIndicator color={Colors.textMuted} style={{ marginTop: 12 }} />
        ) : recentFriends.length === 0 ? (
          <Pressable
            style={styles.emptyFriends}
            onPress={() => router.push("/(tabs)/discover")}
          >
            <Ionicons name="people-outline" size={22} color={Colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptySubtitle}>
                Discover people and send a request to start chatting.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsRow}
          >
            {recentFriends.map((friend) => (
              <Pressable
                key={friend.id}
                style={styles.friendItem}
                onPress={() => openFriendChat(friend.id, friend.name)}
              >
                <Avatar
                  name={friend.name}
                  image={friend.image}
                  id={friend.id}
                  size={56}
                />
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.name.split(" ")[0]}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.addFriend}
              onPress={() => router.push("/(tabs)/discover")}
            >
              <View style={styles.addFriendCircle}>
                <Ionicons name="add" size={22} color={Colors.textPrimary} />
              </View>
              <Text style={styles.friendName}>Add</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <MenuRow
            icon="color-palette-outline"
            label="Change avatar"
            onPress={() => setPickerOpen(true)}
          />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            value={unread > 0 ? String(unread) : undefined}
            onPress={() => router.push("/notifications")}
          />
          <MenuRow
            icon="compass-outline"
            label="Discover people"
            onPress={() => router.push("/(tabs)/discover")}
          />
          <MenuRow
            icon="chatbubbles-outline"
            label="Your chats"
            value={
              conversations.length > 0
                ? String(conversations.length)
                : undefined
            }
            onPress={() => router.push("/(tabs)")}
            last
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <View style={styles.card}>
          <MenuRow
            icon="mail-outline"
            label="Email"
            value={user.email}
          />
          <MenuRow
            icon="log-out-outline"
            label={signingOut ? "Signing out…" : "Sign out"}
            onPress={signingOut ? undefined : onSignOut}
            danger
            last
          />
        </View>
      </View>

      <Text style={styles.footer}>Chat · private messaging</Text>
    </ScrollView>

    <AvatarPickerModal
      visible={pickerOpen}
      currentImage={user.image}
      name={user.name}
      userId={user.id}
      saving={savingAvatar}
      onClose={() => setPickerOpen(false)}
      onSave={onSaveAvatar}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  hero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 24,
  },
  avatarPress: {
    alignItems: "center",
  },
  avatarRing: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  onlineDot: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    marginTop: 16,
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emailRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  changeAvatarBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  changeAvatarText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  chip: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.online,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionAction: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  friendsRow: {
    gap: 14,
    paddingRight: 8,
    marginTop: 12,
  },
  friendItem: {
    width: 64,
    alignItems: "center",
    gap: 8,
  },
  friendName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    width: 64,
  },
  addFriend: {
    width: 64,
    alignItems: "center",
    gap: 8,
  },
  addFriendCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFriends: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 12,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowPressed: {
    backgroundColor: Colors.cardHover,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDanger: {
    backgroundColor: Colors.errorMuted,
    borderColor: "rgba(239,68,68,0.25)",
  },
  rowLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  rowLabelDanger: {
    color: Colors.error,
  },
  rowValue: {
    color: Colors.textMuted,
    fontSize: 12,
    maxWidth: 140,
  },
  footer: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
});
