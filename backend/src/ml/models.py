from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
import pandas as pd


# TODO сейчас модель обучена по захардкоженым данным, нужно будет их заменить на реальные
RANDOM_FOREST_MODEL = RandomForestClassifier(n_estimators=100, random_state=42)
df = pd.DataFrame({
    'task_id':                range(1, 11),
    'actual_time_minutes':    [20, 22, 21, 19, 30, 25, 26, 35, 34, 40],  # фактическое время выполнения
    'estimated_time_minutes': [20, 20, 20, 20, 20, 20, 20, 20, 20, 20],  # оценка времени выполнения
    'depends_on':             [None, 1, 1, 2, 3, 4, 5, 6, 7, 8],         # зависимости задач
    'status':                 [0, 0, 0, 0, 1, 0, 1, 2, 2, 2]             # статус выполнения задачи
})
RANDOM_FOREST_MODEL.fit(df[['actual_time_minutes', 'estimated_time_minutes', 'depends_on']], df['status'])

df = pd.DataFrame({
    'task_completion_time_minutes': [5, 6, 7, 8, 25, 3, 4, 2, 30, 1],  # время выполнения задач
    'task_difficulty':      [1, 1, 2, 2, 5, 1, 1, 1, 5, 1]}    # сложность задач
)
KMEANS_MODEL = KMeans(n_clusters=2)
KMEANS_MODEL.fit(
    df[['task_completion_time_minutes', 'task_difficulty']],
    [1 if time > 10 else 0 for time in df['task_completion_time_minutes']]  # 1 - потенциальное узкое место, 0 - нет
)
