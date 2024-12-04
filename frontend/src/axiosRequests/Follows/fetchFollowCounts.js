import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { dataActions } from "../../store/dataStore";

export async function fetchFollowCounts(curUserId, dispatch) {
  try {
    const result = await axios.get(
      `http://localhost:5000/api/v1/follows/count/${curUserId}`,
      { withCredentials: true }
    );
    const { followerCount, followingCount, followingIds } = result.data.data;

    dispatch(
      dataActions.updateFollowCounts({
        followerCount: followerCount,
        followingCount: followingCount,
      })
    );

    dispatch(dataActions.updateFollowingIds({ followingIds: followingIds }));
  } catch (err) {
    toast.error(
      `There was an issue fetching your follow Counts please try again later`
    );
  }
}
