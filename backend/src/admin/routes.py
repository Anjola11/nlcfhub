from fastapi import APIRouter, Depends, status, Query, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.admin.services import AdminServices
from src.admin.schemas import MemberAdminUpdate, MemberResponse
from src.utils.dependencies import require_admin
from src.utils.logger import logger
from typing import List
import uuid

# Public metadata routes (no auth required)
meta_router = APIRouter()

# Admin-only routes — every endpoint here requires admin authentication
admin_router = APIRouter(
    dependencies=[Depends(require_admin)]
)

admin_services = AdminServices()


# ── Public Metadata ──────────────────────────────────────────────────────────

@meta_router.get('/posts', status_code=status.HTTP_200_OK)
async def get_posts(session: AsyncSession = Depends(get_session)):
    posts = await admin_services.get_all_posts(session)
    return {
        "success": True,
        "message": "Posts retrieved successfully",
        "data": posts
    }

@meta_router.get('/subgroups', status_code=status.HTTP_200_OK)
async def get_subgroups(session: AsyncSession = Depends(get_session)):
    subgroups = await admin_services.get_all_subgroups(session)
    return {
        "success": True,
        "message": "Subgroups retrieved successfully",
        "data": subgroups
    }


# ── Admin: Member Management ────────────────────────────────────────────────

@admin_router.get('/members/pending', response_model=dict, status_code=status.HTTP_200_OK)
async def get_pending_members(session: AsyncSession = Depends(get_session)):
    logger.info("Admin fetching pending members")
    members = await admin_services.get_all_pending_members(session)
    # Using MemberResponse.model_validate(m).model_dump() implicitly via response_model is better,
    # but since return structure is {"success": True, "data": ...}, we manually validate/dump for speed
    return {
        "success": True, 
        "data": [MemberResponse.model_validate(m) for m in members]
    }


@admin_router.get('/members/approved', response_model=dict, status_code=status.HTTP_200_OK)
async def get_approved_members(
    status_filter: str | None = Query(None, alias="status"),
    birth_month: int | None = Query(None, ge=1, le=12),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin fetching approved members (status={status_filter}, month={birth_month}, limit={limit})")
    members = await admin_services.get_all_approved_members(
        session, status_filter=status_filter, birth_month=birth_month, limit=limit, offset=offset
    )
    return {
        "success": True, 
        "data": [MemberResponse.model_validate(m) for m in members]
    }


@admin_router.get('/members/upcoming-birthdays', response_model=dict, status_code=status.HTTP_200_OK)
async def get_upcoming_birthdays(
    limit: int = Query(5, ge=1, le=20),
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin fetching upcoming birthdays (limit={limit})")
    members = await admin_services.get_upcoming_birthdays(session, limit=limit)
    return {
        "success": True, 
        "data": [MemberResponse.model_validate(m) for m in members]
    }


@admin_router.get('/members/{member_uid}', response_model=dict, status_code=status.HTTP_200_OK)
async def get_member_details(
    member_uid: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    member = await admin_services.get_member_details(member_uid, session)
    return {"success": True, "data": MemberResponse.model_validate(member)}


@admin_router.patch('/members/{member_uid}/approve', status_code=status.HTTP_200_OK)
async def approve_member(
    member_uid: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin approving member {member_uid}")
    member = await admin_services.approve_member(member_uid, session)
    
    # Send welcome email now that account is approved
    email_services = EmailServices()
    background_tasks.add_task(
        email_services.send_welcome_email,
        member.email,
        f"{member.first_name} {member.last_name}"
    )
    
    return {"success": True, "message": "Member approved successfully"}


@admin_router.delete('/members/{member_uid}/reject', status_code=status.HTTP_200_OK)
async def reject_member(
    member_uid: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin rejecting member {member_uid}")
    return await admin_services.reject_member(member_uid, session)


@admin_router.delete('/members/{member_uid}', status_code=status.HTTP_200_OK)
async def delete_approved_member(
    member_uid: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin deleting member {member_uid}")
    return await admin_services.delete_member(member_uid, session)


@admin_router.patch('/members/{member_uid}', response_model=dict, status_code=status.HTTP_200_OK)
async def edit_member(
    member_uid: uuid.UUID,
    member_data: MemberAdminUpdate,
    session: AsyncSession = Depends(get_session)
):
    logger.info(f"Admin editing member {member_uid}")
    member = await admin_services.edit_member_details(member_uid, member_data, session)
    return {
        "success": True, 
        "message": "Member updated", 
        "data": MemberResponse.model_validate(member)
    }


@admin_router.get('/stats', status_code=status.HTTP_200_OK)
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    """Returns high-level statistics for the admin dashboard overview."""
    logger.info("Admin fetching dashboard stats")
    stats = await admin_services.get_dashboard_stats(session)
    return {
        "success": True,
        "message": "Dashboard statistics retrieved successfully",
        "data": stats
    }
