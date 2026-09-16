import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SHAKIL BAG STORE API"
    OWNER_NAME: str = "Mohammad Shakil"
    CONTACT_PHONE: str = "+91-7217876220"
    CONTACT_EMAIL: str = "himanshu.bkgroup@gmail.com"

    # Database
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "shakil_bag_store")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "shakil_luxury_bags_jwt_secret_2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 72

    # Admin Bootstrap
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "himanshu.bkgroup@gmail.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "ShakilAdmin@2026!")

    # Google Gemini AI
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    # WhatsApp Business Cloud API
    WHATSAPP_ACCESS_TOKEN: str = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
    WHATSAPP_PHONE_NUMBER_ID: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
    WHATSAPP_API_VERSION: str = os.getenv("WHATSAPP_API_VERSION", "v20.0")
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "shakil_webhook_secret_verify_token")

    # Payment Gateway
    PAYMENT_GATEWAY: str = os.getenv("PAYMENT_GATEWAY", "razorpay")
    PAYMENT_GATEWAY_KEY: str = os.getenv("PAYMENT_GATEWAY_KEY", "rzp_test_YourKeyHere")
    PAYMENT_GATEWAY_SECRET: str = os.getenv("PAYMENT_GATEWAY_SECRET", "YourSecretKeyHere")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://shakilbagstore.com",
        "https://shakilbagstore.netlify.app"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
