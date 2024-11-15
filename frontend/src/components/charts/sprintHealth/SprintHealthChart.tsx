import React from "react";
import styles from './sprintHealthChart.module.css';
import { SprintHealthChartData } from "../../../types/charts";

const SprintHealthChart = ({ data, sprintName }: { data: SprintHealthChartData, sprintName: string }) => {
  const total = data.toDo + data.inProgress + data.done + data.removed;

  const toDoWidth = (data.toDo / total) * 100;
  const inProgressWidth = (data.inProgress / total) * 100;
  const doneWidth = (data.done / total) * 100;
  const removedWidth = (data.removed / total) * 100;

  const statusStyles = [
    { color: "#6c757d", label: "К выполнению", value: data.toDo, width: toDoWidth },
    { color: "#f0ad4e", label: "В работе", value: data.inProgress, width: inProgressWidth },
    { color: "#5cb85c", label: "Сделано", value: data.done, width: doneWidth },
    { color: "#5bc0de", label: "Снято", value: data.removed, width: removedWidth },
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
