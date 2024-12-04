import axios from "axios";
import { dataActions } from "../../store/dataStore";

export default async function handleUnfollow(
  followerId,
  followedId,
  setFollowStatus,
  dispatch,
  privacyStatus,
  followStatus
) {
  try {
    if (privacyStatus && followStatus === "Pending") {
      await axios.delete(
        `http://localhost:5000/api/v1/follows/rejectReq/${followerId}/${followedId}`,
        { withCredentials: true }
      );
      dispatch(dataActions.deleteFollowingId({ followedId }));
    } else {
      await axios.delete(
        `http://localhost:5000/api/v1/follows/unfollowUser/${followerId}/${followedId}`,
        { withCredentials: true }
      );

      dispatch(dataActions.subtractFollowingCount({ followedId }));
    }

    setFollowStatus(false);
  } catch (err) {
    throw new Error(
      "There was a problem unfollowing this user try again later"
    );
  }
}
