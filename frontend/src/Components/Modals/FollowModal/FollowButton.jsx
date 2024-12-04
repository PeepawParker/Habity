import { useState } from "react";
import { useNavigate } from "react-router-dom";
import handleFollow from "../../../axiosRequests/Follows/handleFollow";
import handleUnfollow from "../../../axiosRequests/Follows/handleUnfollow";
import { useDispatch } from "react-redux";

function FollowButton({
  followingStatus,
  followNameKey,
  followIdKey,
  follower,
  curUserId,
  setFollowData,
}) {
  const [followState, setFollowStatus] = useState(followingStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUserClick = (username, userId) => {
    navigate(`/visitor/${username}/${userId}/${curUserId}`);
  };

  const handleFollowClick = async () => {
    let originalFollow = followState;
    let originalData;

    try {
      if (followState === true || followState === "Pending") {
        await handleUnfollow(
          curUserId,
          follower[followIdKey],
          setFollowStatus,
          dispatch,
          follower.private,
          followState
        );
      } else {
        await handleFollow(
          curUserId,
          follower[followIdKey],
          setFollowStatus,
          dispatch,
          follower.private
        );
      }
    } catch (err) {
      setFollowStatus(originalFollow);
      setFollowData(originalData);
      console.error("An error has occurred in the follow button", err);
    }
  };

  const getButtonText = () => {
    switch (followState) {
      case true:
        return "Unfollow";
      case false:
        return "Follow";
      case "Pending":
        return "Pending";
      case "SendRequest":
        return "Follow";
      default:
        return "Follow";
    }
  };

  return (
    <li>
      <span
        onClick={() =>
          handleUserClick(follower[followNameKey], follower[followIdKey])
        }
      >
        {follower[followNameKey]}
      </span>
      <button onClick={handleFollowClick}>{getButtonText()}</button>
    </li>
  );
}

export default FollowButton;
