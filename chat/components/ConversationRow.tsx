import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Avatar } from "./Avatar";
import type { Conversation } from "../services/chat.service";

type Props = {
  conversation: Conversation;
  onPress: () => void;
};

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationRow({ conversation, onPress }: Props) {
  const { otherUser } = conversation;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar
        name={otherUser.name}
        image={otherUser.image}
        id={otherUser.id}
        size={52}
      />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser.name}
          </Text>
          <Text style={styles.time}>
            {formatTime(conversation.lastMessageAt)}
          </Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {conversation.lastMessageText || "Say hello"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, minWidth: 0 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  preview: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
