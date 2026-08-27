import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../contexts/auth-context";
import {authClient} from '../../utils/auth-client'


const HomeScreen = () => {
  const { signOut } = useAuth();

  const pingBackend = async () => {
    const res = await fetch("http://localhost:3000");
    const data = await res.text();
    console.log(data);

  };

  return (
    <View>
      <Pressable onPress={() => signOut()}>
        <Text>Sign out</Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "black",
  },
});
