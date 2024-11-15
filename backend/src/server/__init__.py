from .performance_analysis import performance_router
from .bottlenecks import bottlenecks_router
from .charts import charts_router
from fastapi import FastAPI


app = FastAPI()
app.include_router(performance_router)
app.include_router(bottlenecks_router)
app.include_router(charts_router)
