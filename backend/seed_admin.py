"""
Seed Admin Script
─────────────────
Terminal-based utility to create an admin account.
Requires the SEED_KEY environment variable to be set in .env.

Steps to run:
    1. cd into the backend directory:
         cd backend

    2. Activate the virtual environment:
         Windows (PowerShell):  .venv\Scripts\Activate.ps1
         Windows (CMD):         .venv\Scripts\activate.bat
         macOS / Linux:         source .venv/bin/activate

    3. Make sure SEED_KEY is set in your .env file:
         SEED_KEY=your-secret-key-here

    4. Run the script:
         python seed_admin.py
"""

import asyncio
import getpass
import hmac
import os
import sys
import re
import uuid

import bcrypt
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import EmailStr

# ── Load .env ───────────────────────────────────────────────────────────
load_dotenv()

SEED_KEY = os.getenv("SEED_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")


# ── Minimal Admin model (mirrors src/admin/models.py) ──────────────────
class Admin(SQLModel, table=True):
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    role: str = "admin"
    password_hash: str = Field(exclude=True)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[\w\.\+\-]+@[\w\-]+\.\w{2,}$", email))


async def main():
    print("\n╔══════════════════════════════════════╗")
    print("║     NLCFHUB — Admin Seed Script      ║")
    print("╚══════════════════════════════════════╝\n")

    # ── Phase 1: Verify seed key ────────────────────────────────────────
    if not SEED_KEY:
        print("✖  SEED_KEY is not configured in the environment.")
        print("   Set it in your .env file and try again.")
        sys.exit(1)

    if not DATABASE_URL:
        print("✖  DATABASE_URL is not configured in the environment.")
        sys.exit(1)

    entered_key = getpass.getpass("🔑 Enter the seed key: ")

    if not hmac.compare_digest(entered_key.strip(), SEED_KEY.strip()):
        print("\n✖  Invalid seed key. Aborting.")
        sys.exit(1)

    print("✔  Seed key verified.\n")

    # ── Phase 2: Collect admin details ──────────────────────────────────
    email = input("📧 Admin email: ").strip().lower()
    if not validate_email(email):
        print("✖  Invalid email format. Aborting.")
        sys.exit(1)

    password = getpass.getpass("🔒 Admin password: ")
    if len(password) < 8:
        print("✖  Password must be at least 8 characters. Aborting.")
        sys.exit(1)

    password_confirm = getpass.getpass("🔒 Confirm password: ")
    if password != password_confirm:
        print("✖  Passwords do not match. Aborting.")
        sys.exit(1)

    # ── Phase 3: Write to database ──────────────────────────────────────
    print("\n⏳ Connecting to database...")

    engine = create_async_engine(url=DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        existing = await session.exec(select(Admin).where(Admin.email == email))
        if existing.first():
            print(f"✖  An admin with email '{email}' already exists.")
            sys.exit(1)

        admin = Admin(
            email=email,
            password_hash=hash_password(password),
            role="admin",
        )

        session.add(admin)
        await session.commit()

    await engine.dispose()

    print(f"\n✔  Admin account created successfully!")
    print(f"   Email: {email}")
    print(f"   UID:   {admin.uid}\n")


if __name__ == "__main__":
    asyncio.run(main())
