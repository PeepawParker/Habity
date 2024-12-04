export default function generateChartData(data, habitName) {
  if (data.date !== undefined && data.value !== undefined) {
    return {
      labels: [data.date],
      datasets: [
        {
          label: habitName,
          data: [data.value],
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  }

  const dataArray = Object.keys(data).map((key) => ({
    date: key,
    value: data[key].value,
  }));

  if (!data) console.log("no data: ", data, habitName);
  return {
    labels: dataArray.map((dp) => dp.date),
    datasets: [
      {
        label: habitName,
        data: dataArray.map((dp) => dp.value),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
}
