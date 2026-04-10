from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from src.auth.models import Title, Status
import uuid

class MemberUpdateInput(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    birth_day: Optional[int] = None
    birth_month: Optional[int] = None
    title: Optional[Title] = None
    status: Optional[Status] = None

class MemberProfileResponse(BaseModel):
    success: bool
    message: str
    data: dict

class MemberUpdateResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
