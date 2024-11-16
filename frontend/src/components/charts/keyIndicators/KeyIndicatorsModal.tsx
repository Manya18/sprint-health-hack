import { Modal } from '@mui/material';
import styles from './keyIndicators.module.css'
import { useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';

const KeyIndicatorsModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [diagramName, setDiagramName] = useState('');

    const metrics = [
        {label: 'К выполнению', value: 'К выполнению'},
        {label: 'В работе', value: 'В работе'},
        {label: 'Сделано', value: 'Сделано'},
        {label: 'Снято', value: 'Снято'},
        {label: 'Бэклог изменен с начала спринта на', value: 'Бэклог изменен с начала спринта на'},
    ]

    const [selected, setSelected] = useState(metrics);


    return (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className={styles.modalContent}>
                <h2>Изменить график</h2>
                <div className={styles.modalField}>
                    <label>Название диаграммы:</label>
                    <input
                        type="text"
                        value={diagramName}
                        onChange={(e) => setDiagramName(e.target.value)}
                        placeholder="Введите название"
                    />
                </div>
                <div className={styles.modalField}>
                    <label>Отображаемые метрики:</label>
                    <MultiSelect
                        className={styles.selector}
                        options={metrics}
                        value={selected}
                        onChange={setSelected}
                        labelledBy="Метрики"
                    />
                </div>
            </div>
        </Modal>
    )
}

export default KeyIndicatorsModal;