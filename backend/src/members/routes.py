from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.members.services import MemberServices
from src.members.schemas import MemberUpdateInput, MemberUpdateResponse
from src.utils.dependencies import get_current_member
from src.utils.logger import logger
import uuid

members_router = APIRouter()

def get_member_services() -> MemberServices:
    return MemberServices()

@members_router.patch("/{member_id}/update-details", response_model=MemberUpdateResponse)
async def update_member_details(
    member_id: uuid.UUID,
    update_data: MemberUpdateInput,
    session: AsyncSession = Depends(get_session),
    current_member = Depends(get_current_member),
    member_services: MemberServices = Depends(get_member_services)
):
    logger.info(f"Update details request for member {member_id} by {current_member.uid}")
    member_services.verify_member_ownership(current_member.uid, member_id)
    
    updated_member = await member_services.update_member_details(member_id, update_data, session)
    
    return {
        "success": True,
        "message": "Profile details updated successfully",
        "data": updated_member.model_dump()
    }

@members_router.patch("/{member_id}/upload-profile-picture", response_model=MemberUpdateResponse)
async def upload_profile_picture(
    member_id: uuid.UUID,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_member = Depends(get_current_member),
    member_services: MemberServices = Depends(get_member_services)
):
    logger.info(f"Profile picture upload request for member {member_id} by {current_member.uid}")
    member_services.verify_member_ownership(current_member.uid, member_id)
    
    updated_member = await member_services.upload_profile_picture(member_id, file, session)
    
    return {
        "success": True,
        "message": "Profile picture uploaded successfully",
        "data": {"profile_picture_url": updated_member.profile_picture_url}
    }

@members_router.patch("/{member_id}/upload-birthday-picture", response_model=MemberUpdateResponse)
async def upload_birthday_picture(
    member_id: uuid.UUID,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_member = Depends(get_current_member),
    member_services: MemberServices = Depends(get_member_services)
):
    logger.info(f"Birthday picture upload request for member {member_id} by {current_member.uid}")
    member_services.verify_member_ownership(current_member.uid, member_id)
    
    updated_member = await member_services.upload_birthday_picture(member_id, file, session)
    
    return {
        "success": True,
        "message": "Birthday picture uploaded successfully",
        "data": {"birthday_picture_url": updated_member.birthday_picture_url}
    }
