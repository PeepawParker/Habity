// retrive the latest 50, and then I can eventually do infinite scrolling this this
import axios from "axios";

export async function fetchNotifications(userId, setNotifications) {
  try {
    const notificationsResponse = await axios.get(
      `http://localhost:5000/api/v1/notifications/get/${userId}`,
      { withCredentials: true }
    );
    const notificationsData = notificationsResponse.data.data;

    const notificationsMap = new Map();
    Object.keys(notificationsData).forEach((key) => {
      notificationsMap.set(key, notificationsData[key]);
    });

    setNotifications(notificationsMap);
  } catch (err) {
    throw new Error(
      "There was a problem fetching the count of unseen notifications",
      err
    );
  }
}
