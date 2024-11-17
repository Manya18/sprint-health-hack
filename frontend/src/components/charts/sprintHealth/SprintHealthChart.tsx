import React from "react";
import styles from './sprintHealthChart.module.css';

const SprintHealthChart = ({ data, sprintName }: { data: Array<{ label: string, count: number[] }>, sprintName: string }) => {
  const transformData = (rawData: Array<{ label: string, count: number[] }>) => {
    const transformedData = {
      toDo: 0,
      inProgress: 0,
      done: 0,
      removed: 0,
    };

    rawData.forEach(item => {
      switch (item.label) {
        case "К выполнению":
          transformedData.toDo = item.count[0];
          break;
        case "В работе":
          transformedData.inProgress = item.count[0];
          break;
        case "Сделано":
          transformedData.done = item.count[0];
          break;
        case "Снято":
          transformedData.removed = item.count[0];
          break;
        default:
          break;
      }
    });

    return transformedData;
  };

  const transformedData = transformData(data);
  const total = transformedData.toDo + transformedData.inProgress + transformedData.done + transformedData.removed;

  const toDoWidth = (transformedData.toDo / total) * 100;
  const inProgressWidth = (transformedData.inProgress / total) * 100;
  const doneWidth = (transformedData.done / total) * 100;
  const removedWidth = (transformedData.removed / total) * 100;

  const statusStyles = [
    { color: "#6c757d", label: "К выполнению", value: transformedData.toDo / 100, width: toDoWidth },
    { color: "#f0ad4e", label: "В работе", value: transformedData.inProgress / 100, width: inProgressWidth },
    { color: "#5cb85c", label: "Сделано", value: transformedData.done / 100, width: doneWidth },
    { color: "#5bc0de", label: "Снято", value: transformedData.removed / 100, width: removedWidth },
  ];

  return (
    <div>
      <div className={styles.title}>Здоровье спринта {sprintName}</div>
      <div className={styles.marker}>
        {statusStyles.map((status, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center" }}>
            <div
              className={styles.markerCircle}
              style={{ backgroundColor: status.color }}
            />
            <span>{status.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chart}>
        {statusStyles.map((status, index) => (
          <div
            key={index}
            className={styles.chartSegment}
            style={{
              width: `${status.width}%`,
              backgroundColor: status.color,
            }}
          >
            {status.value > 0 && <span>{status.value.toFixed(1)}</span>}
          </div>
        ))}
      </div>

      <div className={styles.xAxis}>
        <span>Оценка Ч/Д</span>
      </div>
    </div>
  );
};

export default SprintHealthChart;
