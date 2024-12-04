import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import handleLogout from "../../axiosRequests/Users/handleLogout";
import { checkUsersChatId } from "../../axiosRequests/Users/checkUsersChatId";
import {
  checkPathFetchChatId,
  checkSessionRefresh,
  setupSSEConnection,
} from "./navBarUseEffectFunctions";
import { checkUserCookies } from "../../axiosRequests/Users/checkUserCookies";
import { startSSEConnection } from "../../SSEs/sseConnection";
import { fetchUnseenNotificationIds } from "../../axiosRequests/Notifications/fetchUnseenNotificationIds";
import { fetchFollowCounts } from "../../axiosRequests/Follows/fetchFollowCounts";
import "./NavBar.css";
import { fetchMessageNotiStatus } from "../../axiosRequests/Messages/fetchMessageNotiStatus";
import { chatActions } from "../../store/chatStore";

const CustomNavLink = ({ to, children, ...props }) => {
  const isActive = location.pathname === to;
  return (
    <NavLink
      to={to}
      className={`nav-button ${isActive ? "active" : ""}`}
      {...props}
      onClick={(e) => {
        if (isActive) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </NavLink>
  );
};

export default function NavBar() {
  const dispatch = useDispatch();
  const curUserId = useSelector((state) => state.user.userId);
  const authStatus = useSelector((state) => state.user.isAuthenticated);
  const recentChats = useSelector((state) => state.chats.recentChats);
  const recentChatReqs = useSelector((state) => state.chats.recentChatReqs);
  const navigate = useNavigate();
  const unreadChatNotification = useSelector(
    (state) => state.chats.unreadChatNotification
  );
  const notificationCount = useSelector(
    (state) => state.notifications.unseenNotificationCount
  );

  const { pathname } = useLocation();

  useEffect(() => {
    if (curUserId) {
      setupSSEConnection(curUserId, startSSEConnection, dispatch);
      fetchUnseenNotificationIds(curUserId, dispatch);
      fetchFollowCounts(curUserId, dispatch);
      fetchMessageNotiStatus(curUserId, dispatch);
    }
  }, [curUserId, dispatch]);

  useEffect(() => {
    const messageUserRegex = /^\/messages\/\d+\/\d+\/\d+$/;
    const messageReqRegex = /^\/messageReqs\/\d+\/\d+\/\d+$/;

    if (messageUserRegex.test(pathname)) {
      console.log(
        "these are the recent chats its looking through",
        recentChats
      );
      const hasUnread = Object.values(recentChats).some(
        (chat) => chat.read_status === false && chat.sender_id !== curUserId
      );
      if (!hasUnread) {
        dispatch(chatActions.setUnreadChatNotification({ unreadStatus: 0 }));
      }
    }

    if (messageReqRegex.test(pathname)) {
      const hasUnread = Object.values(recentChatReqs).some(
        (chat) => chat.read_status === false
      );
      console.log(recentChatReqs, hasUnread);
      if (!hasUnread) {
        dispatch(chatActions.setUnreadChatReqNotification({ unreadStatus: 0 }));
      }
    }
  }, [curUserId, dispatch, pathname, recentChatReqs, recentChats]);

  useEffect(() => {
    checkSessionRefresh(dispatch);

    if (
      !authStatus &&
      !pathname.includes("/login") &&
      !pathname.includes("/signup")
    ) {
      checkUserCookies(dispatch);
    }

    return () => {
      localStorage.setItem(
        "lastActiveTimestamp",
        new Date().getTime().toString()
      );
    };
  }, [authStatus, dispatch, pathname]);

  useEffect(() => {
    if (curUserId) {
      checkPathFetchChatId(pathname, checkUsersChatId, curUserId, navigate);
    }
  }, [curUserId, navigate, pathname]);

  return (
    <>
      <h1>This is the navbar</h1>
      {!authStatus && location.pathname !== "/login" && (
        <CustomNavLink to="/login">Login</CustomNavLink>
      )}
      {!authStatus && location.pathname !== "/signup" && (
        <CustomNavLink to="/signup">Sign Up</CustomNavLink>
      )}
      <CustomNavLink to="/userhome">User Icon</CustomNavLink>
      <CustomNavLink to="/" end>
        Home Icon
      </CustomNavLink>
      <CustomNavLink to={`/userfeed/${curUserId}`}>Explore</CustomNavLink>
      <CustomNavLink to="/notifications">
        Notifications {notificationCount}
      </CustomNavLink>
      <CustomNavLink to="/messages">
        Messages {unreadChatNotification === 1 ? <p>!</p> : null}
      </CustomNavLink>
      <CustomNavLink to="/settings">Settings</CustomNavLink>
      {authStatus && (
        <button
          className="logout-button"
          onClick={() => handleLogout(dispatch, navigate, curUserId)}
        >
          Logout
        </button>
      )}
      <Outlet />
    </>
  );
}
