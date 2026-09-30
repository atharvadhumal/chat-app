import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiscoverUser, friendService } from "../services/friend.service";

export const USER_KEYS = {
  all: ["users"] as const,
  discover: (search: string) => [...USER_KEYS.all, "discover", search] as const,
  friends: () => [...USER_KEYS.all, "friends"] as const,
};

function patchDiscoverCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (users: DiscoverUser[]) => DiscoverUser[],
) {
  queryClient.setQueriesData(
    { queryKey: USER_KEYS.all },
    (old: DiscoverUser[] | undefined) => {
      if (!Array.isArray(old)) return old;
      return updater(old);
    },
  );
}

export function useDiscoverUsers(search: string) {
  return useQuery({
    queryKey: USER_KEYS.discover(search),
    queryFn: () => friendService.discoverUsers(search),
  });
}

export function useFriends() {
  return useQuery({
    queryKey: USER_KEYS.friends(),
    queryFn: () => friendService.getFriends(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiverId: string) =>
      friendService.sendFriendRequest(receiverId),
    onMutate: async (receiverId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: USER_KEYS.all });
      patchDiscoverCaches(queryClient, (users) =>
        users.map((user) =>
          user.id === receiverId
            ? { ...user, relationship: "REQUEST_SENT" }
            : user,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSuccess: (data, receiverId) => {
      patchDiscoverCaches(queryClient, (users) =>
        users.map((user) =>
          user.id === receiverId
            ? {
                ...user,
                relationship: "REQUEST_SENT",
                friendRequestId: data.id ?? data.friendRequestId,
              }
            : user,
        ),
      );
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      friendService.acceptFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: USER_KEYS.all });
      patchDiscoverCaches(queryClient, (users) =>
        users.map((user) =>
          user.friendRequestId === requestId
            ? { ...user, relationship: "FRIEND" }
            : user,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      friendService.rejectFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: USER_KEYS.all });
      patchDiscoverCaches(queryClient, (users) =>
        users.map((user) =>
          user.friendRequestId === requestId
            ? { ...user, relationship: "NONE", friendRequestId: null }
            : user,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      friendService.cancelFriendRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: USER_KEYS.all });
      patchDiscoverCaches(queryClient, (users) =>
        users.map((user) =>
          user.friendRequestId === requestId
            ? { ...user, relationship: "NONE", friendRequestId: null }
            : user,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}
