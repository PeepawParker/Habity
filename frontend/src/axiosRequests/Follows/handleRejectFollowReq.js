// this will just delete it from the notification table and delete it from the follows table
//the optimistic update will just return the notifications with this one cut out of it
import axios from "axios";

export default async function handleRejectFollowReq(
  followerId,
  followedId,
  notificationId,
  setNotifications
) {
  let fallbackNotifications;

  setNotifications((prevNotifications) => {
    fallbackNotifications = new Map(prevNotifications);
    const updatedNotifications = new Map(prevNotifications);
    updatedNotifications.delete(notificationId);
    return updatedNotifications;
  });

  try {
    await axios.delete(
      `http://localhost:5000/api/v1/follows/rejectReq/${followerId}/${followedId}`,
      { withCredentials: true }
    );
  } catch (err) {
    setNotifications(fallbackNotifications);
    throw new Error(
      "There was a problem rejecting this follow request. Please try again later."
    );
  }
}

// maybe I can somehwo pass the index since im mapping through them I pass the index so then I can index through the array to optimistically update it
