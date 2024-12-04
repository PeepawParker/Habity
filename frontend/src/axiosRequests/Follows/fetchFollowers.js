import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function fetchFollowers(
  username,
  title,
  handleClose,
  setFollowData
) {
  try {
    const followData = await axios.get(
      `http://localhost:5000/api/v1/follows/${title}/${username}`,
      { withCredentials: true }
    );

    const formattedData = followData.data.data[title.toLowerCase()].reduce(
      (acc, follower) => {
        const idKey = title === "Following" ? "followed_id" : "follower_id";
        acc[follower[idKey]] = follower;
        return acc;
      },
      {}
    );

    setFollowData(formattedData);
  } catch (err) {
    toast.error(
      `There was an issue fetching your ${title} list. Please try again later`
    );
    handleClose();
  }
}
