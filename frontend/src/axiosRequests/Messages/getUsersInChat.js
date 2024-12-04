import axios from "axios";

export async function getUsersInChat(chatId, curUserId) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/messages/getUserIds/${chatId}`,
      { withCredentials: true }
    );

    const userArray = response.data.userIds;
    let realUserId = null;

    for (const user of userArray) {
      if (user.user_id !== curUserId) {
        realUserId = user.user_id;
        break;
      }
    }

    return realUserId;
  } catch (err) {
    console.error("There was an error getting the user IDs", err);
    throw err;
  }
}
