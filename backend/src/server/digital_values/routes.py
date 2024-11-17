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
from datetime import datetime, timedelta

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

    sprint_names_placeholder = ', '.join([f":sprint_name_{i}" for i in range(len(sprint_names))])
    sprint_params = {f"sprint_name_{i}": name for i, name in enumerate(sprint_names)}

    sprint_query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name)) AS result
        FROM sprint
        WHERE sprint_name IN ({sprint_names_placeholder})
    """)

    areas_condition = ""
    if areas:
        areas_placeholder = ', '.join([f":area_{i}" for i in range(len(areas))])
        areas_condition = f"AND area IN ({areas_placeholder})"

    area_params = {f"area_{i}": area for i, area in enumerate(areas)}

    params = {**sprint_params, **area_params}

    with engine.connect() as connection:
        try:
            sprint_data = connection.execute(sprint_query, params).scalar()

            if sprint_data:
                for item in sprint_data:
                    entity_ids_list = item['entity_ids']
                    if not entity_ids_list:
                        continue
                    
                    entity_ids_placeholder = ', '.join([f":entity_id_{i}" for i in range(len(entity_ids_list))])
                    entity_id_params = {f"entity_id_{i}": entity_id for i, entity_id in enumerate(entity_ids_list)}

                    estimation_query = text(f"""
                        SELECT SUM(estimation) 
                        FROM task_duplicate
                        WHERE entity_id IN ({entity_ids_placeholder}) 
                          AND status NOT IN ('Сделано', 'Снято') 
                          {areas_condition}
                    """)

                    estimation_params = {**entity_id_params, **area_params}
                    estimation = connection.execute(estimation_query, estimation_params).scalar()

                    result.append({
                        'sprint_name': item['sprint_name'],
                        'estimation': round(estimation / 3600, 1) if estimation else 0
                    })
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            return {"status": "error", "message": str(e)}

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

@digital_values_router.put('/update_task_duplicate')
def update_task_duplicate(
    sprint_names: list[str] = Query(...), 
    start_date: str = String,          
    end_date: str = String,            
    timeline: str = String
):
    sprint_names_placeholder = ', '.join([f":sprint_name_{i}" for i in range(len(sprint_names))])
    sprint_params = {f"sprint_name_{i}": name for i, name in enumerate(sprint_names)}

    delete_query = text("DELETE FROM task_duplicate;")

    main_query = text(f"""
        WITH task_status_history AS (
            SELECT
                h.entity_id,
                h.history_change,
                h.history_change_type,
                h.history_date,
                ROW_NUMBER() OVER (PARTITION BY h.entity_id ORDER BY h.history_date DESC) AS row_num
            FROM history h
            WHERE h.history_property_name = 'Статус'
              AND h.history_date BETWEEN :start_date AND :end_date
        ),
        sprint_tasks AS (
            SELECT
                s.sprint_name,
                s.sprint_status,
                s.entity_ids
            FROM sprint s
            WHERE s.sprint_name IN ({sprint_names_placeholder})
              AND s.sprint_end_date >= :timeline
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
        WHERE st.sprint_name IN ({sprint_names_placeholder})
          AND ti.create_date <= :timeline
        ORDER BY ti.entity_id;
    """)

    params = {
        **sprint_params,
        "start_date": start_date,
        "end_date": end_date,
        "timeline": timeline
    }

    with engine.connect() as connection:
        transaction = connection.begin()
        try:
            delete_result = connection.execute(delete_query)
            print(f"Rows affected by DELETE: {delete_result.rowcount}")

            insert_result = connection.execute(main_query, params)
            print(f"Rows affected by INSERT: {insert_result.rowcount}")

            transaction.commit()
            return {"status": "success", "message": "Tasks inserted into task_duplicate"}
        except Exception as e:
            transaction.rollback()
            print(f"Error during transaction: {e}")
            return {"status": "error", "message": str(e)}




@digital_values_router.get('/get_completion_rate')
def get_completion_rate(
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
            WHERE entity_id IN ({entity_ids_str}) {areas_condition}
        """)
        
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })

    return result

@digital_values_router.get('/success_rate_parameters')
def success_rate_parameters(
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    to_do_tasks = get_to_do_tasks(sprint_names, areas)
    cancel_tasks = get_cancel_tasks(sprint_names, areas)
    all_estimations = get_completion_rate(sprint_names, areas)

    in_implementation_percentage = []
    cancel_percentage = []

    for i in range(len(to_do_tasks)):
        sprint_name = to_do_tasks[i]['sprint_name']
        to_do_estimation = to_do_tasks[i]['estimation']
        all_estimation = all_estimations[i]['estimation']

        if all_estimation > 0:
            estimation_ratio = to_do_estimation / all_estimation * 100
        else:
            estimation_ratio = 0

        in_implementation_percentage.append({
            'sprint_name': sprint_name,
            'estimation': round(estimation_ratio, 2)
        })
    
    for i in range(len(cancel_tasks)):
        sprint_name = cancel_tasks[i]['sprint_name']
        cancel_estimation = cancel_tasks[i]['estimation']
        all_estimation = all_estimations[i]['estimation']

        if all_estimation > 0:
            cancel_ratio = cancel_estimation / all_estimation * 100
        else:
            cancel_ratio = 0

        cancel_percentage.append({
            'sprint_name': sprint_name,
            'estimation': round(cancel_ratio, 2)
        })

    return {
        "in_implementation_percentage": in_implementation_percentage,
        "cancel_percentage": cancel_percentage
    }

@digital_values_router.get('/backlog_table')
def backlog_table(
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name, 
                                           'sprint_start_date', sprint_start_date, 
                                           'sprint_end_date', sprint_end_date)) AS result
        FROM sprint
        WHERE sprint_name IN ({', '.join(f"'{name}'" for name in sprint_names)})
        """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids_result = connection.execute(query).scalar()
        entity_ids_data = [item for item in entity_ids_result] if entity_ids_result else []

    if not entity_ids_data:
        return {"message": "No entity_ids found."}

    entity_ids = [item['entity_ids'] for item in entity_ids_data]
    start_dates = [item['sprint_start_date'] for item in entity_ids_data]
    end_dates = [item['sprint_end_date'] for item in entity_ids_data]

    entity_ids_str = ', '.join(map(str, entity_ids))[1:-1]

    estimation__query = text(f"""
        SELECT 
            DATE(h.history_date) AS history_date, 
            COUNT(*) AS task_count, 
            COALESCE(SUM(t.estimation), 0) AS total_estimation
        FROM 
            history h
        JOIN 
            task_duplicate t ON h.entity_id = t.entity_id
        WHERE 
            h.history_property_name = 'Задача' 
            AND h.history_change_type = 'CREATED'
            AND h.entity_id IN ({entity_ids_str})
            AND h.history_date BETWEEN '{min(start_dates)}' AND '{max(end_dates)}'
            AND t.type != 'Дефект'
            OR (h.after = '{sprint_names[0]}' 
            AND h.history_date <= '{max(end_dates)}'
            AND t.type != 'Дефект')
        GROUP BY 
            DATE(h.history_date)
        ORDER BY 
            DATE(h.history_date); 
        """)

    removal_query = text(f"""
        SELECT 
            DATE(h.history_date) AS history_date, 
            COUNT(*) AS task_count, 
            COALESCE(SUM(t.estimation), 0) AS total_estimation
        FROM 
            history h
        JOIN 
            task_duplicate t ON h.entity_id = t.entity_id
        WHERE 
            h.history_property_name = 'Задача' 
            AND h.entity_id IN ({entity_ids_str})
            AND h.history_date BETWEEN '{min(start_dates)}' AND '{max(end_dates)}'
            AND t.type != 'Дефект'
            AND h.before = '{sprint_names[0]}'
        GROUP BY 
            DATE(h.history_date)
        ORDER BY 
            DATE(h.history_date); 
        """)
    
    with engine.connect() as connection:
        estimation_results = connection.execute(estimation__query).fetchall()
        removal_results = connection.execute(removal_query).fetchall()

    return {
        "tasks_added": [
            {
                "history_date": row.history_date,
                "task_count": row.task_count,
                "total_estimation": row.total_estimation
            } for row in estimation_results
        ],
        "tasks_removed": [
            {
                "history_date": row.history_date,
                "task_count": row.task_count,
                "total_estimation": row.total_estimation
            } for row in removal_results
        ]
    }

@digital_values_router.get('/backlog_changes_persentage')
def backlog_changes_persentage(
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    query = text(f"""
        SELECT json_agg(json_build_object('sprint_start_date', sprint_start_date, 
                                           'sprint_end_date', sprint_end_date)) AS result
        FROM sprint
        WHERE sprint_name IN ({', '.join(f"'{name}'" for name in sprint_names)})
        """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids_result = connection.execute(query).scalar()
        entity_ids_data = [item for item in entity_ids_result] if entity_ids_result else []

    if not entity_ids_data:
        return {"message": "No entity_ids found."}

    start_dates = [item['sprint_start_date'] for item in entity_ids_data]
    end_dates = [item['sprint_end_date'] for item in entity_ids_data]

    backlog = backlog_table(sprint_names, areas)
    tasks_added = backlog['tasks_added']

    tasks_added.sort(key=lambda x: x['history_date'])

    if start_dates:
        first_date = datetime.strptime(start_dates[0], "%Y-%m-%dT%H:%M:%S")
        sprint_start_date = first_date
        sprint_end_date = datetime.strptime(end_dates[0], "%Y-%m-%dT%H:%M:%S")

        first_three_days = [sprint_start_date + timedelta(days=i) for i in range(3)]
        first_three_days = [date.date() for date in first_three_days]

        total_before_sprint_start = sum(
            task['total_estimation'] for task in tasks_added 
            if task['history_date'] < sprint_start_date.date() and task['total_estimation'] is not None
        )

        total_during_sprint = sum(
            task['total_estimation'] for task in tasks_added 
            if sprint_start_date.date() <= task['history_date'] < first_three_days[2] and task['total_estimation'] is not None
        )
    else:
        total_before_sprint_start = 0
        total_during_sprint = 0

    return round(total_during_sprint  / total_before_sprint_start * 100, 2)


@digital_values_router.get('/mass_transfer')
def mass_transfer(
    sprint_names: list[str] = Query(...),
    areas: list[str] = Query([])
):
    result = []
    sprint_names_str = ', '.join(f"'{name}'" for name in sprint_names)
    query = text(f"""
        SELECT json_agg(json_build_object('entity_ids', entity_ids, 'sprint_name', sprint_name, 'sprint_start_date', sprint_start_date, 
                                           'sprint_end_date', sprint_end_date)) AS result
        FROM sprint
        WHERE sprint_name IN ({sprint_names_str})
        """)

    areas_condition = ""
    if areas:
        areas_str = ', '.join(f"'{area}'" for area in areas)
        areas_condition = f"AND area IN ({areas_str})"

    with engine.connect() as connection:
        entity_ids = connection.execute(query).scalar()
        entity_ids_data = [item for item in entity_ids] if entity_ids else []

    if not entity_ids_data:
        return {"message": "No entity_ids found."}

    start_dates = [item['sprint_start_date'] for item in entity_ids_data]
    end_dates = [item['sprint_end_date'] for item in entity_ids_data]

    for item in entity_ids:
        entity_ids_list = item['entity_ids']
        entity_ids_str = ', '.join(map(str, entity_ids_list))        
        
        query = text(f"""
            SELECT COUNT(*) AS total_count
                FROM public.history h
                JOIN public.task_duplicate t ON h.entity_id = t.entity_id

                where
                    h.entity_id IN ({entity_ids_str})
                    AND h.after='closed'
                    AND DATE(h.history_date) = DATE('{end_dates[0]}')  -- Фильтрация по дате начала
                    AND DATE(h.history_date) < DATE('{end_dates[0]}') + INTERVAL '1 day'
                    AND (t.type = 'Дефект'
                    or t.type = 'Задача'
                    or t.type = 'История' )
                    {areas_condition};
                """)
        print(query)
        with engine.connect() as connection:
            estimation = connection.execute(query).scalar()

        result.append({
            'sprint_name': item['sprint_name'],
            'estimation': round(estimation / 3600, 1) if estimation is not None else 0
        })
    return 0