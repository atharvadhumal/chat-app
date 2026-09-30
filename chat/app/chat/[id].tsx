import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { MessageBubble } from "../../components/MessageBubble";
import { EmptyState } from "../../components/EmptyState";
import { ScreenLoader } from "../../components/Loader";
import { useAuth } from "../../contexts/auth-context";
import { useSocket } from "../../contexts/socket-context";
import { useMessages, useSendMessage } from "../../hooks/useChatQueries";
import { chatService } from "../../services/chat.service";

export default function ChatThreadScreen() {
  const { id, name } = useLocalSearchParams<{
    id: string;
    name?: string;
    otherUserId?: string;
  }>();
  const conversationId = id!;
  const { user } = useAuth();
  const { joinConversation, leaveConversation, emitTyping, socket } =
    useSocket();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    joinConversation(conversationId);
    chatService.markRead(conversationId).catch(() => {});
    return () => leaveConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;
    const onTyping = (payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === user?.id) return;
      setTypingUser(payload.isTyping ? payload.userId : null);
    };
    socket.on("typing", onTyping);
    return () => {
      socket.off("typing", onTyping);
    };
  }, [socket, conversationId, user?.id]);

  const onChangeText = (value: string) => {
    setText(value);
    emitTyping(conversationId, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emitTyping(conversationId, false);
    }, 1200);
  };

  const onSend = async () => {
    const content = text.trim();
    if (!content || sendMessage.isPending) return;
    setText("");
    emitTyping(conversationId, false);
    try {
      await sendMessage.mutateAsync(content);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true }),
      );
    } catch {
      setText(content);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: name || "Chat",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        {isLoading ? (
          <ScreenLoader />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              messages.length === 0 ? styles.emptyList : styles.list
            }
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.senderId === user?.id}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="chatbubble-ellipses-outline"
                title="Start the conversation"
                subtitle="Messages appear here in realtime."
              />
            }
            ListFooterComponent={
              typingUser ? (
                <Text style={styles.typing}>typing…</Text>
              ) : (
                <View style={{ height: 8 }} />
              )
            }
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={onChangeText}
            multiline
          />
          <Pressable
            style={[
              styles.sendBtn,
              (!text.trim() || sendMessage.isPending) && styles.sendDisabled,
            ]}
            onPress={onSend}
            disabled={!text.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Ionicons name="arrow-up" size={20} color={Colors.background} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  typing: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 8,
    marginBottom: 4,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.35,
  },
});
