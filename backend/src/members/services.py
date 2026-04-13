from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException, status, UploadFile
from src.auth.models import Member
from src.members.schemas import MemberUpdateInput
from src.file_upload.main import FileUploadServices, ImageCategory
from src.utils.logger import logger
import uuid

file_upload_service = FileUploadServices()

class MemberServices:

    def verify_member_ownership(self, authenticated_member_id: uuid.UUID, target_member_id: uuid.UUID):
        """
        Helper to verify if the authenticated member is the owner of the data.
        """
        if authenticated_member_id != target_member_id:
            logger.warning(f"Unauthorized access attempt: Member {authenticated_member_id} tried to modify Member {target_member_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action on this profile"
            )
        return True

    async def update_member_details(self, member_id: uuid.UUID, update_data: MemberUpdateInput, session: AsyncSession):
        logger.info(f"Attempting to update details for member: {member_id}")
        
        statement = select(Member).where(Member.uid == member_id)
        result = await session.exec(statement)
        member = result.first()

        if not member:
            logger.error(f"Member update failed: Member {member_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )

        # Update only provided fields
        update_dict = update_data.model_dump(exclude_unset=True)
        member.sqlmodel_update(update_dict)

        try:
            session.add(member)
            await session.commit()
            await session.refresh(member)
            logger.info(f"Successfully updated details for member: {member_id}")
            return member
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error updating member {member_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def upload_profile_picture(self, member_id: uuid.UUID, file: UploadFile, session: AsyncSession):
        logger.info(f"Attempting profile picture upload for member: {member_id}")
        
        statement = select(Member).where(Member.uid == member_id)
        result = await session.exec(statement)
        member = result.first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )

        old_id = member.profile_picture_public_id
        new_public_id = await file_upload_service.upload_image(
            file=file,
            old_picture_id=old_id,
            member_id=member_id,
            image_category=ImageCategory.PROFILE_PHOTO
        )

        member.profile_picture_public_id = new_public_id

        try:
            session.add(member)
            await session.commit()
            await session.refresh(member)
            logger.info(f"Successfully updated profile picture for member: {member_id}. New ID: {new_public_id}")
            return member
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error updating profile picture for member {member_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def upload_birthday_picture(self, member_id: uuid.UUID, file: UploadFile, session: AsyncSession):
        logger.info(f"Attempting birthday picture upload for member: {member_id}")
        
        statement = select(Member).where(Member.uid == member_id)
        result = await session.exec(statement)
        member = result.first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )

        old_id = member.birthday_picture_public_id
        new_public_id = await file_upload_service.upload_image(
            file=file,
            old_picture_id=old_id,
            member_id=member_id,
            image_category=ImageCategory.BIRTHDAY_PHOTO
        )

        member.birthday_picture_public_id = new_public_id

        try:
            session.add(member)
            await session.commit()
            await session.refresh(member)
            logger.info(f"Successfully updated birthday picture for member: {member_id}. New ID: {new_public_id}")
            return member
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error updating birthday picture for member {member_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
