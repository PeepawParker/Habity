// retrive the latest 50, and then I can eventually do infinite scrolling this this
import axios from "axios";
import { notificationActions } from "../../store/notificationStore";

export async function fetchUnseenNotificationIds(curUserId, dispatch) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/notifications/getIds/${curUserId}`,
      { withCredentials: true }
    );

    dispatch(
      notificationActions.setUnseenNotificationCount({
        unseenNotificationCount: response.data.notificationIds.rowCount,
      })
    );
    dispatch(
      notificationActions.setUnseenNotifications({
        unseenNotifications: response.data.notificationIds.notificationsObject,
      })
    );
  } catch (err) {
    throw new Error(
      "There was a problem fetching the count of unseen notifications",
      err
    );
  }
}
