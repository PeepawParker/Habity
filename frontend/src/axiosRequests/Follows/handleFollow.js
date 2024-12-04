import axios from "axios";
import { dataActions } from "../../store/dataStore";

export default async function handleFollow(
  followerId,
  followedId,
  setFollowStatus,
  dispatch,
  privacyStatus
) {
  if (privacyStatus) {
    try {
      await axios.post(
        "http://localhost:5000/api/v1/follows/followPrivateUser",
        { followerId, followedId },
        { withCredentials: true }
      );
      setFollowStatus("Pending");
      dispatch(
        dataActions.addFollowingId({
          followedId,
          private: true,
          pending_status: true,
        })
      );
    } catch (err) {
      throw new Error(
        "There was a problem following this private user try again later"
      );
    }
    return;
  }
  try {
    await axios.post(
      "http://localhost:5000/api/v1/follows/followUser",
      { followerId, followedId },
      { withCredentials: true }
    );
    setFollowStatus(true);
    dispatch(
      dataActions.addFollowingCount({
        followedId,
      })
    );
    return;
  } catch (err) {
    throw new Error("There was a problem following this user try again later");
  }
}
