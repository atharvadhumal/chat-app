import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "./index";

export const authClient = createAuthClient({
  baseURL: API_BASE,
  plugins: [
    expoClient({
      scheme: "chat",
      storagePrefix: "chat",
      storage: SecureStore,
    }),
  ],
});
