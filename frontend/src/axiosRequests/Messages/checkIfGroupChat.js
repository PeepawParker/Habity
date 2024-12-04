import axios from "axios";

export async function checkIfGroupChat(chatId) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/messages/checkIfGroupChat/${chatId}`,
      { withCredentials: true }
    );
    return response.data.groupChatStatus;
  } catch (err) {
    console.error("There was an error getting the recent message", err);
    throw err;
  }
}
