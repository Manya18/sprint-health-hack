export type BurnDownChartType = {
    dates: string[];
    remainingWork: number[];
}
export type SprintHealthChartType = {
    label: string;
    count: number[];
}
export type KeyIndicatorsType = {
    label: string;
    count: number[];
}

export type sprintSuccessRateType = {
    inImplementation: number;
    cancel: number;
    backlog: number;
    resolution: string;
}

export type BacklogItem = {
    history_date: Date;
    task_count: number;
    total_estimation: number;
};

export type BacklogTableType = {
    tasks_added: BacklogItem[];
    tasks_removed: BacklogItem[];
};
