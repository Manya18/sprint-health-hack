from datetime import datetime, date
from .models import Sprint, Task
from . import Session


def get_tasks_records_with_filter(
    sprint_name: str,
    entity_id: int = None, area: str = None, type: str = None,
    status: list[str] = None, state: str = None, priority: list[str] = None,
    ticket_number: str = None, name: str = None, create_date: datetime = None,
    created_by: str = None, update_date: datetime = datetime, updated_by: str = None,
    parent_ticket_id: int = None, assignee: str = None, owner: str = None,
    due_date: date = None, rank: str = None, estimation: float = None,
    spent: float = None, workgroup: str = None, resolution: str = None):
    with Session() as session:
        sprint = session.query(Sprint).where(Sprint.sprint_name == sprint_name).one()
        tasks = session.query(Task).where(
            Task.entity_id.in_(sprint.entity_ids) &
            (Task.entity_id == entity_id if entity_id else True) &
            (Task.area == area if area else True) &
            (Task.type == type if type else True) &
            (Task.status.in_(status) if status else True) &
            (Task.state == state if state else True) &
            (Task.priority.in_(priority) if priority else True) &
            (Task.ticket_number == ticket_number if ticket_number else True) &
            (Task.name == name if name else True) &
            (Task.create_date == create_date if create_date else True) &
            (Task.created_by == created_by if created_by else True) & \
            (Task.update_date == update_date if update_date else True) &
            (Task.updated_by == updated_by if updated_by else True) &
            (Task.parent_ticket_id == parent_ticket_id if parent_ticket_id else True) &
            (Task.assignee == assignee if assignee else True) &
            (Task.owner == owner if owner else True) &
            (Task.due_date == due_date if due_date else True) &
            (Task.rank == rank if rank else True) &
            (Task.estimation == estimation if estimation else True) &
            (Task.spent == spent if spent else True) &
            (Task.workgroup == workgroup if workgroup else True) &
            (Task.resolution == resolution if resolution else True)
        )
    return tasks.all()

