import { useDispatch, useSelector } from "react-redux";
import handleAccountPrivacy from "../../axiosRequests/Users/handleAccountPrivacy";
import { useEffect, useState } from "react";
import { getPrivacyStatusById } from "../User Home Page/UserHomeFunctions/useEffectFunctions";
export default function SettingsPage() {
  // just add the link to the handleAccount privacy and give it the userId and this is good to go
  const dispatch = useDispatch();
  const [accountPrivacy, setAccountPrivacy] = useState();
  const userId = useSelector((state) => state.user.userId);
  useEffect(() => {
    getPrivacyStatusById(userId, setAccountPrivacy);
  }, [userId]);

  return (
    <>
      <p>make this like a switch button where its a slider eventually</p>
      <button
        onClick={() =>
          handleAccountPrivacy(userId, setAccountPrivacy, dispatch)
        }
      >
        private ({accountPrivacy ? "true" : "false"})
      </button>
    </>
  );
}
