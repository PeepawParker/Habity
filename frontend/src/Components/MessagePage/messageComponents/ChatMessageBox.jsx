export default function ChatMessageBox({
  pastMessages,
  curUserId,
  userTimeZone,
}) {
  return (
    <ul>
      {pastMessages.map((message, index) => {
        const timeSent = new Date(message.time_sent).toLocaleString("en-US", {
          timeZone: userTimeZone,
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        });
        return (
          <li
            key={index}
            style={{
              color: message.sender_id === curUserId ? "blue" : "black",
            }}
          >
            {message.message_data} {timeSent}
          </li>
        );
      })}
    </ul>
  );
}
