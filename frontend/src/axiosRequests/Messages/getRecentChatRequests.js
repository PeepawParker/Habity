import axios from "axios";
import { chatActions } from "../../store/chatStore";

export async function getRecentChatRequests(curUserId, dispatch) {
  try {
    console.log("here is the curUserId", curUserId);
    const messages = await axios.get(
      `http://localhost:5000/api/v1/messages/userMessageReqs/${curUserId}`,
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
    console.log("here are the recent ones", recentChats);
    dispatch(chatActions.setRecentChatReqs({ recentChats }));
  } catch (err) {
    console.error("There was an error getting the recent chatRequests", err);
    throw err;
  }
}
