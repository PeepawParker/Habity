import { chatActions } from "../../store/chatStore";
import { dataActions } from "../../store/dataStore";
import { messageActions } from "../../store/messageStore";

import { userActions } from "../../store/userStore";

export async function checkPathFetchChatId(
  pathname,
  checkUsersChatId,
  curUserId,
  navigate
) {
  try {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    if (pathSegments[0] === "messages" && pathSegments.length === 3) {
      const chatId = await checkUsersChatId(curUserId, pathSegments[2]);
      if (chatId) {
        navigate(`/messages/${pathSegments[1]}/${pathSegments[2]}/${chatId}`);
      }
    }
  } catch (error) {
    console.error("Error checking path and fetching chat ID:", error);
  }
}

export function setupSSEConnection(curUserId, startSSEConnection, dispatch) {
  try {
    let cleanup;
    if (curUserId) {
      cleanup = startSSEConnection(curUserId, dispatch);
    }
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  } catch (error) {
    console.error("Error in SSE connection setup:", error);
  }
}

export function checkSessionRefresh(dispatch) {
  try {
    const lastActiveTimestamp = localStorage.getItem("lastActiveTimestamp");
    const currentTime = new Date().getTime();

    if (lastActiveTimestamp) {
      const timeDifference = currentTime - parseInt(lastActiveTimestamp, 10);
      if (timeDifference > 20 * 1000) {
        localStorage.clear();
        dispatch(userActions.resetUser());
        dispatch(chatActions.resetChats());
        dispatch(dataActions.resetData());
        dispatch(messageActions.resetMessages());
      }
    }

    localStorage.setItem("lastActiveTimestamp", currentTime.toString());
  } catch (error) {
    console.error("Error in session refresh:", error);
  }
}
