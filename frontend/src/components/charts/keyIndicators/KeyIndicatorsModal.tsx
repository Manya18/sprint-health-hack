import { Modal } from '@mui/material';
import { useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import styles from './keyIndicators.module.css';

interface KeyIndicatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyIndicatorsModal: React.FC<KeyIndicatorsModalProps> = ({ isOpen, onClose }) => {
    const metrics = [
        { label: 'К выполнению', value: 'К выполнению' },
        { label: 'В работе', value: 'В работе' },
        { label: 'Сделано', value: 'Сделано' },
        { label: 'Снято', value: 'Снято' },
        { label: 'Бэклог изменен с начала спринта на', value: 'Бэклог изменен с начала спринта на' },
    ];

    const [selected, setSelected] = useState(metrics);

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className={styles.modalContent}>
                <h2>Изменить диаграмму</h2>
                <label>Название диаграммы:</label>
                <input type="text" placeholder="Введите название" />

                <label>Выберите метрики:</label>
                <MultiSelect
                    options={metrics}
                    value={selected}
                    onChange={setSelected}
                    labelledBy="Select"
                />

                <div>
                    <button onClick={onClose}>Закрыть</button>
                    <button onClick={() => {  }}>Сохранить</button>
                </div>
            </div>
        </Modal>
    );
};

export default KeyIndicatorsModal;