import styles from "./actionBar.module.css"
import { useState } from "react";
import { MultiSelect } from "react-multi-select-component";

const ActionBar =  () => {
    const [selected, setSelected] = useState([]);
    
    const sprints = [
        { value: "Sprint 1", label: "Sprint 1" },
        { value: "Sprint 2", label: "Sprint 2" },
    ];

    return (
        <div className={styles.actionBar}>
            <MultiSelect
                className={styles.selector}
                options={sprints}
                value={selected}
                onChange={setSelected}
                labelledBy="Select"
            />
            <button className="primary-button">+ диаграмма</button>
            <button className={styles.resetButton}>Сбросить</button>
        </div>
    )
}

export default ActionBar;