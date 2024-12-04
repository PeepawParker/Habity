import axios from "axios";
import { messageActions } from "../../store/messageStore";

export async function getChatIdMessages(chatId, curUserId, dispatch) {
  try {
    const messages = await axios.get(
      `http://localhost:5000/api/v1/messages/getUserMessages/${chatId}/${curUserId}`,
      { withCredentials: true }
    );
    console.log("messages", messages);
    dispatch(messageActions.addMessages(messages.data.messages));
  } catch (err) {
    console.error("There was an error sending this message", err);
    throw err;
  }
}
