from sqlalchemy import Integer, String, Float, DateTime, Date
from fastapi import HTTPException, UploadFile, File
from .schemas import PerformanceTaskParams, TaskStatus
from ml.models import RANDOM_FOREST_MODEL
from ..config import SERVER_DIR_PATH
from . import performance_router
from sqlalchemy import text
from io import BytesIO
from db import engine
import pandas as pd
import os


@performance_router.post('/performance_prediction')
def predict_performance(task_params: PerformanceTaskParams) -> list[TaskStatus]:
    """
    Анализ производительности команды с учетом зависимостей задач
    :param task_params: параметры задач
    :return: прогноз выполнения задач
    """
    if not (len(task_params.depends_on) == len(task_params.actual_time_minutes) ==
            len(task_params.estimated_time_minutes)):
        raise HTTPException(status_code=422, detail="Размеры списков параметров не совпадают")

    df = pd.DataFrame(task_params.model_dump())
    df['depends_on'] = df['depends_on'].fillna(0).astype(int)

    return RANDOM_FOREST_MODEL.predict(df[['actual_time_minutes', 'estimated_time_minutes', 'depends_on']])


@performance_router.post('/upload_data_file')
def upload_data_file(file: UploadFile = File(...)):
    """
    Загрузка файла данных на сервер
    :param file: файл
    :return: статус загрузки
    """
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)
    df['due_date'] = pd.to_datetime(df['due_date'])
    table_name = 'task'

    with engine.connect() as connection:
        connection.execute(text(f"DELETE FROM {table_name};"))

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
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)
    print(df.head())

    buffer.close()
    file.file.close()
    return {'message': 'Файл успешно загружен'}


@performance_router.post('/upload_sprint_file')
def upload_sprint_file(file: UploadFile = File(...)):
    """
    Загрузка файла данных на сервер
    :param file: файл
    :return: статус загрузки
    """
    contents = file.file.read()
    buffer = BytesIO(contents)

    df = pd.read_csv(buffer, sep=';', skiprows=1)
    print(df.head())

    buffer.close()
    file.file.close()
    return {'message': 'Файл успешно загружен'}


@performance_router.get('/sprint/{sprint_name}')
def get_all_task_by_sprint_id(sprint_name: str):
    sprints = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"sprints.csv"), skiprows=1, sep=';')
    data = pd.read_csv(os.path.join(SERVER_DIR_PATH, 'file', f"data.csv"), skiprows=1, sep=';')

    res = data[data['entity_id'].isin(
        list(map(int, sprints.loc[sprints['sprint_name'] == sprint_name, 'entity_ids'].iloc[0].strip('{}').split(',')))
    )]
    res = res.fillna('')

    return res.to_dict()