import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import NewHabitModal from "../Modals/NewHabitModal";
import FollowModal from "../Modals/FollowModal/FollowsModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GraphBox from "./GraphBox";
import { fetchHabits } from "../../axiosRequests/Habits/fetchHabits";
import {
  userDefined,
  makeHabitsPairs,
  fetchRecentHabitData,
} from "./UserHomeFunctions/useEffectFunctions";
import "react-toastify/dist/ReactToastify.css";
import "./UserHome.css";

export default function UserHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const username = useSelector((state) => state.user.username);
  const userId = useSelector((state) => state.user.userId);
  const authStatus = useSelector((state) => state.user.isAuthenticated);
  const [habits, setHabits] = useState([]);
  const [habitPairs, setHabitPairs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClose = () => setShowModal(null);
  const handleShow = (modalType) => setShowModal(modalType);

  useEffect(() => {
    userDefined(
      navigate,
      username,
      authStatus,
      toast,
      dispatch,
      fetchHabits,
      setHabits
    );
  }, [authStatus, dispatch, navigate, username]);

  useEffect(() => {
    makeHabitsPairs(habits, setHabitPairs);
    fetchRecentHabitData(setLoading, habits);
  }, [habits]);

  return (
    <>
      <p>{username} hello !</p>
      <div className="userBio">
        <div>
          <FollowModal
            show={showModal === "followers"}
            handleShow={() => handleShow("followers")}
            handleClose={handleClose}
            title="Followers"
            curUsername={username}
            curUserId={userId}
          />
          <FollowModal
            show={showModal === `following`}
            handleShow={() => handleShow("following")}
            handleClose={handleClose}
            title="Following"
            curUsername={username}
            curUserId={userId}
          />
        </div>
      </div>

      <div>
        <NewHabitModal
          show={showModal === "newHabit"}
          handleShow={() => handleShow("newHabit")}
          handleClose={handleClose}
          setHabits={setHabits}
        />
      </div>
      <h1>
        This is where the graphs will be held and users will input information
        of course
      </h1>
      <ul>
        {loading || habitPairs.length === 0 ? (
          <div>Loading Habits...</div>
        ) : (
          habitPairs.map((habit, index) => (
            <div key={index}>
              <div className="GraphContainer">
                <GraphBox habit={habit} setHabits={setHabits} />
              </div>
            </div>
          ))
        )}
      </ul>
    </>
  );
}
