import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

type RingChartProps = {
    data: { [key: string]: number };
    labels: string[];
};

const RingChart = ({ data, labels }: RingChartProps) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: Object.values(data),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                borderWidth: 0,
                circumference: Math.PI,
                rotation: -Math.PI,
            },
        ],
    };

    return <Pie data={chartData} options={{ cutout: "70%" }} />;
};

export default RingChart;
