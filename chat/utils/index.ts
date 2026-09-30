import Constants from "expo-constants";

const hostUri = Constants.expoConfig?.hostUri ?? "";

const lanHost = hostUri ? hostUri.split(":")[0] : "localhost";

/** Override with EXPO_PUBLIC_API_URL when needed (e.g. physical device on LAN). */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  `http://${lanHost}:3000`;

export const API_URL = `${API_BASE}/api`;
export const SOCKET_URL = API_BASE;
