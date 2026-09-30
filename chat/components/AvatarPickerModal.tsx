import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import {
  generateAvatarOptions,
  generateRandomAvatar,
  type GeneratedAvatar,
} from "../utils/avatars";
import { Avatar } from "./Avatar";

type Props = {
  visible: boolean;
  currentImage?: string | null;
  name: string;
  userId: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
};

export function AvatarPickerModal({
  visible,
  currentImage,
  name,
  userId,
  saving,
  onClose,
  onSave,
}: Props) {
  const [options, setOptions] = useState<GeneratedAvatar[]>(() =>
    generateAvatarOptions(9),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const preview = useMemo(
    () => selected || currentImage || undefined,
    [selected, currentImage],
  );

  const reshuffle = () => {
    setOptions(generateAvatarOptions(9));
    setSelected(null);
  };

  const surprise = () => {
    const avatar = generateRandomAvatar();
    setSelected(avatar.url);
    setOptions((prev) => [avatar, ...prev.slice(0, 8)]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Choose avatar</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.previewWrap}>
            <Avatar
              name={name}
              image={preview}
              id={userId}
              size={96}
            />
            <Text style={styles.previewHint}>
              {selected ? "New look selected" : "Pick one or shuffle"}
            </Text>
          </View>

          <View style={styles.grid}>
            {options.map((item) => {
              const isActive = selected === item.url;
              return (
                <Pressable
                  key={`${item.style}-${item.seed}`}
                  style={[styles.cell, isActive && styles.cellActive]}
                  onPress={() => setSelected(item.url)}
                >
                  <Image source={{ uri: item.url }} style={styles.cellImage} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryBtn} onPress={reshuffle}>
              <Ionicons name="shuffle" size={16} color={Colors.textPrimary} />
              <Text style={styles.secondaryText}>Shuffle</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={surprise}>
              <Ionicons name="sparkles" size={16} color={Colors.textPrimary} />
              <Text style={styles.secondaryText}>Surprise</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.saveBtn, (!selected || saving) && styles.saveDisabled]}
            disabled={!selected || saving}
            onPress={() => selected && onSave(selected)}
          >
            {saving ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.saveText}>Save avatar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  previewWrap: {
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  previewHint: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  cell: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  cellActive: {
    borderColor: Colors.primary,
  },
  cellImage: {
    width: "100%",
    height: "100%",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.card,
  },
  secondaryText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: "700",
  },
});
