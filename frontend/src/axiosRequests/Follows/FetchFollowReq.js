import axios from "axios";

export async function fetchFollowReq(userId, curUserId, setFollowStatus) {
  try {
    const followReqStatus = await axios.get(
      // followController.getFollowReq
      // sees if this user has an outgoing req on a private user
      `http://localhost:5000/api/v1/follows/privateUser/${curUserId}/${userId}`,
      {
        withCredentials: true,
      }
    );
    if (
      followReqStatus &&
      followReqStatus.data &&
      followReqStatus.data.data &&
      followReqStatus.data.data.length > 0
    ) {
      if (followReqStatus.data.data[0].pending_status) {
        setFollowStatus("pending");
      } else {
        setFollowStatus(false);
      }
    } else {
      setFollowStatus(false); // Handle the case where the data or array item doesn't exist
    }
  } catch (err) {
    throw new Error("There was a problem fetching follow req");
  }
}
