from typing import Optional, List
import uuid

from pydantic import EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber
from sqlmodel import SQLModel

from src.auth.models import Status, Title


class MemberAdminUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[PhoneNumber] = None
    birth_day: Optional[int] = None
    birth_month: Optional[int] = None
    title: Optional[Title] = None
    status: Optional[Status] = None
    account_approved: Optional[bool] = None
    post_ids: Optional[List[uuid.UUID]] = None
    subgroup_ids: Optional[List[uuid.UUID]] = None

