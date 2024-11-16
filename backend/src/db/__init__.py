from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
import os

engine = create_engine(
    f"postgresql+psycopg2://{os.getenv('DB_USER')}:"
    f"{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

Session = sessionmaker(bind=engine)
Base = declarative_base()
from .models import *
Base.metadata.create_all(engine)
