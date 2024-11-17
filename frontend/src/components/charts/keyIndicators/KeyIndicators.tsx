import { KeyIndicatorsType } from '../../../types/chartsTypes';
import styles from './keyIndicators.module.css';

const KeyIndicators = ({ data, sprintName }: { data: KeyIndicatorsType[], sprintName: string }) => {

    return (
        <div className={styles.keyIndicators}>
            {data.map((ind, index) => (
                <div key={index} className={styles.indicator}>
                    <span className={styles.label}>{ind.label}</span>
                    <span className={styles.count}>{ind.count}</span>
                </div>
            ))}
        </div>
    );
};

export default KeyIndicators;