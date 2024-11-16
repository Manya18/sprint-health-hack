import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import styles from './burnDownChart.module.css';
import { BurnDownChartType } from '../../../types/chartsTypes';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale);


const BurnDownChart = ({ data, sprintName }: { data: BurnDownChartType, sprintName: string }) => {
    const [chartData, setChartData] = useState<any>(null);
    const chartRef = useRef(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];  // дата в формате YYYY-MM-DD
    };

    const isHolidayOrWeekend = (date: Date) => {
        const dayOfWeek = date.getDay();
        const dateString = date.toISOString().split('T')[0];
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    useEffect(() => {
        if (data.dates && data.remainingWork) {
            const formattedDates = data.dates.map((date) => formatDate(date));

            const workDays = data.dates.filter(dateStr => {
                const date = new Date(dateStr);
                return !isHolidayOrWeekend(date);
            });
            const totalWorkDays = workDays.length;

            const chartData = {
                labels: formattedDates,
                datasets: [
                    {
                        label: 'Оставшаяся работа (часы)',
                        data: data.remainingWork,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: false,
                    },
                    {
                        label: 'Идеальное сгорание',
                        data: workDays.map((_, i) =>
                            data.remainingWork[0] * (1 - i / (totalWorkDays - 1))
                        ),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderDash: [5, 5],
                        fill: false,
                    }
                ],
            };

            setChartData(chartData);
        }
    }, [data]);

    return (
        <div>
            <div className={styles.title}>{`Диаграмма сгорания для спринта: ${sprintName}`}</div>
            <div>
                <div ref={chartRef}>
                    {chartData ? (
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: '',
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Дата',
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Оставшаяся работа (часы)',
                                        },
                                    },
                                },
                            }}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default BurnDownChart;
