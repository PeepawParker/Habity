import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import VisitorGraphPage from "./VisitorPageComponents/VisitorGraphPage";

export default function VisitorPage() {
  const loggedInUsername = useSelector((state) => state.user.username);

  return <VisitorGraphPage loggedInUsername={loggedInUsername} />;
}
