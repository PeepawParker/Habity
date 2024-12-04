import { fetchFollowStatus } from "../../../axiosRequests/Follows/fetchFollowStatus";
import { fetchHabits } from "../../../axiosRequests/Habits/fetchHabits";
import { fetchUserPrivacy } from "../../../axiosRequests/Users/fetchUserPrivacy";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function fetchInitialData(
  loggedInUsername,
  username,
  setFollowStatus,
  userId,
  setPrivacyStatus,
  setHabits,
  followingIds
) {
  try {
    const privacyStatus = await fetchUserPrivacy(userId, setPrivacyStatus);

    if (followingIds[userId]) {
      if (!followingIds[userId].pending_status) {
        setFollowStatus(true);
      } else if (followingIds[userId].pending_status) {
        setFollowStatus("Pending");
      }
    } else {
      await fetchFollowStatus(loggedInUsername, username, setFollowStatus);
    }

    if (!privacyStatus || followingIds[userId]) {
      await fetchHabits(setHabits, username, toast);
    }
  } catch (error) {
    console.error("Error fetching initial data:", error);
    toast.error("An error occurred while loading the page. Please try again.");
  }
}
