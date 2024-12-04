import axios from "axios";
import { chatActions } from "../../store/chatStore";

export async function fetchMessageNotiStatus(curUserId, dispatch) {
  try {
    console.log("BITCH");
    const response = await axios.get(
      `http://localhost:5000/api/v1/messages/newMessages/${curUserId}`,
      { withCredentials: true }
    );

    console.log(
      "HERE IS THE RESPONSE THAT THIS USER HAS MESSAGE NOTIFICATIONS",
      response.data.data
    );

    dispatch(
      chatActions.setUnreadChatNotification({
        unreadStatus: response.data.data.message,
      })
    );
    dispatch(
      chatActions.setUnreadChatReqNotification({
        unreadStatus: response.data.data.req,
      })
    );
  } catch (err) {
    console.error("There was an error sending this message", err);
    throw err;
  }
}
