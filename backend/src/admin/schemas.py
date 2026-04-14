from typing import Optional, List
import uuid
from pydantic import EmailStr
from sqlmodel import SQLModel
from src.auth.models import Status, Title


class MemberAdminUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    birth_day: Optional[int] = None
    birth_month: Optional[int] = None
    title: Optional[Title] = None
    status: Optional[Status] = None
    account_approved: Optional[bool] = None
    post_ids: Optional[List[uuid.UUID]] = None
    subgroup_ids: Optional[List[uuid.UUID]] = None


class MemberAdminCreate(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    birth_day: int
    birth_month: int
    title: Optional[Title] = None
    status: Status
    password: str
    confirm_password: str
    post_ids: Optional[List[uuid.UUID]] = None
    subgroup_ids: Optional[List[uuid.UUID]] = None
