import { ChangeEvent, useState } from "react";
import styles from "./filesUpload.module.css"
import axios from "axios";
import { toast } from "react-toastify";

const FilesUpload = () => {

    const handleChange = async (event: any, tableName: string) => {
        const formData = new FormData();
        formData.append("file", event.target.files[0]);

        try {
            const response = await axios.post(
                `http://localhost:8000/${tableName}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            toast.success('Файл загружен');
        } catch (error) {
            toast.warn('Ошибка при загрузке файла');
        }
    }

    return (
        <div className={styles.FilesUpload}>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>Загрузите файл задач</label>
                <input className={styles.input} type='file' onChange={(event) => handleChange(event, 'upload_data_file')} />
            </div>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>Загрузите файл спринтов</label>
                <input className={styles.input} type='file' onChange={(event) => handleChange(event, 'upload_sprint_file')} />
            </div>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>Загрузите файл истории</label>
                <input className={styles.input} type='file' onChange={(event) => handleChange(event, 'upload_history_file')} />
            </div>
        </div>
    )
}

export default FilesUpload;