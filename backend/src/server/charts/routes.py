from ..config import SERVER_DIR_PATH
from . import charts_router
import pandas as pd
from db import engine
import os
from sqlalchemy import text
from sqlalchemy import Integer, String, Float, DateTime, Date

@charts_router.get('/get_unique_sprints')
def get_unique_sprints():

    query = text("""
        SELECT DISTINCT sprint_name 
        FROM sprint
    """)

    with engine.connect() as connection:
        sprint_names = connection.execute(query).scalars().all()

    if not sprint_names:
        return {"error": "Нет доступных спринтов"}

    return {"unique_sprints": sprint_names}

@charts_router.get('/get_unique_areas')
def get_unique_areas():
    
    query = text("""
        SELECT DISTINCT area 
        FROM task
    """)

    with engine.connect() as connection:
        areas = connection.execute(query).scalars().all()

    if not areas:
        return {"error": "Нет доступных спринтов"}

    return {"unique_areas": areas}

@charts_router.get('/burn-down-chart')
def get_burn_down_chart(sprint_name='Спринт 2023.1.1'):
    """
    :param sprint_name: Имя спринта для которого нужно построить диаграмму сгорания.
    :return: Данные для диаграммы сгорания
    """
    sprint_query = text("""
    SELECT sprint_name, sprint_end_date, entity_ids
    FROM sprint
    WHERE sprint_name = :sprint_name
    """)

    with engine.connect() as connection:
        sprint_result = connection.execute(sprint_query, {'sprint_name': sprint_name}).fetchone()

    if not sprint_result:
        return {"error": "Sprint not found"}

    sprint_end_date = sprint_result[1] 
    entity_ids = sprint_result[2]       

    tasks_query = text("""
        SELECT entity_id, ticket_number, name, estimation, create_date, due_date
        FROM task
        WHERE entity_id = ANY(:entity_ids) AND due_date <= :sprint_end_date
    """)

    with engine.connect() as connection:
        tasks_result = connection.execute(tasks_query, {'entity_ids': entity_ids, 'sprint_end_date': sprint_end_date}).fetchall()

    if not tasks_result:
        return {"error": "No tasks found for this sprint"}

    task_df = pd.DataFrame(tasks_result, columns=['entity_id', 'ticket_number', 'name', 'estimation', 'create_date', 'due_date'])

    total_estimated_time = task_df['estimation'].sum()

    history_query = text("""
        SELECT entity_id, history_date, history_change
        FROM history
        WHERE entity_id = ANY(:entity_ids) AND history_property_name = 'Статус'
    """)

    with engine.connect() as connection:
        history_result = connection.execute(history_query, {'entity_ids': entity_ids}).fetchall()

    if not history_result:
        return {"error": "No status history found for tasks in this sprint"}

    history_df = pd.DataFrame(history_result, columns=['entity_id', 'history_date', 'history_change'])
    history_df['history_date'] = pd.to_datetime(history_df['history_date'])
    daily_spent_time = history_df.groupby('history_date').size().cumsum()

    daily_remaining_work = total_estimated_time - daily_spent_time
    daily_remaining_work = daily_remaining_work.reset_index()
    daily_remaining_work.columns = ['Дата', 'Оставшаяся работа (сек)']
    daily_remaining_work['Оставшаяся работа (часы)'] = daily_remaining_work['Оставшаяся работа (сек)'] / 3600

    full_date_range = pd.date_range(daily_remaining_work['Дата'].min(), daily_remaining_work['Дата'].max())
    full_data = pd.DataFrame(full_date_range, columns=['Дата'])

    daily_remaining_work = pd.merge(full_data, daily_remaining_work, on='Дата', how='left')
    daily_remaining_work['Оставшаяся работа (сек)'].fillna(0, inplace=True)
    daily_remaining_work['Оставшаяся работа (часы)'] = daily_remaining_work['Оставшаяся работа (сек)'] / 3600
    daily_remaining_work_dict = daily_remaining_work.to_dict(orient='records')
    df = pd.DataFrame(daily_remaining_work_dict)
    df['Дата'] = pd.to_datetime(df['Дата'])

    result = {
        "dates": df['Дата'].dt.strftime('%Y-%m-%d').tolist(), 
        "remainingWork": df['Оставшаяся работа (часы)'].tolist() 
    }

    return result

@charts_router.get('/get_sprint_period')
def get_sprint_period(sprint_name: str = String):
    query = text(f"""SELECT json_agg(json_build_object('sprint_start_date', sprint_start_date, 'sprint_end_date', sprint_end_date)) FROM sprint WHERE sprint_name='{sprint_name}'""")
    with engine.connect() as connection:
        result = connection.execute(query).scalar()
    return result[0]