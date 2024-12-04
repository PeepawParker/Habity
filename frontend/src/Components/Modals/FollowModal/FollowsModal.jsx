import Button from "react-bootstrap/Button";
import FormModal from "../FormModal";
import { useSelector } from "react-redux";
import { fetchFollowers } from "../../../axiosRequests/Follows/fetchFollowers";
import { useEffect, useRef, useState } from "react";
import FollowButton from "./FollowButton";

function FollowModal({
  show,
  handleClose,
  handleShow,
  title,
  curUsername,
  curUserId,
}) {
  const followingIds = useSelector((state) => state.data.followingIds);
  const followCount = useSelector((state) => {
    if (title === "Following") {
      return state.data.followingCount;
    } else if (title === "Followers") {
      return state.data.followerCount;
    }
  });
  const [followData, setFollowData] = useState({});
  const modalContentRef = useRef(null);

  const followNameKey =
    title === "Following" ? "followed_username" : "follower_username";
  const followIdKey = title === "Following" ? "followed_id" : "follower_id";

  useEffect(() => {
    if (show) {
      fetchFollowers(curUsername, title, handleClose, setFollowData);
    }
  }, [show]);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        {title} {followCount}
      </Button>
      <FormModal
        show={show}
        onHide={() => {
          handleClose();
        }}
        title={title}
      >
        <div
          ref={modalContentRef}
          style={{ maxHeight: "50px", overflowY: "auto" }}
        >
          <ul>
            {Object.values(followData).map((follower, index) => (
              <FollowButton
                key={follower[followIdKey]}
                followingStatus={
                  title === "Following"
                    ? true
                    : followingIds[follower[followIdKey]]
                    ? followingIds[follower[followIdKey]].pending_status
                      ? "Pending"
                      : true
                    : follower.private
                    ? "SendRequest"
                    : false
                }
                followNameKey={followNameKey}
                followIdKey={followIdKey}
                follower={follower}
                curUserId={curUserId}
                setFollowData={setFollowData}
                index={index}
              />
            ))}
          </ul>
        </div>
      </FormModal>
    </>
  );
}

export default FollowModal;
