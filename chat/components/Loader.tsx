import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { APP_NAME, APP_TAGLINE } from "../constants/app";

type DotsProps = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};

export function DotsLoader({ size = 8, color = Colors.textPrimary, style }: DotsProps) {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={[styles.dotsRow, { gap: size * 0.75 }, style]}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: dot,
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0, -size * 0.6],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

export function ScreenLoader() {
  return (
    <View style={styles.screen}>
      <DotsLoader />
    </View>
  );
}

export function AppLoader() {
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, pulse]);

  return (
    <View style={styles.app}>
      <Animated.View
        style={[
          styles.center,
          {
            opacity: fade,
            transform: [
              {
                translateY: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View style={[styles.logo, { transform: [{ scale: pulse }] }]}>
          <Ionicons name="chatbubbles" size={38} color={Colors.textPrimary} />
        </Animated.View>
        <Text style={styles.name}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
      </Animated.View>

      <Animated.View style={[styles.bottom, { opacity: fade }]}>
        <DotsLoader size={7} color={Colors.textSecondary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: Colors.background,
  },
  app: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 6,
    textTransform: "uppercase",
  },
  tagline: {
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 14,
  },
  bottom: {
    position: "absolute",
    bottom: 72,
  },
});
