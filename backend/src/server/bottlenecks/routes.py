from .schemas import BottlenecksTaskParams, BottlenecksResponse
from ml.models import KMEANS_MODEL
from . import bottlenecks_router
import pandas as pd


@bottlenecks_router.post('/bottleneck')
def identify_bottleneck(task_params: BottlenecksTaskParams) -> BottlenecksResponse:
    """
    Идентификации узких мест с использованием метода ближайших соседей KNN

    :param task_params: параметры задач
    :return: список с резуальтатами на потенциальное узкое место
    """
    df = pd.DataFrame(task_params.model_dump())
    return BottlenecksResponse(
        is_potentially_bottlenecks=KMEANS_MODEL.predict(df[['task_completion_time_minutes', 'task_difficulty']])
    )
