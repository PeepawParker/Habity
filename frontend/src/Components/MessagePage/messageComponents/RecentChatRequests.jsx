import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecentChatRequests } from "../../../axiosRequests/Messages/getRecentChatRequests";
import { getRecentChatMessage } from "../../../axiosRequests/Messages/getRecentChatMessage";
import { getAllQueuedMessages } from "../../../axiosRequests/Messages/getAllQueuedMessages";
import { useNavigate } from "react-router-dom";
import { rejectMessageReq } from "../../../axiosRequests/Messages/rejectMessageReq";

export default function RecentChatRequests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recentChatReqs = useSelector((state) => state.chats.recentChatReqs);
  const chatReqQueue = useSelector((state) => state.chats.chatReqQueue);
  const chatReqFetchStatus = useSelector(
    (state) => state.chats.chatReqFetchStatus
  );
  const curUserId = useSelector((state) => state.user.userId);
  const userTimeZone = useSelector((state) => state.user.timeZone);
  const currentChatReqToUpdate = useSelector(
    (state) => state.chats.curChatReqToUpdate
  );

  const handleUserClick = (curUserId, userId, chatId) => {
    if (chatId) {
      navigate(`/messageReqs/${curUserId}/${userId}/${chatId}`);
    } else {
      navigate(`/messageReqs/${curUserId}/${userId}`);
    }
  };

  useEffect(() => {
    if (chatReqFetchStatus === "not_fetched") {
      getRecentChatRequests(curUserId, dispatch);
    } else {
      if (Object.keys(chatReqQueue).length > 1) {
        console.log("here are the queued chats", chatReqQueue);
        getAllQueuedMessages(chatReqQueue, "messageRequest", dispatch);
      }
    }
  }, [chatReqFetchStatus, curUserId, dispatch, chatReqQueue]);

  useEffect(() => {
    const updateChats = async () => {
      if (
        currentChatReqToUpdate !== null &&
        Object.keys(chatReqQueue).length === 1
      ) {
        await getRecentChatMessage(currentChatReqToUpdate, dispatch);
      }
    };

    updateChats();
  }, [chatReqQueue, currentChatReqToUpdate, dispatch]);

  return (
    <ul>
      {recentChatReqs &&
      recentChatReqs.history &&
      recentChatReqs.history.length > 0 ? (
        recentChatReqs.history.map((historyItem) => {
          const chat = recentChatReqs[historyItem.chat_id];
          const timeSent = new Date(chat.time_sent).toLocaleString("en-US", {
            timeZone: userTimeZone,
            timeZoneName: "short",
          });

          return (
            <li
              key={chat.message_id}
              onClick={() => {
                handleUserClick(curUserId, chat.other_user_id, chat.chat_id);
              }}
            >
              <div className="chat-box">
                {chat.read_status === false && chat.sender_id !== curUserId && (
                  <p>There is a new Message Request!</p>
                )}
                Conversation Request From {chat.other_user_id}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectMessageReq(chat.chat_id, navigate, dispatch);
                  }}
                >
                  Reject
                </button>
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
        <li>You have no message requests at this point in time</li>
      )}
    </ul>
  );
}
