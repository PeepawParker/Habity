import axios from "axios";
import { chatActions } from "../../store/chatStore";

export async function getAllQueuedMessages(queuedChats, messageType, dispatch) {
  try {
    const queryParams = queuedChats
      .map((chatId) => `chatIds=${encodeURIComponent(chatId)}`)
      .join("&");

    console.log(
      "here are the query params",
      queryParams,
      "here are the queuedChats",
      queuedChats
    );

    const url = `http://localhost:5000/api/v1/messages/getQueuedMessages/?${queryParams}`;

    const response = await axios.get(url, { withCredentials: true });

    console.log("here is my response", response.data.data);

    if (messageType === "message") {
      dispatch(chatActions.updateRecentChats({ messages: response.data.data }));
      dispatch(chatActions.deleteQueue());
    } else if (messageType === "messageRequest") {
      // replace the old messages with the new ones in the correct order
      dispatch(
        chatActions.updateRecentChatReqs({ messages: response.data.data })
      );
      dispatch(chatActions.deleteReqQueue());
    }
  } catch (err) {
    console.error("There was an error sending this message", err);
    throw err;
  }
}
