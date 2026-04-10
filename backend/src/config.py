from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    IS_PRODUCTION: bool

    JWT_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: list
    REDIS_URL: str
    BREVO_API_KEY: str = ""
    BREVO_SENDER_NAME: str = "Hub"
    BREVO_EMAIL: str = "hub@example.com"
    DATABASE_URL: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET:str


    model_config = SettingsConfigDict(
        env_file =".env",
        extra = "ignore"
    )

Config = Settings()