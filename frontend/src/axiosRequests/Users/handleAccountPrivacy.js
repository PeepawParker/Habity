import axios from "axios";
import { userActions } from "../../store/userStore";

export default async function handleAccountPrivacy(
  userId,
  setAccountPrivacy,
  dispatch
) {
  try {
    let newPrivacyStatus;
    setAccountPrivacy((prevValue) => {
      newPrivacyStatus = !prevValue;
      return !prevValue;
    });
    await axios.post(
      "http://localhost:5000/api/v1/users/user/privacy",
      { userId },
      { withCredentials: true }
    );
    dispatch(userActions.setPrivacy({ privateStatus: newPrivacyStatus }));
    //optimistic update the account privacy
  } catch (err) {
    setAccountPrivacy((prevValue) => {
      return !prevValue;
    });
    throw new Error(
      "there was a problem changing the privacy please try agian later",
      err
    );
  }
}
