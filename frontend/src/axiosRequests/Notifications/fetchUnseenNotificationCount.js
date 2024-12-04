import axios from "axios";
import { notificationActions } from "../../store/notificationStore";

export async function fetchUnseenNotificationCount(userId, dispatch) {
  try {
    const notificationCount = await axios.get(
      `http://localhost:5000/api/v1/notifications/getCount/unseen/${userId}`,
      { withCredentials: true }
    );

    dispatch(
      notificationActions.setUnseenNotificationCount({
        unseenNotificationCount: notificationCount.data.count,
      })
    );
  } catch (err) {
    throw new Error(
      "There was a problem fetching the count of unseen notifications",
      err
    );
  }
}
