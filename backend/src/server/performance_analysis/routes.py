from fastapi import HTTPException
from .schemas import PerformanceTaskParams, TaskStatus
from ml.models import RANDOM_FOREST_MODEL
from . import performance_router
import pandas as pd


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


# @performance_router.post('/upload')
# def upload_file(file: UploadFile = File(...)):
#     """
#     Загрузка файла на сервер
#     :param file: файл
#     :return: статус загрузки
#     """
#     contents = file.file.read()
#     buffer = BytesIO(contents)
#
#     df = pd.read_csv(buffer, sep=',')
#     df = df[df['Имя спринта'].notna()]
#
#     logging.info(df.info())
#     df.to_csv(
#         os.path.join(SERVER_DIR_PATH, 'file', f"uploaded_file_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.csv"),
#         index=False
#     )
#
#     buffer.close()
#     file.file.close()
#     return {'message': 'Файл успешно загружен'}
