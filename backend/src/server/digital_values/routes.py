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
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))        
        
        query = text(f"""
            SELECT SUM(estimation) FROM task_duplicate
            WHERE entity_id IN ({entity_ids_str}) AND status='Создано' {areas_condition}
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
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM task_duplicate
            WHERE entity_id IN ({entity_ids_str}) AND status NOT IN ('Сделано', 'Снято') {areas_condition}
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
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM task_duplicate
            WHERE entity_id IN ({entity_ids_str}) AND type IN ('История', 'Задача', 'Дефект') AND status IN('Закрыто', 'Выполнено') {areas_condition}
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
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
    FROM sprint
    WHERE sprint_name IN ({sprint_names_str})
    """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))
        
        query = text(f"""
            SELECT SUM(estimation) FROM task_duplicate
            WHERE entity_id IN ({entity_ids_str}) AND status IN ('Закрыто', 'Выполнено') AND resolution IN('Отклонено', 'Отменено инициатором', 'Дубликат') {areas_condition} OR entity_id IN ({entity_ids_str}) AND type='Дефект' AND status='Отклонен исполнителем' {areas_condition}
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })
    
    return result

@digital_values_router.post('/update_task_duplicate')
def update_task_duplicate(
    sprint_names: list[str] = Query(...), 
    start_date: str = String,          
    end_date: str = String,            
    timeline: str = String
):
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)

    query = text(f"""DELETE FROM task_duplicate""")
    with engine.connect() as connection:
        connection.execute(query)

    # Подготовка запроса
    query = text(f"""
        WITH task_status_history AS (
            SELECT
                h.entity_id,
                h.history_change,
                h.history_change_type,
                h.history_date,
                ROW_NUMBER() OVER (PARTITION BY h.entity_id ORDER BY h.history_date DESC) AS row_num
            FROM history h
            WHERE h.history_property_name = 'Статус'
              AND h.history_date BETWEEN '{start_date}'::date AND '{end_date}'::date
        ),
        sprint_tasks AS (
            SELECT
                s.sprint_name,
                s.sprint_status,
                s.entity_ids
            FROM sprint s
            WHERE s.sprint_name IN ({sprint_names_str})   -- Используем IN для передачи нескольких значений
              AND s.sprint_end_date >= '{timeline}'::date
        ),
        task_info AS (
            SELECT
                t.entity_id,
                t.area,
                t.type,
                t.status AS original_status,
                t.state,
                t.priority,
                t.ticket_number,
                t.name,
                t.create_date,
                t.created_by,
                t.update_date,
                t.updated_by,
                t.parent_ticket_id,
                t.assignee,
                t.owner,
                t.due_date,  
                t.rank,
                t.estimation,
                t.spent,
                t.workgroup,
                t.resolution,
                th.history_change AS last_status,
                th.history_change_type,
                th.history_date AS start_date
            FROM task t
            LEFT JOIN task_status_history th
                ON t.entity_id = th.entity_id
                AND th.row_num = 1
        )

        INSERT INTO task_duplicate (
            entity_id,
            area,
            type,
            status,
            state,
            priority,
            ticket_number,
            name,
            create_date,
            created_by,
            update_date,
            updated_by,
            parent_ticket_id,
            assignee,
            owner,
            due_date,
            rank,
            estimation,
            spent,
            workgroup,
            resolution
        )
        SELECT
            ti.entity_id,
            ti.area,
            ti.type,
            COALESCE(ti.last_status, ti.original_status) AS status,
            ti.state,
            ti.priority,
            ti.ticket_number,
            ti.name,
            ti.create_date,
            ti.created_by,
            ti.update_date,
            ti.updated_by,
            ti.parent_ticket_id,
            ti.assignee,
            ti.owner,
            ti.due_date,
            ti.rank,
            ti.estimation,
            ti.spent,
            ti.workgroup,
            ti.resolution
        FROM sprint_tasks st
        LEFT JOIN task_info ti
            ON ti.entity_id = ANY(st.entity_ids)
        WHERE st.sprint_name IN ({sprint_names_str})  -- Используем IN для нескольких значений
          AND ti.due_date <= '{end_date}'::date
        ORDER BY ti.entity_id;
    """)

    with engine.connect() as connection:
        connection.execute(query)

    return {"status": "success", "message": "Tasks inserted into task_duplicate"}