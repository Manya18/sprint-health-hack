import styles from "./actionBar.module.css";
import { ReactNode, useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { exportAllChartsToPDF, exportAllChartsToDOCX, exportAllChartsToPPTX } from "../../logic/exportFunction";
import { useStore } from "../../logic/useStore";
import { MenuItem, Select } from "@mui/material";

interface ChartData {
    id: string;
    type: string;
    data: any;
    name: string;
    xAxisTitle: string;
    yAxisTitle: string;
    title: string;
    gridPosition: { x: number; y: number; w: number; h: number };
}
type OptionType = {
    value: string;
    label: string;
};

type ActionBarProps = {
    onSprintChange: (sprint: string[]) => void;
    setCharts: React.Dispatch<React.SetStateAction<ChartData[]>>;
};


const ActionBar = ({ onSprintChange, setCharts }: ActionBarProps) => {
    const [selectedFormats, setSelectedFormats] = useState<OptionType[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<OptionType | null>(null);
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

    const handleSprintSelect = (selected: any) => {
        const selectedSpr = sprints.find(el => el.value === selected.target.value);
        if(selectedSpr){
            setSelectedSprint(selectedSpr);
            onSprintChange([selectedSpr.value]);    
        }
    };

    const handleAddCharts = () => {
        const newCharts = selectedCharts.map((chart) => {
            switch (chart.value) {
                case "sprintHealth":
                    return {
                        id: `chart-${Date.now()}`,
                        type: "sprintHealth",
                        data: {
                            toDo: 5,
                            inProgress: 3,
                            done: 10,
                            removed: 1,
                            backlogChange: 2,
                            blocked: 0,
                        },
                        name: "Здоровье спринта",
                        xAxisTitle: "",
                        yAxisTitle: "",
                        title: "Спринт 1",
                        gridPosition: { x: 0, y: 0, w: 6, h: 4 },
                    };
                case "burnDown":
                    return {
                        id: `chart-${Date.now()}`,
                        type: "burnDown",
                        data: {
                            dates: ["2024-11-15", "2024-11-16", "2024-11-17"],
                            remainingWork: [20, 15, 5],
                        },
                        name: "Диаграмма сгорания",
                        xAxisTitle: "Дата",
                        yAxisTitle: "Оставшаяся работа (часы)",
                        title: "Диаграмма сгорания",
                        gridPosition: { x: 6, y: 0, w: 5, h: 8 },
                    };
                case "circular":
                    return {
                        id: `chart-${Date.now()}`,
                        type: "circular",
                        data: { "Выполнено": 40, "Осталось": 30 },
                        name: "",
                        xAxisTitle: "",
                        yAxisTitle: "",
                        title: "",
                        gridPosition: { x: 0, y: 10, w: 4, h: 6 },
                    };
                case "ring":
                    return {
                        id: `chart-${Date.now()}`,
                        type: "ring",
                        data: { "Команда A": 40, "Команда B": 30, "Команда C": 30 },
                        name: "",
                        xAxisTitle: "",
                        yAxisTitle: "",
                        title: "",
                        gridPosition: { x: 0, y: 10, w: 4, h: 6 },
                    };
                case "bar":
                    return {
                        id: `chart-${Date.now()}`,
                        type: "bar",
                        data: { "Команда A": 40, "Команда B": 30, "Команда C": 30 },
                        name: "",
                        xAxisTitle: "",
                        yAxisTitle: "",
                        title: "",
                        gridPosition: { x: 0, y: 10, w: 4, h: 6 },
                    };
                default:
                    return null;
            }
        }).filter(Boolean);

        setCharts((prevCharts: any) => [...prevCharts, ...newCharts]);
    };


    return (
        <div className={styles.actionBar}>
            <Select
                className={styles.selector}
                labelId="select-label"
                value={selectedSprint?.value || ''}
                onChange={handleSprintSelect}
                displayEmpty
            >
                <MenuItem value="" disabled>
                    Выберите спринт
                </MenuItem>
                {sprints.map(sprint => (
                    <MenuItem key={sprint.value} value={sprint.value}>
                        {sprint.value}
                    </MenuItem>
                ))}
            </Select>

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
