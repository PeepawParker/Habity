import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function fetchFollowStatus(
  loggedInUsername,
  username,
  setFollowStatus
) {
  try {
    const followStatus = await axios.get(
      `http://localhost:5000/api/v1/follows/status/${loggedInUsername}/${username}`,
      { withCredentials: true }
    );
    setFollowStatus(followStatus.data.data);
  } catch (err) {
    toast.error(
      `There was an issue fetching your follow status. Please try again later`
    );
  }
}

// This does not account for situations where there is an outgoing pending request
