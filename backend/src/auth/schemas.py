from datetime import datetime
from typing import Any, Optional
import uuid
from pydantic import BaseModel, EmailStr, Field
from src.auth.models import Status, Title
from enum import Enum

class OtpTypes(str, Enum):
    SIGNUP = "signup"
    FORGOTPASSWORD = "forgotPassword"

class MemberOut(BaseModel):
    uid: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    email_verified: bool
    title: Optional[Title] = None
    birth_month: int
    birth_day: int
    phone_number: str
    account_approved: bool
    post_ids: list[uuid.UUID] = Field(default_factory=list)
    subgroup_ids: list[uuid.UUID] = Field(default_factory=list)
    status: Status
    created_at: datetime
    profile_picture_url: Optional[str] = None
    birthday_picture_url: Optional[str] = None

class AuthMemberOut(BaseModel):
    uid: uuid.UUID
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    account_approved: bool
    status: Optional[Status] = None
    email_verified: Optional[bool] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

class AdminOut(BaseModel):
    uid: uuid.UUID
    email: EmailStr
    role: str = "admin"

class MemberCreateInput(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    title: Optional[Title] = None
    birth_month: int
    birth_day: int
    phone_number: str
    status: Status
    password: str
    post_ids: list[uuid.UUID] = Field(default_factory=list)
    subgroup_ids: list[uuid.UUID] = Field(default_factory=list)

class VerifyOtpInput(BaseModel):
    uid: uuid.UUID
    otp: str
    otp_type: str

class MemberLoginInput(BaseModel):
    email: EmailStr
    password: str

class AdminLoginInput(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordInput(BaseModel):
    email: EmailStr

class ResetPasswordInput(BaseModel):
    reset_token: str
    new_password: str

class RenewAccessTokenInput(BaseModel):
    refresh_token: str

class ResendOtpInput(BaseModel):
    email: EmailStr
    otp_type: str

class LogoutInput(BaseModel):
    refresh_token: Optional[str] = None

class MemberCreateResponse(BaseModel):
    success: bool
    message: str
    data: AuthMemberOut

class MemberLoginResponse(BaseModel):
    success: bool
    message: str
    data: AuthMemberOut

class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    data: AdminOut

class RenewAccessTokenResponse(BaseModel):
    success: bool
    message: str
    data: dict[str, str]

class LogoutResponse(BaseModel):
    success: bool
    message: str
    data: dict[str, Any]
