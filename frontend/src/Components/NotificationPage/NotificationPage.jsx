import { useEffect, useState } from "react";
import { fetchNotifications } from "../../axiosRequests/Notifications/fetchNotifications";
import handleRejectFollowReq from "../../axiosRequests/Follows/handleRejectFollowReq";
import handleAcceptFollowReq from "../../axiosRequests/Follows/handleAcceptFollowReq";
import { useDispatch, useSelector } from "react-redux";
import { notificationActions } from "../../store/notificationStore";

//the new notification stuff works just not in react.strictmode

function handleNotificationUpdate(dispatch) {
  dispatch(notificationActions.resetNotifications());
}

export default function NotificationPage() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const unseenNotifications = useSelector(
    (state) => state.notifications.unseenNotifications
  );
  const [notifications, setNotifications] = useState(new Map());

  useEffect(() => {
    return () => {
      handleNotificationUpdate(dispatch);
    };
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications(userId, setNotifications);
  }, [userId, unseenNotifications]);

  function renderNotification(notification, notificationId) {
    const notiType = notification.notification_type;

    switch (notiType) {
      case "FollowPrivateReq":
        return (
          <>
            <p>
              {notification.viewed === false ? (
                <span>Special Notification: </span>
              ) : null}
              {notification.notifier_user_id} has requested to follow you !
            </p>
            <button
              onClick={() =>
                handleRejectFollowReq(
                  notification.notifier_user_id,
                  notification.notified_user_id,
                  notificationId,
                  setNotifications
                )
              }
            >
              reject
            </button>
            <button
              onClick={() =>
                handleAcceptFollowReq(
                  notification.notifier_user_id,
                  notification.notified_user_id,
                  notificationId,
                  setNotifications,
                  dispatch
                )
              }
            >
              accept
            </button>
          </>
        );
      case "FollowPublic":
        return (
          <p>
            {notification.viewed === false ? (
              <span>Special Notification: </span>
            ) : null}
            New User {notification.notifier_user_id} is now following you !
          </p>
        );
      case "FollowPrivate":
        return (
          <p>
            {notification.viewed === false ? (
              <span>Special Notification: </span>
            ) : null}
            {notification.notifier_user_id} is now following you !
          </p>
        );
      case "FollowPrivateAccept":
        return (
          <p>
            {notification.viewed === false ? (
              <span>Special Notification: </span>
            ) : null}
            {notification.notifier_user_id} accepted your follow request !
          </p>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <h1>This is the notification page !</h1>
      <ul>
        {notifications.size === 0 ? (
          <p>No Notifications At this time</p>
        ) : (
          Array.from(notifications).map(([notificationId, notification]) => (
            <li key={notificationId}>
              {renderNotification(notification, notificationId)}
            </li>
          ))
        )}
      </ul>
    </>
  );
}
