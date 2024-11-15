from pydantic import BaseModel
from enum import Enum


class TaskStatus(int, Enum):
    SUCCESS = 0
    WARNING = 1
    FAILURE = 2


class PerformanceTaskParams(BaseModel):
    actual_time_minutes:    list[int]
    estimated_time_minutes: list[int]
    depends_on:     list[int | None]
