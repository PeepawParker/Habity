import VisitorGraph from "./VisitorGraph";
import { useDispatch, useSelector } from "react-redux";
import handleFollow from "../../../axiosRequests/Follows/handleFollow";
import handleUnfollow from "../../../axiosRequests/Follows/handleUnfollow";
import { makeHabitsPairs } from "../../User Home Page/UserHomeFunctions/useEffectFunctions";
import { fetchInitialData } from "../VisitorPageFunctions/useEffectFunctions";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

const VisitorGraphPage = function VisitorGraphBox({ loggedInUsername }) {
  const dispatch = useDispatch();
  const { username, userId, curUserId } = useParams();
  const [habits, setHabits] = useState([]);
  const [habitPairs, setHabitPairs] = useState([]);

  const followingIds = useSelector((state) => state.data.followingIds);
  const [followStatus, setFollowStatus] = useState("unknown");
  const [privacyStatus, setPrivacyStatus] = useState("unknown");

  useEffect(() => {
    fetchInitialData(
      loggedInUsername,
      username,
      setFollowStatus,
      userId,
      setPrivacyStatus,
      setHabits,
      followingIds
    );
  }, [loggedInUsername, userId, username, followingIds]);

  useEffect(() => {
    makeHabitsPairs(habits, setHabitPairs);
  }, [habits]);

  useEffect(() => {
    if (followingIds[userId]) {
      const pending = followingIds[userId].pending_status;
      setFollowStatus(pending ? "Pending" : true);
    }
  }, [followingIds, userId]);

  const handleFollowClick = () => {
    if (followStatus === true || followStatus === "Pending") {
      handleUnfollow(
        curUserId,
        userId,
        setFollowStatus,
        dispatch,
        privacyStatus,
        followStatus
      );
    } else {
      handleFollow(curUserId, userId, setFollowStatus, dispatch, privacyStatus);
    }
  };

  if (privacyStatus === "unknown") {
    return <div>Loading...</div>;
  }

  if (
    privacyStatus === true &&
    (followStatus === false || followStatus === "Pending")
  ) {
    return (
      <>
        <p>
          {username} has a private account. You must follow them to see their
          posts.
        </p>
        <NavLink to={`/messages/${curUserId}/${userId}/unknown`}>
          Message
        </NavLink>
        <button onClick={handleFollowClick}>
          {followStatus === "Pending" ? "Requested" : "Follow"}
        </button>
      </>
    );
  }

  if (habitPairs) {
    return (
      <>
        <p>{username}</p>

        <NavLink to={`/messages/${curUserId}/${userId}/unknown`}>
          Message
        </NavLink>
        <button onClick={handleFollowClick}>
          {followStatus === true ? "Unfollow" : "Follow"}
        </button>
        <ul>
          {habitPairs.length === 0 ? (
            <div>This User Has No Habits...</div>
          ) : (
            habitPairs.map((habit, index) => (
              <div key={index}>
                <div className="GraphContainer">
                  <VisitorGraph habit={habit[0]} />
                  {habit[1] && <VisitorGraph habit={habit[1]} />}
                </div>
              </div>
            ))
          )}
        </ul>
      </>
    );
  }
};
export default VisitorGraphPage;
