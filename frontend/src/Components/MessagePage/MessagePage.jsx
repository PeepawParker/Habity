import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchUsersToMessage } from "../../axiosRequests/Users/fetchUsersToMessage";
import MessageSearchBar from "./messageComponents/MessageSearchBar";
import RecentUserChats from "./messageComponents/RecentUserChats";
import { messageActions } from "../../store/messageStore";

export default function MessagePage() {
  const dispatch = useDispatch();

  const curUserPrivate = useSelector((state) => state.user.privateStatus);
  const curUserId = useSelector((state) => state.user.userId);
  const unreadChatReqNoti = useSelector(
    (state) => state.chats.unreadChatReqNotification
  );

  const [searchBar, setSearchBar] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);

  const navigate = useNavigate();

  const handleUserClick = (curUserId, userId, chatId) => {
    if (chatId) {
      navigate(`/messages/${curUserId}/${userId}/${chatId}`);
    } else {
      navigate(`/messages/${curUserId}/${userId}`);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(messageActions.resetMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchBar !== "") {
        await fetchUsersToMessage(searchBar, curUserId, setSearchUsers);
      }
    };

    fetchData();
  }, [searchBar, curUserId]);

  // have it check the private status if the user is private load up a message request button which will open messages to you from users that don't follow you

  useEffect(() => {
    console.log("here is the unread thing", unreadChatReqNoti);
  }, [unreadChatReqNoti]);

  return (
    <>
      <h4>This is just like the main hub for past messages</h4>
      <p>
        I will just grab the users in order and then grab the first or last
        message received/sent to display
      </p>
      {curUserPrivate ? (
        <NavLink to={"/messageRequests"}>
          requests
          {unreadChatReqNoti === 1 ? (
            <p style={{ display: "inline" }}> ALERT</p>
          ) : (
            <></>
          )}
        </NavLink>
      ) : (
        <></>
      )}
      <MessageSearchBar
        setSearchBar={setSearchBar}
        searchUsers={searchUsers}
        handleUserClick={handleUserClick}
        curUserId={curUserId}
      />
      <RecentUserChats
        handleUserClick={handleUserClick}
        curUserId={curUserId}
      />
    </>
  );
}
