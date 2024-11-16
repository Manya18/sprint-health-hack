import asyncpg
import asyncio

DATABASE_CONFIG = {
    'user': 'postgres',
    'password': 'postgres',
    'database': 'sprint-health',
    'host': '127.0.0.1',
    'port': 5432,
}

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(**DATABASE_CONFIG)

    async def disconnect(self):
        await self.pool.close()

    async def fetch(self, query, *args):
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)

    async def execute(self, query, *args):
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)

