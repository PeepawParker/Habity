import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecentMessages } from "../../../axiosRequests/Messages/getRecentMessages";
import { getRecentChatMessage } from "../../../axiosRequests/Messages/getRecentChatMessage";
import { getAllQueuedMessages } from "../../../axiosRequests/Messages/getAllQueuedMessages";

export default function RecentUserChats({ handleUserClick, curUserId }) {
  const dispatch = useDispatch();
  const userTimeZone = useSelector((state) => state.user.timeZone);
  const chatFetchStatus = useSelector((state) => state.chats.chatFetchStatus);
  const recentChats = useSelector((state) => state.chats.recentChats);
  const chatQueue = useSelector((state) => state.chats.chatQueue);
  const currentChatToUpdate = useSelector(
    (state) => state.chats.curChatToUpdate
  );

  useEffect(() => {
    if (chatFetchStatus === "not_fetched") {
      getRecentMessages(curUserId, dispatch);
    } else {
      if (Object.keys(chatQueue).length > 1) {
        // function to query for all recent chats within the queue instead of requesting to get them one by one
        console.log("here are the queued chats", chatQueue);
        getAllQueuedMessages(chatQueue, "message", dispatch);
      }
    }
  }, [chatFetchStatus, curUserId, dispatch, chatQueue]);

  // I will need to make sure that this doesn't run if getAllQueuedMessages is going to run, I can probably get a check and have it change so if there is more than 1 item in the queue it will instead make the currentChatToUpdate null
  useEffect(() => {
    const updateChats = async () => {
      if (currentChatToUpdate !== null && Object.keys(chatQueue).length === 1) {
        console.log("currentChatToUpdate", currentChatToUpdate);
        await getRecentChatMessage(currentChatToUpdate, dispatch);
      }
    };

    updateChats();
  }, [chatQueue, currentChatToUpdate, dispatch]);

  return (
    <ul>
      {recentChats && recentChats.history && recentChats.history.length > 0 ? (
        recentChats.history.map((historyItem) => {
          const chat = recentChats[historyItem.chat_id];
          const timeSent = new Date(chat.time_sent).toLocaleString("en-US", {
            timeZone: userTimeZone,
            timeZoneName: "short",
          });

          return (
            <li
              key={chat.message_id}
              onClick={() => {
                handleUserClick(curUserId, chat.other_user_id);
              }}
            >
              <div className="chat-box">
                {chat.read_status === false && chat.sender_id !== curUserId && (
                  <p>There are new messages!</p>
                )}
                Conversation With {chat.other_user_id}
                <div>
                  <strong>Sent By: {chat.sender_id}</strong>
                </div>
                <div>
                  <strong>Message:</strong> {chat.message_data}
                </div>
                <div>{timeSent}</div>
                <br />
              </div>
            </li>
          );
        })
      ) : (
        <li>No recent chats</li>
      )}
    </ul>
  );
}
