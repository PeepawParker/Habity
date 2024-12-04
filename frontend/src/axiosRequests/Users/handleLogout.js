import axios from "axios";
import { userActions } from "../../store/userStore";
import { chatActions } from "../../store/chatStore";
import { dataActions } from "../../store/dataStore";
import { messageActions } from "../../store/messageStore";
import { notificationActions } from "../../store/notificationStore";
import { sseActions } from "../../store/sseStore";

export default async function handleLogout(dispatch, navigate) {
  try {
    navigate("/login");
    await axios.post(`http://localhost:5000/api/v1/users/logout`, null, {
      withCredentials: true,
    });
    dispatch(userActions.resetUser());
    dispatch(chatActions.resetChats());
    dispatch(dataActions.resetData());
    dispatch(messageActions.resetMessages());
    dispatch(notificationActions.resetNotifications());
    dispatch(chatActions.resetChats());
    dispatch(sseActions.resetsse());
  } catch (err) {
    throw new Error("There was a problem logging out please try again later");
  }
}
