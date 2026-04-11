from typing import Optional, List
import uuid
from pydantic import BaseModel, EmailStr, ConfigDict
from src.auth.models import Status, Title

class PostLink(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str

class SubgroupLink(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str

class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    uid: uuid.UUID
    first_name: str
    last_name: str
    fullname: Optional[str] = None
    email: EmailStr
    email_verified: bool
    title: Optional[Title] = None
    birth_month: int
    birth_day: int
    phone_number: str
    status: Status
    account_approved: bool
    created_at: object  # datetime
    
    profile_picture_url: Optional[str] = None
    birthday_picture_url: Optional[str] = None
    
    # Nested relationships
    posts_held: List[PostLink] = []
    subgroups: List[SubgroupLink] = []

class MemberAdminUpdate(BaseModel):
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
