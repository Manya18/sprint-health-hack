import { useState } from "react"; 
import styles from "./timelineSlider.module.css"; 
import { Slider, Typography } from "@mui/material";

const TimelineSlider = () => { 
    const startDate = new Date(2024, 0, 1); 
    const endDate = new Date(2024, 0, 15);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const [value, setValue] = useState([0, totalDays]);

    const getDateFromDays = (days: number) => {
        return new Date(startDate.getTime() + (days * 1000 * 60 * 60 * 24));
    };

    const handleChange = (event: any, newValue: any) => {
        setValue(newValue);
    };

    const handleInputChange = (index: number, event: any) => {
        const newDate = new Date(event.target.value);
        const newDays = Math.floor((newDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const newValue = [...value];
        newValue[index] = newDays;
        setValue(newValue);
    };

    return (
        <div className={styles.timelineSlider}>
            <h2>Выберите период для анализа</h2>
            <div className={styles.wrapper}>
                <div className={styles.inputsWrapper}>
                    <div className={styles.inputWrapper}>
                        <label>Дата от которой</label>
                        <input 
                            type="date" 
                            value={getDateFromDays(value[0] + 1).toISOString().split('T')[0]} 
                            onChange={(event) => handleInputChange(0, event)}
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <label>Дата до которой</label>
                        <input 
                            type="date" 
                            value={getDateFromDays(value[1] + 1).toISOString().split('T')[0]}
                            onChange={(event) => handleInputChange(1, event)}
                        />
                    </div>
                </div>
                <div className={styles.sliderWrapper}>
                    <Slider
                        value={value}
                        onChange={handleChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={totalDays}
                        marks={Array.from({ length: totalDays + 1 }, (_, index) => ({
                            value: index,
                            label: getDateFromDays(index).toLocaleDateString(),
                        }))}
                        aria-labelledby="range-slider"
                    />
                </div>
            </div>
        </div>
    );
};

export default TimelineSlider;