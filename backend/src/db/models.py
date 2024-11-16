from . import Base
from sqlalchemy import  Table, Integer, String, Column, DateTime, ARRAY


class Sprint(Base):
    __tablename__ = 'sprint'
    id = Column(Integer, primary_key=True, autoincrement=True)
    sprint_name = Column(String, unique=True)
    sprint_status = Column(String)
    sprint_start_date = Column(DateTime)
    sprint_end_date = Column(DateTime)
    entity_ids = Column(ARRAY(Integer))
