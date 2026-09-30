import { Image, StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";
import { avatarFromUser } from "../utils/avatars";

type Props = {
  name: string;
  image?: string | null;
  id?: string;
  size?: number;
};

export function Avatar({ name, image, id, size = 48 }: Props) {
  const uri = image || avatarFromUser(id || name);

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
