import axios from "axios";

export async function fetchUserPrivacy(userId, setPrivacyStatus) {
  try {
    const privacyStatus = await axios.get(
      `http://localhost:5000/api/v1/users/user/privacy/${userId}`,
      { withCredentials: true }
    );
    setPrivacyStatus(privacyStatus.data.data[0].private);
    return privacyStatus.data.data[0].private;
  } catch (err) {
    console.error("there was a problem getting the users privacy setting", err);
  }
}
