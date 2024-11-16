import React, { useState, useRef, useEffect } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chart as ChartJS, registerables } from 'chart.js';
import GridLayout from 'react-grid-layout';
import Modal from '@mui/material/Modal';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';

import SprintHealthChart from '../charts/sprintHealth/SprintHealthChart';
import './DashboardChartStyles.css';
import BurnDownChart from '../charts/burnDown/BurnDownChart';
import { BurnDownChartType, KeyIndicatorsType, SprintHealthChartType } from '../../types/chartsTypes';
import KeyIndicators from '../charts/keyIndicators/KeyIndicators';


ChartJS.register(...registerables);

interface ChartData {
    id: string;
    type: string;
    data: SprintHealthChartType | BurnDownChartType | KeyIndicatorsType[];
    name: string;
    xAxisTitle: string;
    yAxisTitle: string;
    title: string;
    gridPosition: { x: number; y: number; w: number; h: number };
}

const Dashboard: React.FC = () => {
    const [isModalContext, setIsModalContext] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [contextMenuDaschboard, setContextMenuDaschboard] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [pasteMenu, setPasteMenu] = useState<{ x: number; y: number } | null>(null);
    const [diagramName, setDiagramName] = useState('');
    const [clipboard, setClipboard] = useState<ChartData | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [charts, setCharts] = useState<ChartData[]>([
        {
            id: "1",
            type: 'sprintHealth',
            data: { toDo: 10, inProgress: 20, done: 30, removed: 5, backlogChange: 5.3, blocked: 0 },
            name: 'Здоровье спринта',
            xAxisTitle: '',
            yAxisTitle: '',
            title: '',
            gridPosition: { x: 0, y: 0, w: 6, h: 5 },
        },
        {
            id: "2",
            type: 'burnDown',
            data: { dates: ["2024-11-01", "2024-11-02"], remainingWork: [50, 40] },
            name: 'Диаграмма сгорания',
            xAxisTitle: '',
            yAxisTitle: '',
            title: '',
            gridPosition: { x: 15, y: 20, w: 6, h: 8 },
        },
        {
            id: "3",
            type: 'keyIndicators',
            data: [
                {label: "К выполнению", count: 35},
                {label: "В работе", count: 35},
                {label: "Сделано", count: 35},
                {label: "Снято", count: 35},
                {label: "Бэклог изменен с начала спринта на", count: 35},
            ],
            name: 'Диаграмма сгорания',
            xAxisTitle: '',
            yAxisTitle: '',
            title: '',
            gridPosition: { x: 15, y: 20, w: 8, h: 4 },
        },
    ]);

    const renderChart = (chart: ChartData) => {
        switch (chart.type) {
            case 'sprintHealth':
                const SprintHealthData = chart.data as SprintHealthChartType;
                return <SprintHealthChart data={SprintHealthData} sprintName="Спринт 1" />;
            case 'burnDown':
                const burnDownData = chart.data as BurnDownChartType;
                return <BurnDownChart
                    data={burnDownData}
                    sprintName="Спринт 1"
                />;
            case 'keyIndicators':
                const keyIndicates = chart.data as KeyIndicatorsType[];
                return <KeyIndicators
                    data={keyIndicates}
                    sprintName="Спринт 1"
                />;
            default:
                return null;
        }
    };

    const handleChartContextMenu = (e: React.MouseEvent, chartId: string) => {
        e.preventDefault();
        setContextMenu(null);
        setPasteMenu(null);
        setContextMenuDaschboard({ x: e.clientX, y: e.clientY, chartId });
    };

    useEffect(() => {
        if (contextMenuDaschboard && contextMenuDaschboard.chartId !== clipboard?.id) {
            setIsModalContext(true);
        }
    }, [contextMenuDaschboard]);

    const handleCopyClick = (e: React.MouseEvent, chartId: string) => {
        e.stopPropagation();
        const chartToCopy = charts.find(chart => chart.id === chartId);

        if (chartToCopy) {
            if (clipboard && clipboard.id === chartToCopy.id) return;

            setClipboard({
                id: chartToCopy.id,
                type: chartToCopy.type,
                name: diagramName,
                data: chartToCopy.data,
                xAxisTitle: chartToCopy.xAxisTitle,
                yAxisTitle: chartToCopy.yAxisTitle,
                title: chartToCopy.title,
                gridPosition: chartToCopy.gridPosition
            });
            toast.success('Диаграмма скопирована в буфер обмена');
        }
        setIsModalContext(false);
    };


    const handleEditClick = (chartId: any) => {
        const chartToEdit = charts.find((chart) => chart.id === chartId);
        if (chartToEdit) {
            setIsEditModalOpen(true);
        }
        setIsModalContext(false);
    };

    const getNextAvailablePosition = (charts: ChartData[], chartWidth: number, chartHeight: number) => {
        let x = 0, y = 0;
        let found = false;

        while (!found) {
            found = !charts.some(chart => {
                return chart.gridPosition.x < x + chartWidth &&
                    chart.gridPosition.x + chart.gridPosition.w > x &&
                    chart.gridPosition.y < y + chartHeight &&
                    chart.gridPosition.y + chart.gridPosition.h > y;
            });

            if (!found) {
                y += chartHeight;
                if (y > 40 * 12) {
                    x += chartWidth;
                    y = 0;
                }
            }
        }
        return { x, y };
    };

    const handlePaste = () => {
        if (clipboard) {
            const { x, y } = getNextAvailablePosition(charts, clipboard.gridPosition.w, clipboard.gridPosition.h);

            const newChart = {
                ...clipboard,
                id: uuidv4(),
                gridPosition: { x, y, w: clipboard.gridPosition.w, h: clipboard.gridPosition.h }
            };

            setCharts((prevCharts) => [...prevCharts, newChart]);
            toast.success('Диаграмма вставлена из буфера обмена');
        } else {
            toast.warn('Нечего вставлять');
        }
        setPasteMenu(null);
    };


    return (
        <div
            className="appContainer"
            onClick={() => {
                setContextMenu(null);
                setPasteMenu(null);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setPasteMenu({ x: e.clientX, y: e.clientY });
            }}
        >
            <GridLayout className="layout dashboard-container" cols={12} rowHeight={40} width={1200}>
                {charts.map((chart, index) => (
                    <div
                        key={chart.id}
                        id={chart.id}
                        className="chartCard dashboard"
                        data-grid={{
                            x: chart.gridPosition.x,
                            y: chart.gridPosition.y + (index * 2),
                            w: chart.gridPosition.w,
                            h: chart.gridPosition.h,
                        }}
                        onContextMenu={(e) => handleChartContextMenu(e, chart.id)}
                    >
                        <div className={'dragHandle drag-icon'}>
                            <DragIndicatorIcon />
                        </div>
                        <div className="chart-container">
                            <div className="chart">{renderChart(chart)}</div>
                        </div>
                        <div
                            className={'moreVertIcon more-vert-icon'}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsModalContext(true);
                                handleChartContextMenu(e, chart.id);
                            }}
                        >
                            <MoreVertIcon />
                        </div>
                    </div>
                ))}
            </GridLayout>


            {
                contextMenu && (
                    <div
                        className='contextMenu'
                        style={{
                            position: 'absolute',
                            top: contextMenu.y,
                            left: contextMenu.x,
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        onMouseLeave={() => setContextMenu(null)}
                    >
                    </div>
                )
            }

            {
                pasteMenu && (
                    <div
                        className='contextMenu'
                        style={{
                            position: 'absolute',
                            top: pasteMenu.y,
                            left: pasteMenu.x,
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        onMouseLeave={() => setPasteMenu(null)}
                    >
                        <button className='menuButton' onClick={handlePaste}>Вставить</button>
                    </div>
                )
            }

            {
                contextMenuDaschboard && (
                    <Modal
                        open={isModalContext}
                        BackdropProps={{
                            style: { backgroundColor: 'transparent' },
                        }}
                        onClose={() => setIsModalContext(false)}
                    >
                        <div
                            className='modalContentDashboard'
                            style={{
                                position: 'absolute',
                                top: contextMenuDaschboard.y,
                                left: contextMenuDaschboard.x,
                            }}
                        >
                            <div className='widgetMenu'>
                                <button
                                    className='menuButton'
                                    onClick={(e) => handleCopyClick(e, contextMenuDaschboard.chartId)}
                                >
                                    Копировать
                                </button>
                                <button
                                    className='menuButton'
                                    onClick={() => handleEditClick(contextMenuDaschboard.chartId)}
                                >
                                    Изменить
                                </button>
                            </div>
                        </div>
                    </Modal>
                )
            }

            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className='modalContentEdit'>
                    <h2>Изменить график</h2>
                    <label>Название диаграммы:</label>
                    <input
                        type="text"
                        value={diagramName}
                        onChange={(e) => setDiagramName(e.target.value)}
                        placeholder="Введите название"
                    />
                </div>
            </Modal>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div >
    );
};

export default Dashboard;

