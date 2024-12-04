import axios from "axios";
import { userActions } from "../../store/userStore";

export async function getMessageReqStatus(curUserId, dispatch) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/users/messageRequest/${curUserId}`,
      { withCredentials: true }
    );
    console.log(
      "here is the response to the messageRequestStatus",
      response.data.data
    );
    if (response.data.data) {
      dispatch(userActions.setMessageRequestsTrue());
    } else dispatch(userActions.setMessageRequestsFalse());
  } catch (err) {
    console.error("There was an error getting the messageRequestStatus", err);
    throw err;
  }
}
