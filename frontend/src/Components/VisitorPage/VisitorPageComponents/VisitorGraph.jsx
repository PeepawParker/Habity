// eslint-disable-next-line no-unused-vars
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import generateChartData from "../../User Home Page/UserHomeFunctions/generateChartData";
import { useEffect, useState } from "react";
import { setHabitData } from "../../User Home Page/UserHomeFunctions/useEffectFunctions";
import { fetchHabitData } from "../../../axiosRequests/HabitData/fetchHabitData";

export default function VisitorGraph({ habit }) {
  const [biggestDataSet, setBiggestDataSet] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);
  const [largestNum, setLargestNum] = useState(7);
  const [numReturned, setNumReturned] = useState(7);
  let habitNameInput;

  if (!habit.habit_name) {
    habitNameInput = habit.newHabit.habitName;
  } else {
    habitNameInput = habit.habit_name;
  }

  const handleNumClick = (number) => {
    if (number > largestNum) {
      setLargestNum(number);
      setNumReturned(number);
    } else {
      const smallerArray = {};
      const DataKeys = Object.keys(biggestDataSet);
      for (let i = DataKeys.length - number; i <= DataKeys.length - 1; i++) {
        if (i < 0) {
          i = 0;
        }
        smallerArray[biggestDataSet[DataKeys[i]].date] =
          biggestDataSet[DataKeys[i]];
      }
      setDataPoints(smallerArray);
    }
  };

  useEffect(() => {
    setHabitData(
      habit,
      numReturned,
      setDataPoints,
      setBiggestDataSet,
      fetchHabitData
    );
  }, [habit, numReturned]);

  return (
    <>
      <div className="GraphBox">
        <Line data={generateChartData(dataPoints, habitNameInput)} />
        <div>
          <button onClick={() => handleNumClick(7)}>7d</button>
          <button onClick={() => handleNumClick(30)}>30d</button>
          <button onClick={() => handleNumClick(365)}>365d</button>
          <button onClick={() => handleNumClick(false)}>All Time</button>
        </div>
      </div>
    </>
  );
}
