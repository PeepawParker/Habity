import { useSelector } from "react-redux";
import Graph from "./Graph";

const GraphBox = function GraphBox({ habit, setHabits }) {
  const username = useSelector((state) => state.user.username);

  return (
    <>
      <Graph habit={habit[0]} username={username} setHabits={setHabits} />
      {habit[1] && (
        <Graph habit={habit[1]} username={username} setHabits={setHabits} />
      )}
    </>
  );
};

export default GraphBox;
