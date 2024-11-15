from pydantic import BaseModel


class BottlenecksTaskParams(BaseModel):
    task_completion_time_minutes:   list[int]
    task_difficulty:        list[int]


class BottlenecksResponse(BaseModel):
    is_potentially_bottlenecks:     list[int]
