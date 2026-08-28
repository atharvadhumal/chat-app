import { discoverUsers, getFriendsDetailed, sendFriendRequest } from "./friend.service.js";

export async function sendRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.bod;

    const result = await sendFriendRequest(senderId, receiverId);
    //TODO : push noti later

    return res.json(result);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to send request" });
  }
}

export async function listFriends(req, res) {
  try {
    const userId = req.user.id;
    const data = await getFriendsDetailed(userId);

    return res.json(data);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to list friends" });
  }
}

export async function discover(req, res) {
  try {
    const userId = req.user.id;
    const search = req.query.search;

    const data = await discoverUsers(userId, search);

    return res.json(data);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to discover users" });
  }
}
