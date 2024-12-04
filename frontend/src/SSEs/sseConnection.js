import { getRecentChatMessage } from "../axiosRequests/Messages/getRecentChatMessage";
import { chatActions } from "../store/chatStore";
import { dataActions } from "../store/dataStore";
import { notificationActions } from "../store/notificationStore";
import { sseActions } from "../store/sseStore";

const handleNewMessageReceived = (data, pathname, dispatch) => {
  const { chatId } = data;
  const messagePathRegex = /^\/messages\/\d+\/\d+\/(\d+)$/;

  const match = pathname.match(messagePathRegex);

  if (match) {
    const pathChatId = match[1]; // Extracted chatId from the path
    if (pathChatId == chatId) {
      console.log("trying to get recent chat message");
      getRecentChatMessage(chatId, dispatch, "InChat");
    } else {
      console.log("we added a message to the queue");
      dispatch(chatActions.addToQueue({ chatId }));
      dispatch(chatActions.setUnreadChatNotification({ unreadStatus: true }));
    }
  } else {
    console.log("we added a message to the queue");
    dispatch(chatActions.addToQueue({ chatId }));
    dispatch(chatActions.setUnreadChatNotification({ unreadStatus: true }));
  }
};

const handleNewMessageReqReceived = (data, pathname, dispatch) => {
  const { chatId } = data;
  const messagePathRegex = /^\/messageReqs\/\d+\/\d+\/(\d+)$/;

  console.log("we are trying to handle this now", pathname);

  // Test if pathname matches the regex and capture the last segment
  const match = pathname.match(messagePathRegex);
  console.log("we are trying to handle this now", pathname);

  if (match) {
    const pathChatId = match[1]; // Extracted chatId from the path
    console.log("donkey", pathChatId, chatId);
    if (pathChatId == chatId) {
      console.log("trying to get recent chat message");
      getRecentChatMessage(chatId, dispatch, "InChat");
    } else {
      console.log("we added a message to the queuereq");
      dispatch(chatActions.addToChatReqQueue({ chatId }));
      dispatch(
        chatActions.setUnreadChatReqNotification({ unreadStatus: true })
      );
    }
  } else {
    console.log("we added a message to the queuereq");
    dispatch(chatActions.addToChatReqQueue({ chatId }));
    dispatch(chatActions.setUnreadChatReqNotification({ unreadStatus: true }));
  }
};

const handleNewNotificationReceived = (data, dispatch) => {
  console.log("here is the data", data);
  dispatch(
    notificationActions.addUnseenNotification({
      notificationId: data.notificationId,
    })
  );
};

const handleNewNotificationDeleted = (data, dispatch) => {
  const { notificationId } = data;
  console.log(notificationId);
  dispatch(notificationActions.deleteUnseenNotification({ notificationId }));
};

export const startSSEConnection = (userId, dispatch) => {
  const eventSource = new EventSource(`http://localhost:5000/sse/${userId}`, {
    withCredentials: true,
  });

  eventSource.onopen = () => {
    console.log("SSE connection opened");
    dispatch(sseActions.sseConnected());
  };

  eventSource.addEventListener("reqAccepted", (event) => {
    const { notificationId, followedId } = JSON.parse(event.data);
    console.log("New Follower:", notificationId, followedId);
    dispatch(dataActions.addFollowingCount({ followedId, private: true }));
    handleNewNotificationReceived({ notificationId: notificationId }, dispatch);
  });

  eventSource.addEventListener("addFollow", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("New Follower:", parsedData);
    dispatch(dataActions.addFollowerCount());
    handleNewNotificationReceived(parsedData, dispatch);
  });

  eventSource.addEventListener("deleteFollow", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("Follower Deleted:", parsedData);
    dispatch(dataActions.subtractFollowerCount());
    handleNewNotificationDeleted(parsedData, dispatch);
  });

  eventSource.addEventListener("addNotification", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("New Notification:", parsedData);
    handleNewNotificationReceived(parsedData, dispatch);
  });

  eventSource.addEventListener("deleteNotification", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("Remove notification:", parsedData.notificationId);
    if (parsedData.notificationId && parsedData.notificationId !== "unknown") {
      handleNewNotificationDeleted(parsedData, dispatch);
    } else {
      console.log("No notification to delete or unknown notification ID");
      // this needs to like update the followstatus if they are on the visitor page for this user
    }
  });

  eventSource.addEventListener("newMessage", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("new messsage alert", parsedData);
    handleNewMessageReceived(parsedData, window.location.pathname, dispatch);
  });

  eventSource.addEventListener("newMessageReq", (event) => {
    const parsedData = JSON.parse(event.data);
    console.log("new messageReq alert", parsedData);
    handleNewMessageReqReceived(parsedData, window.location.pathname, dispatch);
  });

  eventSource.onerror = (err) => {
    console.error("EventSource failed:", err);
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log("EventSource is already closed");
      dispatch(sseActions.sseDisconnected());
    } else {
      eventSource.close();
      dispatch(sseActions.sseDisconnected());
    }
  };

  // figure out why you were even using this lmao
  const intervalId = setInterval(() => {
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log("SSE connection closed");
      clearInterval(intervalId);
      dispatch(sseActions.sseDisconnected());
    }
  }, 5000); // Check every 5 seconds

  return () => {
    if (eventSource) {
      eventSource.close();
      dispatch(sseActions.sseDisconnected());
      clearInterval(intervalId);
      console.log("sse connection closed");
    }
  };
};
