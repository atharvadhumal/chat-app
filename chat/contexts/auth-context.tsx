import { authClient } from "../utils/auth-client";
//import { useQueryClient } from "@tanstack/react-query";
import { AuthClient } from "better-auth/client";

import React, { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateAvatar: (image: string) => Promise<string | null>;
  getCookie: () => string | Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  updateAvatar: async () => null,
  getCookie: () => "",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isPending } = authClient.useSession();

  const isLoading = isPending;
  const session = data?.session;

  const user: AuthUser | null = data?.user
    ? {
        id: data?.user.id,
        name: data?.user.name,
        email: data?.user.email,
        image: data?.user?.image,
      }
    : null;

  const token = session?.token!;

  const signIn = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      console.log("Sign in response:", { data, error });

      if (error) {
        return error.message ?? "Sign in failed";
      }

      return null;
    } catch (error) {
      return "Sign in failed";
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const { generateRandomAvatar } = await import("../utils/avatars");
      const avatar = generateRandomAvatar();

      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: avatar.url,
      } as any);

      console.log("Sign up response:", { data, error });

      if (error) {
        return error.message ?? "Sign up failed";
      }

      // Ensure image is persisted even if sign-up payload ignored it
      try {
        const { userService } = await import("../services/notification.service");
        await userService.updateAvatar(avatar.url);
      } catch {
        // user may not be fully sessioned yet — ignore
      }

      return null;
    } catch (error) {
      return "Sign up failed";
    }
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  const updateAvatar = async (image: string): Promise<string | null> => {
    try {
      const { userService } = await import("../services/notification.service");
      await userService.updateAvatar(image);

      // Keep Better Auth session in sync when supported
      try {
        await authClient.updateUser({ image });
      } catch {
        // ignore — DB already updated
      }

      await authClient.getSession();
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Failed to update avatar";
    }
  };

  const getCookie = () => authClient.getCookie() ?? "";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateAvatar,
        getCookie,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
