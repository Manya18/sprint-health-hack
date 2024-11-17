import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

type BarChartProps = {
    data: { [key: string]: number };
    labels: string[];
};

const BarChart = ({ data, labels }: BarChartProps) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Значения",
                data: Object.values(data),
                backgroundColor: "#36A2EB",
                borderColor: "#36A2EB",
                borderWidth: 1,
            },
        ],
    };
    return <Bar data={chartData} />;
};

export default BarChart;
