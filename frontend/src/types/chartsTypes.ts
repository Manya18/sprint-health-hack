export type BurnDownChartType = {
    dates: string[];
    remainingWork: number[];
}
  
export type SprintHealthChartType = {
    toDo: number;
    inProgress: number;
    done: number;
    removed: number;
    backlogChange: number;
    blocked: number;
}
  
export type KeyIndicatorsType = {
    label: string;
    count: number;
}