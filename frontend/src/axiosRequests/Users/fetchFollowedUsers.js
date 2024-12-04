import axios from "axios";

export async function fetchFollowedUsers(searchBar, curUserId, setSearchUsers) {
  try {
    const followedUsers = await axios.get(
      `http://localhost:5000/api/v1/users/searchFollows/${searchBar}/${curUserId}`,
      { withCredentials: true }
    );
    setSearchUsers(followedUsers.data.data);
  } catch (err) {
    console.error("There was a problem searching through followed users", err);
  }
}
