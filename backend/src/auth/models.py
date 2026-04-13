from sqlmodel import SQLModel, Field, Relationship, Column
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import EmailStr, model_validator, field_validator, computed_field
from typing import Optional, List
from pydantic_extra_types.phone_numbers import PhoneNumber
import re 
import sqlalchemy.dialects.postgresql as pg
from enum import Enum
import cloudinary

class Status(str, Enum):
    STUDENT = "student"
    ALUMNI = "alumni"

class Title(str, Enum):
    MR = "Mr."
    MRS = "Mrs."
    MISS = "Miss"
    DR = "Dr."
    PROF = "Prof."
    PASTOR = "Pastor"

def utc_now():
    return datetime.now(timezone.utc)


class MemberSubgroupLink(SQLModel, table=True):
    __tablename__ = "member_subgroup"

    member_id: uuid.UUID = Field(foreign_key="members.uid", primary_key=True)
    subgroup_id: uuid.UUID = Field(foreign_key="subgroups.id", primary_key=True)


class MemberPostLink(SQLModel, table=True):
    __tablename__ = "member_post"

    member_id: uuid.UUID = Field(foreign_key="members.uid", primary_key=True)
    post_id: uuid.UUID = Field(foreign_key="posts.id", primary_key=True)

class Member(SQLModel, table=True):
    __tablename__ = "members"
    uid: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    first_name: str
    last_name: str

    email: EmailStr = Field(unique=True, index=True)
    email_verified: bool = Field(default=False)

    title: Optional[Title] = Field(default=None)

    birth_month: int = Field(ge= 1, le=12, index=True)
    birth_day: int = Field(ge=1, le=31)

    phone_number: PhoneNumber = Field(unique=True, index=True, max_length=20)

    password_hash: str = Field(exclude=True)

    account_approved: bool = Field(default=False, index=True)

    status: Status = Field(index=True)

    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(pg.TIMESTAMP(timezone=True), nullable=False)
    )

    #relationships
    posts_held: List["Post"] = Relationship(
        back_populates="members",
        link_model=MemberPostLink
    )

    subgroups: List["Subgroup"] = Relationship(
        back_populates="members", 
        link_model=MemberSubgroupLink
    )

    profile_picture_public_id: Optional[str] = Field(default=None, exclude=True)
    birthday_picture_public_id: Optional[str] = Field(default=None, exclude=True)


    @computed_field
    @property
    def profile_picture_url(self) -> str:
        if not self.profile_picture_public_id:
            return None
        
        url, options = cloudinary.utils.cloudinary_url(
            self.profile_picture_public_id,
            width=500,
            height=500,
            crop="thumb", 
            gravity="faces", 
            quality="auto:best",
            fetch_format="auto",
            dpr="auto",
        )

        return url
    
    @computed_field
    @property
    def birthday_picture_url(self) -> Optional[str]:
        picture = self.birthday_picture_public_id or self.profile_picture_public_id
        
        if not picture:
            return None
        
        url, options = cloudinary.utils.cloudinary_url(
            picture,
            width=1000,
            height=1200,
            crop="limit",
            effect="improve:outdoor", 
            quality="auto:good",
            fetch_format="auto",
            dpr="auto"
        )

        return url

    @computed_field
    @property
    def download_birthday_picture_url(self) -> Optional[str]:
        picture = self.birthday_picture_public_id or self.profile_picture_public_id

        if not picture:
            return None

        filename = f"{self.first_name}_{self.last_name}_Birthday".replace(" ", "_")

        url, options = cloudinary.utils.cloudinary_url(
            picture,
            width=1000,
            height=1200,
            crop="limit",
            effect="improve:outdoor",
            quality="auto:good",
            fetch_format="auto",
            dpr="auto",
            flags=f"attachment:{filename}"
        )

        return url

    @computed_field
    @property
    def download_profile_picture_url(self) -> Optional[str]:
        if not self.profile_picture_public_id:
            return None

        filename = f"{self.first_name}_{self.last_name}_Profile".replace(" ", "_")

        url, options = cloudinary.utils.cloudinary_url(
            self.profile_picture_public_id,
            width=500,
            height=500,
            crop="thumb",
            gravity="faces",
            quality="auto:best",
            fetch_format="auto",
            dpr="auto",
            flags=f"attachment:{filename}"
        )

        return url
    
    @computed_field
    @property
    def fullname(self) -> Optional[str]:
        return f"{self.last_name} {self.first_name}"

    

    @model_validator(mode='after')
    def validate_day_for_month(self):

        if self.birth_month in (4, 6, 9, 11) and self.birth_day > 30:
            raise ValueError('This month only has 30 days.')
        
        if self.birth_month == 2 and self.birth_day > 29:
            raise ValueError("February can have a maximum of 29 days.")
        
        return self
    
    @field_validator("phone_number", mode='before')
    @classmethod
    def fix_phone_number_format(cls, v: str):
        if not v or not isinstance(v, str):
            return v
        
        #remove all whitspaces, middle oo, trailing oo, leading oo
        cleaned = re.sub(r"\s+", "", v)

        # Fix the +2340... issue
        # If it starts with +2340, we remove the 0 (index 4)
        if cleaned.startswith("+2340"):
            cleaned = "+234" + cleaned[5:]
        
        return cleaned

def get_expiry_time(minutes):
    
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)

class SignupOtp(SQLModel, table=True):
   
    __tablename__ = "signupOtp"
    
    otp_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    otp: str
    uid: uuid.UUID = Field(foreign_key="members.uid")
    max_attempts: int = Field(default=3)
    attempts:  int = Field(default=0)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(pg.TIMESTAMP(timezone=True)))
    expires: datetime = Field(
        default_factory=lambda: get_expiry_time(10),
        sa_column=Column(pg.TIMESTAMP(timezone=True)))

class ForgotPasswordOtp(SQLModel, table=True):
    
    __tablename__ = "forgotPasswordOtp"
    
    otp_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    otp: str
    uid: uuid.UUID = Field(foreign_key="members.uid")
    max_attempts: int = Field(default=3)
    attempts:  int = Field(default=0)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(pg.TIMESTAMP(timezone=True)))
    expires: datetime = Field(
        default_factory=lambda: get_expiry_time(10),
        sa_column=Column(pg.TIMESTAMP(timezone=True)))
