from ..config import TOLERANCE_ZONE_MINUTES, WARNING_ZONE_MINUTES
from schemas import TaskStatus


def determine_status(row):
    if row['actual_time_minutes'] <= row['estimated_time_minutes'] + TOLERANCE_ZONE_MINUTES:
        return TaskStatus.SUCCESS.value
    elif row['actual_time_minutes'] <= row['estimated_time_minutes'] + WARNING_ZONE_MINUTES:
        return TaskStatus.WARNING.value
    else:
        return TaskStatus.FAILURE.value
