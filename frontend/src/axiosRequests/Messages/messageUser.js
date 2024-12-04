import axios from "axios";
import { messageActions } from "../../store/messageStore";

export async function messageUser(
  curUserId,
  userId,
  chatId,
  message,
  isMessageReq,
  dispatch
) {
  // the way im gonna do this is Ill have the message_id get returned after its posted and replace the old one withthis
  try {
    let response;
    const newMessage = {
      sender_id: curUserId,
      message_data: message,
      time_sent: new Date().toISOString(),
    };

    dispatch(messageActions.addMessage(newMessage));

    response = await axios.post(
      `http://localhost:5000/api/v1/messages/sendMessage/${curUserId}/${userId}`,
      { message, chatId, isMessageReq },
      { withCredentials: true }
    );

    return response.data.returnedObject;
  } catch (err) {
    dispatch(messageActions.removeMessage());
    console.error("There was an error sending this message", err);
    throw err;
  }
}
