import { useEffect, useState } from "react"; 
import styles from "./timelineSlider.module.css"; 
import { Slider, Typography } from "@mui/material";
import { useStore } from "../../logic/useStore";

const TimelineSlider = ({sprintNames}:{sprintNames: string[]}) => { 
    const [startDate, setStartDate] = useState<Date>(new Date(2024, 0, 1))
    const [endDate, setEndDate] = useState<Date>(new Date(2024, 0, 15))

    const { setTimelineEnd } = useStore();
    
    useEffect(() => {
        const getDates = async () => {
            try {
                const response = await fetch(`http://localhost:8000/get_sprint_period?sprint_name=${sprintNames[0]}`);
                const data = await response.json();
                setTimelineEnd(new Date(data.sprint_end_date));
                setStartDate(new Date(data.sprint_start_date));
                setEndDate(new Date(data.sprint_end_date));
            } catch (e) {
                console.error(e);
            }
        };
        getDates();
    }, [sprintNames, setTimelineEnd]);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const [value, setValue] = useState<number>(totalDays);

    const getDateFromDays = (days: number) => {
        return new Date(startDate.getTime() + (days * 1000 * 60 * 60 * 24));
    };

    const handleChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setValue(newValue);
            setTimelineEnd(getDateFromDays(newValue));
        }
    };

    return (
        <div className={styles.timelineSlider}>
            <h2>Выберите период для анализа</h2>
            <div className={styles.wrapper}>
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