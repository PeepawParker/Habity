import axios from "axios";

export async function checkUsersChatId(curUserId, userId) {
  try {
    const chatId = await axios.get(
      `http://localhost:5000/api/v1/users//check/chatId/${curUserId}/${userId}`,
      { withCredentials: true }
    );
    return chatId.data.data;
  } catch (err) {
    console.error("error time in checkUserChatId", err);
  }
}
