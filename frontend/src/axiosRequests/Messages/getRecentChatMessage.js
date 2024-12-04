import axios from "axios";
import { messageActions } from "../../store/messageStore";
import { chatActions } from "../../store/chatStore";

export async function getRecentChatMessage(chatId, dispatch, chatStatus) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/messages/getUserMessage/${chatId}`,
      { withCredentials: true }
    );
    const recentMessage = response.data.recentMessage;

    if (chatStatus === "InChat") {
      return dispatch(messageActions.addMessage(recentMessage));
    }

    console.log("this thing on?", response.data.recentMessage);
    // I need this to check the chatMessage status and if its messasge do this if its req do the other one
    if (recentMessage.message_type === "messageRequest") {
      dispatch(chatActions.updateRecentChatReqs({ messages: [recentMessage] }));
      dispatch(chatActions.removeFromChatReqQueue());
    } else {
      dispatch(chatActions.updateRecentChats({ messages: [recentMessage] }));
      dispatch(chatActions.removeFromQueue());
    }

    return recentMessage;
  } catch (err) {
    console.error("There was an error getting the recent message", err);
    throw err;
  }
}
