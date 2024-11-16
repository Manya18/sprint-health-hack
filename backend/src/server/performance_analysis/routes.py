from db.crud import (
    get_tasks_records_with_filter, delete_all_rows_from_task_table,
    delete_all_rows_from_history_table, delete_all_rows_from_sprint_table,
    get_all_tasks_by_sprint_name
)
from .schemas import PerformanceTaskParams, TaskStatus, TaskFilteredParams
from sqlalchemy import Integer, String, Float, DateTime, Date
from fastapi import HTTPException, UploadFile, File
from sqlalchemy.dialects.postgresql import ARRAY
from ml.models import RANDOM_FOREST_MODEL
from ..config import SERVER_DIR_PATH
from . import performance_router
from io import BytesIO
from db import engine
import pandas as pd
import logging
import os


# @performance_router.post('/performance_prediction')
# def predict_performance(task_params: PerformanceTaskParams) -> list[TaskStatus]:
#     """
#     Анализ производительности команды с учетом зависимостей задач
#     :param task_params: параметры задач
#     :return: прогноз выполнения задач
#     """
#     if not (len(task_params.depends_on) == len(task_params.actual_time_minutes) ==
#             len(task_params.estimated_time_minutes)):
#         raise HTTPException(status_code=422, detail="Размеры списков параметров не совпадают")
#
#     df = pd.DataFrame(task_params.model_dump())
#     df['depends_on'] = df['depends_on'].fillna(0).astype(int)
#
#     return RANDOM_FOREST_MODEL.predict(df[['actual_time_minutes', 'estimated_time_minutes', 'depends_on']])


@performance_router.post('/upload_data_file')
def upload_data_file(file: UploadFile = File(...)):
    """
    Загрузка файла данных на сервер
    :param file: файл
    :return: статус загрузки
    """
    table_name = 'task'
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)
    df = df.reset_index()
    df = df.rename(columns={"index": "id"})
    df['due_date'] = pd.to_datetime(df['due_date'])

    dtype = {
        'entity_id': Integer,
        'area': String,
        'type': String,
        'status': String,
        'state': String,
        'priority': String,
        'ticket_number': String,
        'name': String,
        'create_date': DateTime,
        'created_by': String,
        'update_date': DateTime,
        'uploaded_by': String,
        'parent_ticket_id': Integer,
        'assignee': String,
        'owner': String,
        'due_date': Date,
        'rank': String,
        'estimation': Float,
        'spent': Float,
        'workgroup': String,
        'resolution': String
    }

    delete_all_rows_from_task_table()
    df.to_sql(table_name, engine, if_exists='replace', index=False, dtype=dtype)

    buffer.close()
    file.file.close()
    return {'message': 'Файл успешно загружен в базу данных'}


@performance_router.post('/upload_history_file')
def upload_history_file(file: UploadFile = File(...)):
    """
    Загрузка файла данных на сервер
    :param file: файл
    :return: статус загрузки
    """
    table_name = 'history'
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)

    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    df = df.drop(columns=['Столбец1'], errors='ignore')
    df = df.dropna()

    df = df.reset_index()
    df = df.rename(columns={"index": "id"})
    df['history_date'] = pd.to_datetime(df['history_date'])

    dtype = {
        'entity_id': Integer,
        'history_property_name': String,
        'history_date': DateTime,
        'history_version': Float,
        'history_change_type': String,
        'history_change': String
    }

    delete_all_rows_from_history_table()
    df.to_sql(table_name, engine, if_exists='replace', index=False, dtype=dtype)

    buffer.close()
    file.file.close()
    return {'message': 'Файл успешно загружен в базу данных'}


@performance_router.post('/upload_sprint_file')
def upload_sprint_file(file: UploadFile = File(...)):
    """
    Загрузка файла данных на сервер
    :param file: файл
    :return: статус загрузки
    """
    table_name = 'sprint'
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)
    df['entity_ids'] = df['entity_ids'].apply(lambda x: list(map(int, x.strip('{}').split(','))))
    df = df.reset_index()
    df = df.rename(columns={"index": "id"})

    dtype = {
        'sprint_name': String,
        'sprint_status': String,
        'sprint_start_date': DateTime,
        'sprint_end_date': DateTime,
        'entity_ids': ARRAY(Integer)
    }

    delete_all_rows_from_sprint_table()
    df.to_sql(table_name, engine, if_exists='replace', index=False, dtype=dtype)

    buffer.close()
    file.file.close()
    return {'message': 'Файл успешно загружен в базу данных'}


# @performance_router.get('/sprint/{sprint_name}')
# def get_all_tasks_by_sprint_name(sprint_name: str):
#     sprints = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"sprints.csv"), skiprows=1, sep=';')
#     data = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"data.csv"), skiprows=1, sep=';')
#
#     res = data[data['entity_id'].isin(
#         list(map(int, sprints.loc[sprints['sprint_name'] == sprint_name, 'entity_ids'].iloc[0].strip('{}').split(',')))
#     )]
#     res = res.fillna('')
#
#     return res.to_dict()


@performance_router.post('/sprint/filtered/{sprint_name}')
def get_filtered_tasks_by_sprint_name(sprint_name: str, filter_params: TaskFilteredParams):
    filter_params = filter_params.model_dump()
    filter_params['sprint_name'] = sprint_name
    try:
        data = get_tasks_records_with_filter(**filter_params)
    except Exception as err:
        logging.error(err)
        return {'err': 'Ошибка при получении спринта'}
    return data


@performance_router.get('/sprint_criteria/{sprint_name}')
def get_sprint_criteria_for_check_on_successful(sprint_name: str):
    try:
        df = get_all_tasks_by_sprint_name(sprint_name)
    except Exception as err:
        logging.error(err)
        return {'err': 'Ошибка при получении спринта'}

    # расчет количества записей со статусом "К выполнению" к общему количеству
    in_implementation_percentage = round(df[df['status'] == 'Создано'].shape[0] / df.shape[0] * 100, 2)
    removed_percentage = round(df.loc[
        (df['status'] == 'Закрыт') | (df['status'] == 'Отклонен исполнителем') |
        ((df['status'] == 'Выполнено') & (df['resolution'].isin(['Отклонено', 'Отменено инициатором', 'Дубликат'])))
    ].shape[0] / df.shape[0] * 100, 2)

    # расчет количества записей со статусом "Снято" к общему количеству
    start_date = df['create_date'].min()
    end_date = start_date + pd.Timedelta(days=2)
    backlog_percentage = round(
        df[(df['create_date'] >= start_date) & (df['create_date'] <= end_date) & (df['name'].str.contains('Бэклог'))].shape[0] / df.shape[0], 2)

    return {
        'in_implementation_percentage': in_implementation_percentage,
        'removed_percentage': removed_percentage,
        'backlog_percentage': backlog_percentage
    }

