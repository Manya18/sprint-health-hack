import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import styles from './sprintSuccessRate.module.css'

const SprintSuccessRate = ({sprintName, areas}: {sprintName: string, areas?: string[]}) => {

    const [inImplementation, setInImplementation] = useState(0);
    const [cancel, setCancel] = useState(0);
    const [backlog, setBacklog] = useState(0);
    const [resolution, setResolution] = useState('');


    useEffect(() => {
        const getSuccessParams = async () => {
            try {
                const response = await fetch(`http://localhost:8000/success_rate_parameters?sprint_names=${sprintName}`);
                const data = await response.json()
                setInImplementation(data.in_implementation_percentage);
                setCancel(data.cancel_percentage)
            } catch (e) {
                console.error(e);
            }
        }
        const getBacklog = async () => {
            try {
                const response = await fetch(`http://localhost:8000/backlog_changes_persentage?sprint_names=${sprintName}`);
                const data = await response.json()
                setBacklog(data)
            } catch (e) {
                console.error(e);
            }
        }
        getSuccessParams()
        getBacklog()
    }, []);

    useEffect(() => {
        if (inImplementation <= 0.2 && cancel <= 0.1 && backlog <= 0.2) {
            setResolution("Спринт успешен!");
        } else if (inImplementation > 0.8 && cancel > 0.9 && backlog > 0.8) {
            setResolution("Спринт неуспешен");
        } else {
            setResolution("Резолюция не определена");
        }
    }, [inImplementation, cancel, backlog]);

    return(
        <div className={styles.wrapper}>
            <h3 className={styles.title}>{resolution}</h3>
            <div className={styles.sprintSuccessRate}>
                <GaugeChart id="gauge-chart1" percent={inImplementation * 100} textColor="black" />
                <GaugeChart id="gauge-chart1" percent={cancel * 100} textColor="black" />
                <GaugeChart id="gauge-chart1" percent={backlog} textColor="black" />
            </div>
        </div>
    )
}

export default SprintSuccessRate