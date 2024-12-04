import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserHome from "./Components/User Home Page/UserHome";
import LoginPage from "./Components/LoginPage/LoginPage";
import SignupPage from "./Components/SignupPage/SignupPage";
import HomePage from "./Components/Home Page/HomePage";
import PersonalFeed from "./Components/PersonalFeed/PersonalFeed";
import VisitorPage from "./Components/VisitorPage/VisitorPage";
import SettingsPage from "./Components/SettingsPage/SettingsPage";
import NotificationPage from "./Components/NotificationPage/NotificationPage";
import MessagePage from "./Components/MessagePage/MessagePage";
import MessageUser from "./Components/MessagePage/MessageUser";
import MessageGroup from "./Components/MessagePage/MessageGroup";
import RecentChatRequests from "./Components/MessagePage/messageComponents/RecentChatRequests";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./Components/NavBar/NavBar";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    errorElement: "ErrorPage",
    children: [
      { path: "", element: <HomePage /> },
      { path: "userhome", element: <UserHome /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "userfeed/:curUserId", element: <PersonalFeed /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "notifications", element: <NotificationPage /> },
      { path: "messages", element: <MessagePage /> },
      { path: "messages/:curUserId/:userId/unknown", element: <MessageUser /> },
      { path: "messages/:curUserId/:userId/:chatId", element: <MessageUser /> },
      { path: "messageReqs/:curUserId/:userId", element: <MessageUser /> },
      {
        path: "messageReqs/:curUserId/:userId/:chatId",
        element: <MessageUser />,
      },
      { path: "messageRequests", element: <RecentChatRequests /> },
      { path: "groupchat/:chatId", element: <MessageGroup /> }, // I will just pass a long string of all the usersIds within the groupchat and parse through it splitting it up by commas into an array to then use
      {
        path: "visitor/:username/:userId/:curUserId",
        element: <VisitorPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
}

export default App;
