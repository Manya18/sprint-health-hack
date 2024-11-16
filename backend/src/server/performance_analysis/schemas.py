from pydantic import BaseModel
from datetime import datetime, date
from enum import Enum


class TaskStatus(int, Enum):
    SUCCESS = 0
    WARNING = 1
    FAILURE = 2


class PerformanceTaskParams(BaseModel):
    actual_time_minutes:    list[int]
    estimated_time_minutes: list[int]
    depends_on:     list[int | None]


class TaskFilteredParams(BaseModel):
    entity_id:          int | None
    area:               str | None
    type:               str | None
    status:             list[str] | None
    state:              str | None
    priority:           list[str] | None
    ticket_number:      str | None
    name:               str | None
    create_date:        datetime | None
    created_by:         str | None
    update_date:        datetime | datetime
    updated_by:         str | None
    parent_ticket_id:   int | None
    assignee:           str | None
    owner:              str | None
    due_date:           date | None
    rank:               str | None
    estimation:         float | None
    spent:              float | None
    workgroup:          str | None
    resolution:         str | None
