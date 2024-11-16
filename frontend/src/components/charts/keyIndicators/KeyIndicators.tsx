import { KeyIndicatorsType } from '../../../types/chartsTypes';
import styles from './keyIndicators.module.css'

const KeyIndicators = ({ data, sprintName }: { data: KeyIndicatorsType[], sprintName: string }) => {

    const indicators = [
        {label: "К выполнению", count: 35},
        {label: "В работе", count: 35},
        {label: "Сделано", count: 35},
        {label: "Снято", count: 35},
        {label: "Бэклог изменен с начала спринта на", count: 35},
    ]

    return (
        <div className={styles.keyIndicators}>
            {indicators.map((ind, index) => (
                <div key={index} className={styles.indicator}>
                    <span className={styles.label}>{ind.label}</span>
                    <span className={styles.count}>{ind.count}</span>
                </div>
            ))}
        </div>
    )
}
export default KeyIndicators;