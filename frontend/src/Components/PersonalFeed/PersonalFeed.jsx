import { useEffect, useState } from "react";
import { fetchUsers } from "../../axiosRequests/Users/fetchUsers";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

//I think I want to make it so you can add stuff to the NavBar and have like an add recommended people on the NavBar on this page
// Have like a search for user function, I'd like it to like update live as your typing like for each letter it sends out an sql erquest retrieving say 3 users that start with that and narrowing it down more and more until they find the correct user

export default function PersonalFeed() {
  const curUserId = useSelector((state) => state.user.userId);
  const [searchBar, setSearchBar] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);

  const navigate = useNavigate();

  const handleUserClick = (username, userId) => {
    navigate(`/visitor/${username}/${userId}/${curUserId}`);
  };

  useEffect(() => {
    if (searchBar !== "") {
      fetchUsers(setSearchUsers, searchBar, curUserId);
    }
  }, [curUserId, searchBar]);

  return (
    <>
      <h1>
        This will only show stuff from people you follow personally no
        recommended stuff
      </h1>
      <p>
        I want a sort of search bar at the top to find users, ordering them by
        first if you follow them, then follower count, the account age(oldest
        first)
      </p>
      <div className="SearchBar">
        <input
          placeholder="search"
          onChange={(e) => setSearchBar(e.target.value)}
        ></input>
        <div className="SearchResults">
          <ul>
            {searchUsers.length === 0 ? (
              <li>No Users Found</li>
            ) : (
              searchUsers.map((user) => (
                <li
                  key={user.username}
                  onClick={() => handleUserClick(user.username, user.user_id)}
                >
                  {user.username}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
