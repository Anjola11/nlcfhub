from sqlmodel import SQLModel, Field, Relationship, Column
import uuid
from pydantic import EmailStr
from typing import List
from datetime import datetime, timezone
import sqlalchemy.dialects.postgresql as pg
from src.auth.models import MemberPostLink
from src.auth.models import MemberSubgroupLink



def utc_now():
    return datetime.now(timezone.utc)


class Admin(SQLModel, table = True):
    uid: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    email: EmailStr = Field(unique=True, index=True)
    role: str = "admin"
    password_hash: str = Field(exclude=True)

class Post(SQLModel, table = True):

    __tablename__ = "posts"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    name: str
    
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(pg.TIMESTAMP(timezone=True), nullable=False)
    )

    #relationship
    members: List["Member"] = Relationship(
        back_populates="posts_held",
        link_model=MemberPostLink
    )

class Subgroup(SQLModel, table=True):

    __tablename__ = "subgroups"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    name: str
    
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(pg.TIMESTAMP(timezone=True), nullable=False)
    )

    #relationship
    members: List["Member"] = Relationship(
        back_populates="subgroups", 
        link_model=MemberSubgroupLink
    )