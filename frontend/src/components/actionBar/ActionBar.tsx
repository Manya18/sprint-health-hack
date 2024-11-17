import styles from "./actionBar.module.css";
import { ReactNode, useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { exportAllChartsToPDF, exportAllChartsToDOCX, exportAllChartsToPPTX } from "../../logic/exportFunction";
import { useStore } from "../../logic/useStore";
import SprintHealthChart from "../charts/sprintHealth/SprintHealthChart";
import BurnDownChart from "../charts/burnDown/BurnDownChart";
import CircularChart from "../charts/baseCharts/CircularChart";
import RingChart from "../charts/baseCharts/RingChart";
import { BarChart } from "@mui/icons-material";
import { JSX } from "react/jsx-runtime";

type OptionType = {
    value: string;
    label: string;
};

type ActionBarProps = {
    onSprintChange: (sprint: string[]) => void;
};

const ActionBar = ({ onSprintChange }: ActionBarProps) => {
    const [selectedFormats, setSelectedFormats] = useState<OptionType[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<OptionType[]>([]);
    const [selectedArea, setSelectedArea] = useState<OptionType[]>([]);
    const [areas, setAreas] = useState<OptionType[]>([]);
    const [selectedCharts, setSelectedCharts] = useState<OptionType[]>([]);
    const [sprints, setSprints] = useState<OptionType[]>([]);

    const { selectedAreas, setSelectedAreas, selectedSprints, setSelectedSprints, addChart } = useStore();

    const chartTypes: OptionType[] = [
        { value: "sprintHealth", label: "Здоровье спринта" },
        { value: "burnDown", label: "Диаграмма сгорания спринта" },
        { value: "circular", label: "Круговая диаграмма" },
        { value: "ring", label: "Кольцевая диаграмма" },
        { value: "bar", label: "Столбчатая диаграмма" },
    ];

    const documentTypes: OptionType[] = [
        { value: "pdf", label: "PDF" },
        { value: "docx", label: "DOCX" },
        { value: "pptx", label: "PPTX" },
    ];

    useEffect(() => {
        const fetchUniqueAreas = async () => {
            try {
                const response = await fetch("http://localhost:8000/get_unique_areas");
                const data = await response.json()
                const sprintOptions = data.unique_areas.map((name: string) => ({
                    value: name,
                    label: name
                }));
                setAreas(sprintOptions);
            } catch (e) {
                console.error(e);
            }
        }

        const fetchSprints = async () => {
            try {
                const response = await fetch('http://localhost:8000/get_unique_sprints');
                const data = await response.json();
                const sprintOptions = data.unique_sprints.map((name: string) => ({
                    value: name,
                    label: name
                }));
                setSprints(sprintOptions);
            } catch (error) {
                console.error("Ошибка при загрузке спринтов:", error);
            }
        };

        fetchUniqueAreas()
        fetchSprints()
    }, []);

    const handleExport = () => {
        if (selectedFormats.length > 0) {
            selectedFormats.forEach((item) => {
                switch (item.value) {
                    case "pdf":
                        exportAllChartsToPDF();
                        break;
                    case "docx":
                        exportAllChartsToDOCX();
                        break;
                    case "pptx":
                        exportAllChartsToPPTX();
                        break;
                    default:
                        break;
                }
            });
        } else {
            console.log("Нужно выбрать хотя бы один формат для экспорта");
        }
    };

    const handleSprintSelect = (selected: OptionType[]) => {
        setSelectedSprint(selected);
        onSprintChange(selected.map((item) => item.value));
    };

    const handleAddCharts = () => {
        const newCharts: ReactNode[] | JSX.Element[] = [];
        selectedCharts.forEach((chart) => {
            switch (chart.value) {
                case "sprintHealth":
                    newCharts.push(<SprintHealthChart key="sprintHealth" data={{
                        toDo: 0,
                        inProgress: 0,
                        done: 0,
                        removed: 0,
                        backlogChange: 0,
                        blocked: 0
                    }} sprintName={""} />);
                    break;
                case "burnDown":
                    newCharts.push(<BurnDownChart key="burnDown" data={{
                        dates: ['1'],
                        remainingWork: [1]
                    }} sprintName={""} />);
                    break;
                case "circular":
                    newCharts.push(<CircularChart key="circular" data={{}} labels={[]} />);
                    break;
                case "ring":
                    newCharts.push(<RingChart key="ring" data={{}} labels={[]} />);
                    break;
                case "bar":
                    newCharts.push(<BarChart key="bar" />);
                    break;
                default:
                    break;
            }
        });
        addChart(newCharts); 
    };

    return (
        <div className={styles.actionBar}>
            <MultiSelect
                className={styles.selector}
                options={sprints}
                value={selectedSprint}
                onChange={handleSprintSelect}
                labelledBy="Выберите спринт"
                overrideStrings={{
                    selectSomeItems: "Выберите спринт",
                    allItemsAreSelected: "Все спринты выбраны",
                    selectAll: "Выбрать все",
                    clearAll: "Очистить выбор"
                }}
            />

            <MultiSelect
                className={styles.selector}
                options={areas}
                value={selectedAreas}
                onChange={setSelectedAreas}
                labelledBy="Выберите команду"
                overrideStrings={{
                    selectSomeItems: "Выберите команду",
                    allItemsAreSelected: "Все команды выбраны",
                    selectAll: "Выбрать все",
                    clearAll: "Очистить выбор"
                }}
            />

            <MultiSelect
                className={styles.selector}
                options={chartTypes}
                value={selectedCharts}
                onChange={setSelectedCharts}
                labelledBy="Выберите типы диаграмм"
                overrideStrings={{
                    selectSomeItems: "Выберите тип диаграммы",
                    allItemsAreSelected: "Все типы выбраны",
                    selectAll: "Выбрать все",
                    clearAll: "Очистить выбор"
                }}
            />
            <button className="primary-button" onClick={handleAddCharts}>+ диаграмма</button>
            
            <div className={styles.export}>
                <MultiSelect
                    className={styles.selector}
                    options={documentTypes}
                    value={selectedFormats}
                    onChange={setSelectedFormats}
                    disableSearch={true}
                    labelledBy="Выберите формат документа"
                    overrideStrings={{
                        selectSomeItems: "Выберите формат документа",
                        allItemsAreSelected: "Все форматы выбраны",
                        selectAll: "Выбрать все",
                        clearAll: "Очистить выбор"
                    }}
                />
                <button
                    className="primary-button"
                    onClick={handleExport}
                >
                    Экспортировать
                </button>
            </div>
        </div>
    );
};

export default ActionBar;
