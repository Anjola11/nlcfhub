from src.config import Config
from fastapi import UploadFile, HTTPException, status
import cloudinary
from cloudinary.uploader import upload, destroy
import asyncio
import magic
from enum import Enum
import uuid
from src.utils.logger import logger
class ImageCategory(str, Enum):
    PROFILE_PHOTO = "profile_photo"
    BIRTHDAY_PHOTO = "birthday_photo"
    

max_profile_photo_upload_bytes = 8
max_birthday_photo_upload_bytes = 10



cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key= Config.CLOUDINARY_API_KEY,
    api_secret= Config.CLOUDINARY_API_SECRET
)

class FileUploadServices:

    #allows only images pass
    def validate_file(self, file: UploadFile, image_category: ImageCategory):

        if image_category == ImageCategory.PROFILE_PHOTO:
            max_upload_bytes = max_profile_photo_upload_bytes
        elif image_category == ImageCategory.BIRTHDAY_PHOTO:
            max_upload_bytes = max_birthday_photo_upload_bytes
       
       

        header_data = file.file.read(2048)

        file.file.seek(0)

        mime_detector = magic.Magic(mime=True)

        real_content_type = mime_detector.from_buffer(header_data)

        allowed_types = ["image/jpeg","image/jpg","image/png","image/webp"]

        if real_content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid file type, only Jpeg,png,webp,jpg allowed"
            )
        
        file.file.seek(0,2)

        file_size = file.file.tell()

        file.file.seek(0)

        if file_size > (max_upload_bytes * 1024 * 1024):
            logger.warning(f"File size validation failed: {file_size} bytes exceeds limit of {max_upload_bytes}MB")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"file greater than max size{max_upload_bytes}"
            )
        
        logger.info(f"File validation successful: {file.filename} ({real_content_type}, {file_size} bytes)")
        
    async def upload_image(self, file: UploadFile, old_picture_id,  member_id: uuid.UUID,  image_category: ImageCategory):
        self.validate_file(file, image_category)
        
        file_path = "nlcfhub/Misc"
        
        if image_category == ImageCategory.PROFILE_PHOTO:
            file_path = f"nlcfhub/profile-photo/{member_id}"
        elif image_category == ImageCategory.BIRTHDAY_PHOTO:
            file_path = f"nlcfhub/birthday-photo/{member_id}"
        


         #cleanup logic
        if old_picture_id:
            try:
                await asyncio.to_thread(
                    destroy,
                    old_picture_id
                )
            except Exception as e:
                logger.warning(f"Warning: Failed to delete old image: {e}")

        try:
            response = await asyncio.to_thread(
                upload,
                file.file,
                folder=file_path
            )

            picture_id = response['public_id']
            logger.info(f"Successfully uploaded {image_category} for member {member_id}. Public ID: {picture_id}")

            return picture_id
        
        except Exception as e:
            logger.error(f"failed to upload {member_id} {image_category} picture: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
