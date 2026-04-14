from fastapi import APIRouter, Depends, status, Query, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.admin.services import AdminServices
from src.admin.schemas import MemberAdminUpdate
from src.emailServices.services import EmailServices
from src.utils.dependencies import require_admin
from src.utils.logger import logger
import uuid

# Public metadata routes (no auth required)
meta_router = APIRouter()

# Admin-only routes — every endpoint here requires admin authentication
admin_router = APIRouter(
    dependencies=[Depends(require_admin)]
)

admin_services = AdminServices()

def get_admin_services() -> AdminServices:
    return admin_services

def serialize_post_links(posts):
    return [
        {"id": str(post.id), "name": post.name}
        for post in (posts or [])
    ]

def serialize_subgroup_links(subgroups):
    return [
        {"id": str(subgroup.id), "name": subgroup.name}
        for subgroup in (subgroups or [])
    ]

def serialize_pending_member(member):
    payload = member.model_dump(
        mode="json",
        include={
            "uid", "first_name", "last_name", "fullname", "email",
            "phone_number", "account_approved", "created_at", "profile_picture_url"
        }
    )
    payload["subgroups"] = serialize_subgroup_links(member.subgroups)
    payload["posts_held"] = serialize_post_links(member.posts_held)
    return payload

def serialize_approved_member(member):
    payload = member.model_dump(
        mode="json",
        include={
            "uid", "first_name", "last_name", "fullname", "email", "title",
            "birth_month", "birth_day", "phone_number", "status",
            "account_approved", "created_at", "profile_picture_url"
        }
    )
    payload["posts_held"] = serialize_post_links(member.posts_held)
    payload["subgroups"] = serialize_subgroup_links(member.subgroups)
    return payload

def serialize_full_member(member):
    payload = member.model_dump(
        mode="json",
        include={
            "uid", "first_name", "last_name", "fullname", "email", "email_verified",
            "title", "birth_month", "birth_day", "phone_number", "status",
            "account_approved", "created_at", "profile_picture_url", "birthday_picture_url",
            "download_birthday_picture_url", "download_profile_picture_url"
        }
    )
    payload["posts_held"] = serialize_post_links(member.posts_held)
    payload["subgroups"] = serialize_subgroup_links(member.subgroups)
    return payload


# ── Public Metadata ──────────────────────────────────────────────────────────

@meta_router.get('/posts', status_code=status.HTTP_200_OK)
async def get_posts(
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    posts = await admin_services.get_all_posts(session)
    return {
        "success": True,
        "message": "Posts retrieved successfully",
        "data": posts
    }

@meta_router.get('/subgroups', status_code=status.HTTP_200_OK)
async def get_subgroups(
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    subgroups = await admin_services.get_all_subgroups(session)
    return {
        "success": True,
        "message": "Subgroups retrieved successfully",
        "data": subgroups
    }


# ── Admin: Member Management ────────────────────────────────────────────────

@admin_router.get('/members/pending', status_code=status.HTTP_200_OK)
async def get_pending_members(
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin fetching pending members, limit={limit}, offset={offset})")
    members, total = await admin_services.get_all_pending_members(
        session,
        limit=limit,
        offset=offset
    )
    return {
        "success": True,
        "data": [serialize_pending_member(m) for m in members],
        "meta": {
            "total": total,
            "limit": limit,
            "offset": offset
        }
    }


@admin_router.get('/members/approved', status_code=status.HTTP_200_OK)
async def get_approved_members(
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    birth_month: int | None = Query(None, ge=1, le=12),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin fetching approved members (search={search}, status={status_filter}, month={birth_month}, limit={limit}, offset={offset})")
    members, total = await admin_services.get_all_approved_members(
        session,
        search=search,
        status_filter=status_filter,
        birth_month=birth_month,
        limit=limit,
        offset=offset
    )
    return {
        "success": True,
        "data": [serialize_approved_member(m) for m in members],
        "meta": {
            "total": total,
            "limit": limit,
            "offset": offset
        }
    }


@admin_router.get('/members/upcoming-birthdays', status_code=status.HTTP_200_OK)
async def get_upcoming_birthdays(
    limit: int = Query(5, ge=1, le=20),
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin fetching upcoming birthdays (limit={limit})")
    members = await admin_services.get_upcoming_birthdays(session, limit=limit)
    return {
        "success": True, 
        "data": [serialize_full_member(m) for m in members]
    }


@admin_router.get('/members/{member_uid}', status_code=status.HTTP_200_OK)
async def get_member_details(
    member_uid: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    member = await admin_services.get_member_details(member_uid, session)
    return {"success": True, "data": serialize_full_member(member)}


@admin_router.patch('/members/{member_uid}/approve', status_code=status.HTTP_200_OK)
async def approve_member(
    member_uid: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
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
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin rejecting member {member_uid}")
    return await admin_services.reject_member(member_uid, session)


@admin_router.delete('/members/{member_uid}', status_code=status.HTTP_200_OK)
async def delete_approved_member(
    member_uid: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin deleting member {member_uid}")
    return await admin_services.delete_member(member_uid, session)


@admin_router.patch('/members/{member_uid}', status_code=status.HTTP_200_OK)
async def edit_member(
    member_uid: uuid.UUID,
    member_data: MemberAdminUpdate,
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    logger.info(f"Admin editing member {member_uid}")
    member = await admin_services.edit_member_details(member_uid, member_data, session)
    return {
        "success": True, 
        "message": "Member updated", 
        "data": serialize_full_member(member)
    }


@admin_router.get('/stats', status_code=status.HTTP_200_OK)
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    admin_services: AdminServices = Depends(get_admin_services)
):
    """Returns high-level statistics for the admin dashboard overview."""
    logger.info("Admin fetching dashboard stats")
    stats = await admin_services.get_dashboard_stats(session)
    return {
        "success": True,
        "message": "Dashboard statistics retrieved successfully",
        "data": stats
    }
