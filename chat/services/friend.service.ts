import { apiFetch } from "../utils/api";

export type Relationship =
  | "NONE"
  | "FRIEND"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED";

export type DiscoverUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  relationship: Relationship;
  friendRequestId?: string | null;
};

export type FriendUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export const friendService = {
  getFriends: () => apiFetch("/friend/list") as Promise<FriendUser[]>,
  discoverUsers: (search = "") =>
    apiFetch(`/friend/discover?search=${encodeURIComponent(search)}`) as Promise<
      DiscoverUser[]
    >,
  sendFriendRequest: (receiverId: string) =>
    apiFetch("/friend/request", {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    }),
  acceptFriendRequest: (requestId: string) =>
    apiFetch(`/friend/request/id/${requestId}/accept`, { method: "POST" }),
  rejectFriendRequest: (requestId: string) =>
    apiFetch(`/friend/request/id/${requestId}/reject`, { method: "POST" }),
  cancelFriendRequest: (requestId: string) =>
    apiFetch(`/friend/request/id/${requestId}/cancel`, { method: "POST" }),
};
