import axios from "axios";
import { chatActions } from "../../store/chatStore";

export async function getRecentMessages(curUserId, dispatch) {
  try {
    const messages = await axios.get(
      `http://localhost:5000/api/v1/messages/userMessages/${curUserId}`,
      { withCredentials: true }
    );

    let recentChats = { history: [] };

    Object.keys(messages.data.messages).forEach((key) => {
      const recentMessage = messages.data.messages[key];

      recentChats[recentMessage.chat_id] = recentMessage;

      recentChats.history.push({
        chat_id: recentMessage.chat_id,
        time_sent: recentMessage.time_sent,
      });
    });

    dispatch(chatActions.setRecentChats({ recentChats }));

    console.log("here are the recentchats", recentChats);
  } catch (err) {
    console.error("There was an error sending this message", err);
    throw err;
  }
}
