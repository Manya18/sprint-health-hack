from .performance_analysis import performance_router
from fastapi.middleware.cors import CORSMiddleware
from .bottlenecks import bottlenecks_router
from .charts import charts_router
from fastapi import FastAPI


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(performance_router)
app.include_router(bottlenecks_router)
app.include_router(charts_router)
