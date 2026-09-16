from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URL}...")
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URL)
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Test connection
        await db_instance.db.command("ping")
        logger.info("Successfully connected to MongoDB.")

        # Create indexes
        await db_instance.db.products.create_index("slug", unique=True)
        await db_instance.db.products.create_index("sku", unique=True)
        await db_instance.db.products.create_index("category")
        await db_instance.db.users.create_index("email", unique=True)
        await db_instance.db.orders.create_index("orderId", unique=True)
        await db_instance.db.abandoned_carts.create_index("cartId")
    except Exception as e:
        logger.error(f"MongoDB connection error: {e}")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
