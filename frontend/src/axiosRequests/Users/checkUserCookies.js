import axios from "axios";
import { userActions } from "../../store/userStore";

export async function checkUserCookies(dispatch) {
  try {
    const user = await axios.get("http://localhost:5000/api/v1/users/user", {
      withCredentials: true,
    });
    dispatch(
      userActions.login({
        username: user.data.data.username,
        userId: user.data.data.user_id,
        privateStatus: user.data.data.private,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    );
    return user.data.data.username;
  } catch (err) {
    console.error("error checking user cookies", err);
    return false;
  }
}
