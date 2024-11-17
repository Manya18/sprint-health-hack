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
import { useStore } from '../../logic/useStore';
import axios from 'axios';

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

interface UpdateTaskDuplicateParams {
    selectedSprint: string[];
    startDate: string;
    endDate: string;
    timeline?: string;
};

interface DashboardProps {
    selectedSprint: string[];
};

const Dashboard = ({ selectedSprint }: DashboardProps) => {
    const [isModalContext, setIsModalContext] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [contextMenuDaschboard, setContextMenuDaschboard] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [pasteMenu, setPasteMenu] = useState<{ x: number; y: number } | null>(null);
    const [diagramName, setDiagramName] = useState('');
    const [clipboard, setClipboard] = useState<ChartData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [charts, setCharts] = useState<ChartData[]>([]);
    const areas: any[] = [];

    async function getToDoTasks(sprintNames: string[], areas: any[] = []) {
        try {
            const sprintNamesStr = sprintNames.join(',');
            const areasStr = areas.length > 0 ? areas.join(',') : undefined;
            const params: any = {
                sprint_names: sprintNamesStr,
            };

            if (areasStr) {
                params.areas = areasStr;
            }
            const response = await axios.get('http://localhost:8000/get_to_do_tasks', {
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching to do tasks:', error);
            return [];
        }
    }
    async function getInWorkTasks(sprintNames: string[], areas: any[] = []) {
        try {
            const sprintNamesStr = sprintNames.join(',');
            const areasStr = areas.length > 0 ? areas.join(',') : undefined;
            const params: any = {
                sprint_names: sprintNamesStr,
            };

            if (areasStr) {
                params.areas = areasStr;
            }

            const response = await axios.get('http://localhost:8000/get_in_work_tasks', {
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching in work tasks:', error);
            return [];
        }
    }

    async function getCloseTasks(sprintNames: string[], areas: any[] = []) {
        try {
            const sprintNamesStr = sprintNames.join(',');
            const areasStr = areas.length > 0 ? areas.join(',') : undefined;
            const params: any = {
                sprint_names: sprintNamesStr,
            };

            if (areasStr) {
                params.areas = areasStr;
            }

            const response = await axios.get('http://localhost:8000/get_close_tasks', {
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching close tasks:', error);
            return [];
        }
    }

    async function getCancelTasks(sprintNames: string[], areas: any[] = []) {
        try {
            const sprintNamesStr = sprintNames.join(',');
            const areasStr = areas.length > 0 ? areas.join(',') : undefined;
            const params: any = {
                sprint_names: sprintNamesStr,
            };

            if (areasStr) {
                params.areas = areasStr;
            }

            const response = await axios.get('http://localhost:8000/get_cancel_tasks', {
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching close tasks:', error);
            return [];
        }
    }

    const updateTaskDuplicate = async ({ selectedSprint, startDate, endDate, timeline }: UpdateTaskDuplicateParams) => {
        try {
            const finalTimeline = timeline || endDate;

            const params = new URLSearchParams({
                sprint_names: selectedSprint[0],
                start_date: startDate,
                end_date: endDate,
                timeline: finalTimeline,
            });

            const response = await axios.put(`http://localhost:8000/update_task_duplicate?${params.toString()}`);

            if (response.status === 200) {
                fetchChartData(selectedSprint);
                return response.data;
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
    };

    const startDate = "2024-07-17";
    const endDate = "2024-07-30";
    const timeline = "2024-07-30";

    const [burnDownData, setBurnDownData] = useState<{ dates: string[]; remainingWork: number[] }>({
        dates: [],
        remainingWork: [],
    });

    const fetchBurnDownData = async (selectedSprint: string[]) => {
        try {

            const data = await Promise.all(
                selectedSprint.map(async (sprintName) => {
                    const response = await axios.get(
                        `http://localhost:8000/burn-down-chart?sprint_name=${selectedSprint[0]}`
                    );
                    return response.data || { dates: [], remainingWork: [] };
                })
            );

            const dates = data.flatMap((d) => d.dates || []);
            const remainingWork = data.flatMap((d) => d.remainingWork || []);
            console.log('dsds', dates, remainingWork)
            return { dates, remainingWork };
        } catch (error) {
            return { dates: [], remainingWork: [] };
        }
    };

    useEffect(() => {
        const loadBurnDownData = async () => {
            if (selectedSprint && selectedSprint.length > 0) {
                const data = await fetchBurnDownData(selectedSprint);
                setBurnDownData(data);
            }
        };

        loadBurnDownData();
    }, [selectedSprint]);

    const fetchChartData = async (sprintNames: string[]) => {

        const [toDo, inWork, closed, canceled] = await Promise.all([
            getToDoTasks(sprintNames, areas),
            getInWorkTasks(sprintNames, areas),
            getCloseTasks(sprintNames, areas),
            getCancelTasks(sprintNames, areas),
        ]);

        const toDoEstimations = toDo.map((task: { estimation: any; }) => task.estimation);
        const inWorkEstimations = inWork.map((task: { estimation: any; }) => task.estimation);
        const doneEstimations = closed.map((task: { estimation: any; }) => task.estimation);
        const canceledEstimations = canceled.map((task: { estimation: any; }) => task.estimation);

        const keyIndicatorsData: KeyIndicatorsType[] = [
            { label: 'К выполнению', count: toDoEstimations },
            { label: 'В работе', count: inWorkEstimations },
            { label: 'Сделано', count: doneEstimations },
            { label: 'Снято', count: canceledEstimations },
            { label: 'Бэклог изменен с начала спринта на', count: 5 }, // запрос
        ];

        const burnDownData = await fetchBurnDownData(sprintNames);

        console.log("burnDownData", burnDownData)
        setCharts([
            {
                id: '1',
                type: 'keyIndicators',
                data: keyIndicatorsData,
                name: 'Основные показатели',
                xAxisTitle: '',
                yAxisTitle: '',
                title: '',
                gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            },
            {
                id: '2',
                type: 'burnDown',
                data: burnDownData,
                name: 'Диаграмма сгорания',
                xAxisTitle: 'Дата',
                yAxisTitle: 'Оставшаяся работа (часы)',
                title: 'Диаграмма сгорания',
                gridPosition: { x: 6, y: 0, w: 5, h: 8 },
            },
        ]);
    };

    useEffect(() => {
        updateTaskDuplicate({
            selectedSprint,
            startDate,
            endDate,
            timeline,
        });
        if (selectedSprint && selectedSprint.length > 0) {
            fetchChartData(selectedSprint);
        }
        fetchBurnDownData(selectedSprint)

    }, [selectedSprint, startDate, endDate, timeline]);


    const renderChart = (chart: ChartData) => {
        switch (chart.type) {
            case 'sprintHealth':
                const SprintHealthData = chart.data as SprintHealthChartType;
                return <SprintHealthChart data={SprintHealthData} sprintName={selectedSprint[0]} />;
            case 'burnDown':
                const burnDownData = chart.data as BurnDownChartType;
                return <BurnDownChart
                    data={burnDownData}
                    sprintName={selectedSprint[0]}
                />;
            case 'keyIndicators':
                const keyIndicates = chart.data as KeyIndicatorsType[];
                return <KeyIndicators
                    data={keyIndicates}
                    sprintName={selectedSprint[0]}
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
            <GridLayout className="layout dashboard-container" cols={12} rowHeight={40} width={1600} isDraggable={false} isResizable={false}>
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
                    // onContextMenu={(e) => handleChartContextMenu(e, chart.id)}
                    >
                        {/* <div className={'dragHandle drag-icon'}>
                            <DragIndicatorIcon />
                        </div> */}
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