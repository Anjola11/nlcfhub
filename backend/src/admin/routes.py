from fastapi import APIRouter, Depends, status, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.admin.services import AdminServices
from src.utils.logger import logger

meta_router = APIRouter()
admin_services = AdminServices()

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
