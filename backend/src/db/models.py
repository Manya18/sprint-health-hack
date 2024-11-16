from . import Base
from sqlalchemy import  Table, Integer, String, Column, DateTime, ARRAY, Date, Float

class Sprint(Base):
    __tablename__ = 'sprint'
    id = Column(Integer, primary_key=True, autoincrement=True)
    sprint_name = Column(String, unique=True)
    sprint_status = Column(String)
    sprint_start_date = Column(DateTime)
    sprint_end_date = Column(DateTime)
    entity_ids = Column(ARRAY(Integer))

class Task(Base):
    __tablename__ = 'task'
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(Integer, unique=True)
    area = Column(String)
    type = Column(String)
    status = Column(String)
    state = Column(String)
    priority = Column(String)
    ticket_number = Column(String)
    name = Column(String)
    create_date = Column(DateTime)
    created_by = Column(String)
    update_date = Column(DateTime)
    updated_by = Column(String)
    parent_ticket_id = Column(Integer)
    assignee = Column(String)
    owner = Column(String)
    due_date = Column(Date)
    rank = Column(String)
    estimation = Column(Float)
    spent = Column(Float)
    workgroup = Column(String)
    resolution = Column(String)

class History(Base):
    __tablename__ = 'history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(Integer, unique=True)
    history_property_name = Column(String)
    history_date = Column(DateTime)
    history_version = Column(Float)
    history_change_type = Column(String)
    history_change = Column(String)