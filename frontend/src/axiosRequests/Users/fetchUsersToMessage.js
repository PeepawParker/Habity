import axios from "axios";

export async function fetchUsersToMessage(
  searchBar,
  curUserId,
  setSearchUsers
) {
  try {
    const users = await axios.get(
      `http://localhost:5000/api/v1/users/searchUsers/message/${searchBar}/${curUserId}`,
      { withCredentials: true }
    );
    setSearchUsers(users.data.data);
  } catch (err) {
    const errorMsg = err.response.data.message;
    console.error("There was a problem fetching the searched Users", errorMsg);
  }
}
