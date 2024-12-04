import axios from "axios";
import { dataActions } from "../../store/dataStore";

export default async function handleAcceptFollowReq(
  followerId,
  followedId,
  notificationId,
  setNotifications,
  dispatch
) {
  let fallbackNotifications;

  setNotifications((prevNotifications) => {
    fallbackNotifications = new Map(prevNotifications);
    const updatedNotifications = new Map(prevNotifications);
    if (updatedNotifications.has(notificationId)) {
      const notification = updatedNotifications.get(notificationId);
      notification.notification_type = "FollowPrivate";
      updatedNotifications.set(notificationId, notification);
    }
    return updatedNotifications;
  });

  try {
    await axios.post(
      `http://localhost:5000/api/v1/follows/acceptFollowRequest`,
      { followerId, followedId },
      { withCredentials: true }
    );
    dispatch(dataActions.addFollowerCount());
  } catch (err) {
    setNotifications(fallbackNotifications);
    throw new Error(
      "There was a problem accepting this follow request. Please try again later."
    );
  }
}
