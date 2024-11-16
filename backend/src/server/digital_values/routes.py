from sqlalchemy import Integer, String, Float, DateTime, Date
from fastapi import HTTPException, UploadFile, File
from ml.models import RANDOM_FOREST_MODEL
from ..config import SERVER_DIR_PATH
from sqlalchemy import text
from io import BytesIO
from db import engine
import pandas as pd
import os
from fastapi import APIRouter, Query
from sqlalchemy.dialects.postgresql import ARRAY
from . import digital_values_router

@digital_values_router.get('/get_to_do_tasks')
def get_to_do_tasks(
    sprint_names: list[str] = Query(...)
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM Task
            WHERE entity_id IN ({entity_ids_str}) AND status='Создано'
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })

    return result



@digital_values_router.get('/get_in_work_tasks')
def get_in_work_tasks(
    sprint_names: list[str] = Query(...)
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM Task
            WHERE entity_id IN ({entity_ids_str}) AND status NOT IN ('Сделано', 'Снято')
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })

    return result



@digital_values_router.get('/get_close_tasks')
def get_close_tasks(
    sprint_names: list[str] = Query(...)
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM Task
            WHERE entity_id IN ({entity_ids_str}) AND type IN ('История', 'Задача', 'Дефект') AND status IN('Закрыто', 'Выполнено')
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })

    return result



@digital_values_router.get('/get_cancel_tasks')
def get_cancel_tasks(
    sprint_names: list[str] = Query(...)
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM Task
            WHERE entity_id IN ({entity_ids_str}) AND status IN ('Закрыто', 'Выполнено') AND resolution IN('Отклонено', 'Отменено инициатором', 'Дубликат') OR entity_id IN ({entity_ids_str}) AND type='Дефект' AND status='Отклонен исполнителем'
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })

    return result