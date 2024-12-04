import axios from "axios";

export default async function getFollowCount(
  loggedInUsername,
  followType,
  setFollowCount
) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/follows/count/follow/${followType}/${loggedInUsername}`,
      { withCredentials: true }
    );
    setFollowCount(response.data.data.followCount);
  } catch (err) {
    throw new Error(`There was a problem getting the followerCount ${err}`);
  }
}
