import axios from "axios";
import { chatActions } from "../../store/chatStore";
export async function rejectMessageReq(chatId, navigate, dispatch) {
  try {
    console.log("here is my chatId", chatId);
    await axios.delete(
      `http://localhost:5000/api/v1/messages/rejectChatReq/${chatId}`,
      {
        withCredentials: true,
      }
    );

    dispatch(chatActions.removeFromRecentChatReqs({ chatId }));

    navigate(`/messageRequests`);
  } catch (err) {
    console.error("There was an error rejecting this message", err);
    throw err;
  }
}
