from dotenv import load_dotenv
import pathlib
import os

# подгрузка переменных окружения
load_dotenv(os.path.join(pathlib.Path(__file__).parent.parent.resolve(), '.env'))

from server import app
import uvicorn
from database import Database


db = Database()

# async def lifespan(app):
#     await db.connect()
#     yield
#     await db.disconnect()
#
# app.lifespan = lifespan


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")