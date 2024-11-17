from ..config import SERVER_DIR_PATH
from . import charts_router
import pandas as pd
from db import engine
import os
from sqlalchemy import text
from sqlalchemy import Integer, String, Float, DateTime, Date

@charts_router.get('/data')
def get_data():
    df = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"uploaded_file.csv"))
    df = df.fillna('')
    return df.to_dict(orient='records')


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
    Диаграммы сгорания спринта
    :param sprint_name:
    :return:
    """
    df = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"uploaded_file.csv"))

    sprint_df = df[df['Имя спринта'] == sprint_name]

    sprint_df = sprint_df[sprint_df['Статус'] != 'Отменено']

    total_estimated_time = sprint_df['Оценка (в секундах)'].sum()

    daily_spent_time = sprint_df.groupby('Дата обновления')['Потраченное время'].sum().cumsum()

    daily_remaining_work = total_estimated_time - daily_spent_time
    daily_remaining_work = daily_remaining_work.reset_index()
    daily_remaining_work.columns = ['Дата', 'Оставшаяся работа (сек)']
    daily_remaining_work['Оставшаяся работа (часы)'] = daily_remaining_work['Оставшаяся работа (сек)'] / 3600
    daily_remaining_work_dict = daily_remaining_work.to_dict()

    return {'burn-down-chart': daily_remaining_work_dict}


@charts_router.get('/velocity')
def get_velocity():
    """
    Скорость работы команды
    :return:
    """
    df = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"uploaded_file.csv"))
    df_completed = df[df['Статус'] == 'Выполнено']
    df_velocity = df_completed.groupby('Имя спринта')['Оценка (в секундах)'].sum().reset_index()
    df_planned = df[df['Статус'] != 'Выполнено'].groupby('Имя спринта')['Оценка (в секундах)'].sum().reset_index()

    velocity_data = pd.merge(df_velocity, df_planned, on='Имя спринта', how='outer').fillna(0)

    velocity_data['Оценка (в секундах)_x'] = velocity_data['Оценка (в секундах)_x'] / 3600  # Запланированное (в часах)
    velocity_data['Оценка (в секундах)_y'] = velocity_data['Оценка (в секундах)_y'] / 3600  # Выполненное (в часах)

    velocity_data_dict = velocity_data.to_dict(orient='records')

    return {'velocity': velocity_data_dict}

@charts_router.get('/get_sprint_period')
def get_sprint_period(sprint_name: str = String):
    query = text(f"""SELECT json_agg(json_build_object('sprint_start_date', sprint_start_date, 'sprint_end_date', sprint_end_date)) FROM sprint WHERE sprint_name='{sprint_name}'""")
    with engine.connect() as connection:
        result = connection.execute(query).scalar()
    return result