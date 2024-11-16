import styles from "./actionBar.module.css";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import {
    exportAllChartsToPDF,
    exportAllChartsToDOCX,
    exportAllChartsToPPTX
} from "../../logic/exportFunction";

type OptionType = {
    value: string;
    label: string;
};

const ActionBar = () => {
    const [selectedFormats, setSelectedFormats] = useState<OptionType[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<OptionType[]>([]);
    const [selectedArea, setSelectedArea] = useState<OptionType[]>([]);

    const [areas, setAreas] = useState<OptionType[]>([]);

    const sprints: OptionType[] = [
        { value: "Sprint 1", label: "Sprint 1" },
        { value: "Sprint 2", label: "Sprint 2" },
    ];

    const documentTypes: OptionType[] = [
        { value: "pdf", label: "PDF" },
        { value: "docx", label: "DOCX" },
        { value: "pptx", label: "PPTX" },
    ];

    useEffect(() => {
        const getUniqueAreas = async () => {
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
        getUniqueAreas()
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

    return (
        <div className={styles.actionBar}>
            <MultiSelect
                className={styles.selector}
                options={sprints}
                value={selectedSprint}
                onChange={setSelectedSprint}
                labelledBy="Выберите спринт"
                overrideStrings={{
                    selectSomeItems: "Выберите спринт",
                    allItemsAreSelected: "Все спринты выбраны",
                    selectAll: "Выбрать все",
                    clearAll: "Очистить выбор"
                }}
            />

            <button className="primary-button">+ диаграмма</button>

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

            <MultiSelect
                className={styles.selector}
                options={areas}
                value={selectedArea}
                onChange={setSelectedArea}
                labelledBy="Выберите команду"
                overrideStrings={{
                    selectSomeItems: "Выберите команду",
                    allItemsAreSelected: "Все команды выбраны",
                    selectAll: "Выбрать все",
                    clearAll: "Очистить выбор"
                }}
            />
            <button className={styles.resetButton}>Сбросить</button>
        </div>
    );
};

export default ActionBar;
