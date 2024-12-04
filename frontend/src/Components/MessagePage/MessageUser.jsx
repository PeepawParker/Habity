import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { messageUser } from "../../axiosRequests/Messages/messageUser";
import { useSelector, useDispatch } from "react-redux";
import { getChatIdMessages } from "../../axiosRequests/Messages/getChatIdMessages";
import ChatMessageBox from "./messageComponents/ChatMessageBox";
import { chatActions } from "../../store/chatStore";
import { rejectMessageReq } from "../../axiosRequests/Messages/rejectMessageReq";
import { fetchUserPrivacy } from "../../axiosRequests/Users/fetchUserPrivacy";

export default function MessageUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId, chatId } = useParams();
  const pastMessages = useSelector((state) => state.messages.messages);
  const userTimeZone = useSelector((state) => state.user.timeZone);
  const curUserId = useSelector((state) => state.user.userId);
  const sseConnection = useSelector((state) => state.sse.sseConnection);
  const curUserFollowingIds = useSelector((state) => state.data.followingIds);
  const recentChats = useSelector((state) => state.chats.recentChats);
  const [chatIdIsPrivate, setChatIdIsPrivate] = useState("unknown");
  const [curMessage, setCurMessage] = useState("");
  const { pathname } = useLocation();
  const isMessageReq = window.location.pathname.includes("messageReqs");
  const chatIdUnknown = window.location.pathname.includes("unknown");

  const handleSendMessageToUser = async (curMessage) => {
    const messageData = await messageUser(
      curUserId,
      userId,
      chatId,
      curMessage,
      isMessageReq,
      dispatch
    );

    console.log("here is the messageData", messageData);

    const messageObj = {
      message_id: messageData.messageId,
      time_sent: messageData.timeSent,
      message_data: curMessage,
      read_status: false,
      sender_id: curUserId,
      other_user_id: messageData.otherUserId,
      chat_id: messageData.chatId,
      message_type: isMessageReq ? "messageRequest" : "message",
    };

    if (isMessageReq) {
      dispatch(
        // double check that this removes it from the recentChatReqs and puts it into the recentChats
        chatActions.respondToChatReq({
          chatId: chatId ? chatId : messageData.chatId,
          message: messageObj,
        })
      );
      navigate(
        `/messages/${curUserId}/${messageData.otherUserId}/${messageData.chatId}`
      );
    } else {
      dispatch(
        chatActions.updateRecentChats({
          messages: [messageObj],
        })
      );
    }

    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    if (pathSegments[0] === "messages" && pathSegments.length === 3) {
      navigate(
        `/messages/${pathSegments[1]}/${pathSegments[2]}/${messageData.chatId}`
      );
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) {
        return;
      } else {
        try {
          await getChatIdMessages(chatId, curUserId, dispatch);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      }
    };

    if (sseConnection) {
      fetchMessages();
    }
  }, [chatId, curUserId, dispatch, sseConnection]);

  useEffect(() => {
    if (chatIdUnknown) {
      fetchUserPrivacy(userId, setChatIdIsPrivate);
    } else {
      if (curUserFollowingIds[userId] || isMessageReq) {
        setChatIdIsPrivate(false);
      } else if (recentChats && recentChats[chatId]) {
        if (recentChats[chatId].message_type === "message") {
          setChatIdIsPrivate(false);
        } else if (recentChats[chatId].message_type === "messageRequest") {
          setChatIdIsPrivate(true);
        } else {
          fetchUserPrivacy(userId, setChatIdIsPrivate);
        }
      } else {
        fetchUserPrivacy(userId, setChatIdIsPrivate);
      }
    }
  }, [
    chatId,
    chatIdUnknown,
    curUserFollowingIds,
    isMessageReq,
    recentChats,
    userId,
  ]);

  useEffect(() => {
    if (chatId) {
      dispatch(chatActions.readRecentChat({ chatId }));

      return () => {
        dispatch(chatActions.readRecentChat({ chatId }));
      };
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    "this is the chatId", chatId;
  });

  if (!sseConnection) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>Message the user here !</p>
      {chatIdIsPrivate && (
        <p>
          This user is private, this message will be sent as a message request
        </p>
      )}

      <div className="This will be the chatBox component">
        {isMessageReq && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              rejectMessageReq(chatId, navigate, dispatch);
            }}
          >
            Reject Message Request
          </button>
        )}
        <ChatMessageBox
          pastMessages={pastMessages}
          curUserId={curUserId}
          userTimeZone={userTimeZone}
        />
        <input
          placeholder="message"
          value={curMessage}
          onChange={(e) => setCurMessage(e.target.value)}
        />
        <button onClick={() => handleSendMessageToUser(curMessage)}>
          Send
        </button>
      </div>
    </>
  );
}
