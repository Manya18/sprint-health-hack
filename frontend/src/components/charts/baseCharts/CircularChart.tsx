import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

type CircularChartProps = {
    data: { [key: string]: number };
    labels: string[];
};

const CircularChart = ({ data, labels }: CircularChartProps) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: Object.values(data),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
        ],
    };

    return <Pie data={chartData} />;
};

export default CircularChart;
