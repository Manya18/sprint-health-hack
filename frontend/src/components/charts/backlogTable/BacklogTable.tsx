import { useEffect, useState } from 'react';
import styles from './backlogTable.module.css';

type BacklogItem = {
    history_date: Date;
    task_count: number;
    total_estimation: number;
};

type BacklogTableType = {
    tasks_added: BacklogItem[];
    tasks_removed: BacklogItem[];
};

const BacklogTable = ({ sprintName, backlogTable }: { sprintName: string; backlogTable: BacklogTableType }) => {
    console.log(backlogTable)
    return (
        <div className={styles.BacklogTable}>
            <table>
                <thead>
                    <tr>
                        <th>Дни</th>
                        {backlogTable?.tasks_added.map((item, index) => (
                            <th key={index}>{index + 1}</th> // Индекс дня, начиная с 1
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>+/-(ч/д)</td>
                        {backlogTable?.tasks_added.map((item, index) => {
                            const tasksAddedEst = item.total_estimation;
                            const tasksRemovedEst = backlogTable.tasks_removed[index]?.total_estimation || 0;
                            const ratioEst = `${tasksAddedEst}/${tasksRemovedEst}`;

                            const tasksAddedCount = item.task_count;
                            const tasksRemovedCount = backlogTable.tasks_removed[index]?.task_count || 0;
                            const ratioCount = `+/-(шт) ${tasksAddedCount}/${tasksRemovedCount}`;
                            return (
                                <td key={index} title={ratioCount}>{ratioEst}</td> // Отношение задач
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BacklogTable;