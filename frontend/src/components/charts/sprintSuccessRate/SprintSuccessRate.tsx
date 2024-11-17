import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import styles from './sprintSuccessRate.module.css'

const SprintSuccessRate = ({ data, sprintName }: { data: any, sprintName: string, areas?: string[] }) => {

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>{data.resolution}</h3>
            <div className={styles.sprintSuccessRate}>
                <GaugeChart id="gauge-chart1" percent={data.inImplementation} textColor="black" />
                <GaugeChart id="gauge-chart1" percent={data.cancel} textColor="black" />
                <GaugeChart id="gauge-chart1" percent={data.backlog} textColor="black" />
            </div>
        </div>
    )
}

export default SprintSuccessRate