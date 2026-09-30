import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Avatar } from "./Avatar";
import type { DiscoverUser } from "../services/friend.service";

type Props = {
  user: DiscoverUser;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onMessage?: (userId: string) => void;
};

export function UserCard({
  user,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onMessage,
}: Props) {
  const actions = () => {
    switch (user.relationship) {
      case "FRIEND":
        return (
          <View style={styles.row}>
            <View style={styles.badge}>
              <Ionicons name="checkmark" size={14} color={Colors.success} />
              <Text style={styles.badgeText}>Friends</Text>
            </View>
            {onMessage && (
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => onMessage(user.id)}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={Colors.textPrimary}
                />
              </Pressable>
            )}
          </View>
        );
      case "REQUEST_SENT":
        return (
          <Pressable
            style={styles.ghostBtn}
            onPress={() =>
              user.friendRequestId && onCancelRequest(user.friendRequestId)
            }
          >
            <Text style={styles.ghostText}>Cancel</Text>
          </Pressable>
        );
      case "REQUEST_RECEIVED":
        return (
          <View style={styles.row}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                user.friendRequestId && onAcceptRequest(user.friendRequestId)
              }
            >
              <Text style={styles.primaryText}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.ghostBtn}
              onPress={() =>
                user.friendRequestId && onRejectRequest(user.friendRequestId)
              }
            >
              <Text style={styles.ghostText}>Reject</Text>
            </Pressable>
          </View>
        );
      default:
        return (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => onSendRequest(user.id)}
          >
            <Text style={styles.primaryText}>Add</Text>
          </Pressable>
        );
    }
  };

  return (
    <View style={styles.card}>
      <Avatar name={user.name} image={user.image} id={user.id} size={48} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
      </View>
      {actions()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  primaryText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: "700",
  },
  ghostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ghostText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  badgeText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "600",
  },
});
