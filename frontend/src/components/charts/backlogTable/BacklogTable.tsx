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

const BacklogTable = ({ sprintName, areas }: { sprintName: string; areas?: string[] }) => {
    const [backlogTable, setBacklogTable] = useState<BacklogTableType>();

    useEffect(() => {
        const getBacklog = async () => {
            if (sprintName) {
                try {
                    const response = await fetch(`http://localhost:8000/backlog_table?sprint_names=${sprintName}`);
                    const data = await response.json();
                    setBacklogTable(data);
                    console.log(data);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        getBacklog();
    }, [sprintName]);

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