import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import type { Message } from "../services/chat.service";

type Props = {
  message: Message;
  isMine: boolean;
};

export function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.wrap, isMine ? styles.mine : styles.theirs]}>
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        <Text style={styles.text}>{message.content}</Text>
        <Text style={[styles.time, isMine && styles.timeMine]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    maxWidth: "82%",
  },
  mine: { alignSelf: "flex-end" },
  theirs: { alignSelf: "flex-start" },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: Colors.messageSent,
    borderColor: Colors.messageSentBorder,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: Colors.messageReceived,
    borderColor: Colors.messageReceivedBorder,
    borderBottomLeftRadius: 6,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textMuted,
    alignSelf: "flex-start",
  },
  timeMine: { alignSelf: "flex-end" },
});
