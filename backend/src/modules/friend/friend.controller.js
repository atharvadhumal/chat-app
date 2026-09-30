import {
  acceptFriendRequest,
  cancelFriendRequest,
  discoverUsers,
  getFriendsDetailed,
  rejectFriendRequest,
  sendFriendRequest,
} from "./friend.service.js";
import { createNotificationAndPush } from "../../lib/push.js";
import { emitToUser } from "../../lib/socket.js";

export async function sendRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    const result = await sendFriendRequest(senderId, receiverId);

    const senderName = req.user.name || "Someone";

    const notification = await createNotificationAndPush({
      userId: receiverId,
      type: "FRIEND_REQUEST",
      title: "Friend request",
      body: `${senderName} sent you a friend request`,
      data: {
        requestId: result.id,
        fromUserId: senderId,
        fromUserName: senderName,
      },
    });

    emitToUser(receiverId, "friend_request_received", {
      ...result,
      from: {
        id: senderId,
        name: senderName,
        image: req.user.image ?? null,
      },
      notification,
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to send request" });
  }
}

export async function listFriends(req, res) {
  try {
    const userId = req.user.id;
    const data = await getFriendsDetailed(userId);
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to list friends" });
  }
}

export async function discover(req, res) {
  try {
    const userId = req.user.id;
    const search = req.query.search;
    const data = await discoverUsers(userId, search);
    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to discover users" });
  }
}

export async function acceptRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const result = await acceptFriendRequest(requestId, userId);

    const accepterName = req.user.name || "Someone";

    if (result.senderId) {
      await createNotificationAndPush({
        userId: result.senderId,
        type: "FRIEND_ACCEPTED",
        title: "Friend request accepted",
        body: `${accepterName} accepted your friend request`,
        data: {
          fromUserId: userId,
          fromUserName: accepterName,
        },
      });

      emitToUser(result.senderId, "friend_request_accepted", {
        requestId,
        from: {
          id: userId,
          name: accepterName,
          image: req.user.image ?? null,
        },
      });
    }

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to accept request" });
  }
}

export async function rejectRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const result = await rejectFriendRequest(requestId, userId);
    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to reject request" });
  }
}

export async function cancelRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const result = await cancelFriendRequest(requestId, userId);
    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to cancel request" });
  }
}
