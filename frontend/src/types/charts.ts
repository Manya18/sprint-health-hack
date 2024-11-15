export type BurnDownChartData = {
    dates: string[];
    remainingWork: number[];
}
  
export type SprintHealthChartData = {
    toDo: number;
    inProgress: number;
    done: number;
    removed: number;
    backlogChange: number;
    blocked: number;
  }
  