import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import styles from './sprintSuccessRate.module.css'

const SprintSuccessRate = ({ data, sprintName }: { data: any, sprintName: string, areas?: string[] }) => {

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>{data.resolution}</h3>
            <div className={styles.sprintSuccessRate}>
                <div className={styles.chartWrapper}>
                    <label>К выполнению</label>
                    <GaugeChart id="gauge-chart1" percent={data.inImplementation/100} textColor="black" />
                </div>
                <div className={styles.chartWrapper}>
                    <label>Снято</label>
                    <GaugeChart id="gauge-chart1" percent={data.cancel/100} textColor="black" />
                </div>
                <div className={styles.chartWrapper}>
                    <label>Изменения бэклога</label>
                    <GaugeChart id="gauge-chart1" percent={data.backlog/100} textColor="black" />
                </div>
            </div>
        </div>
    )
}

export default SprintSuccessRate