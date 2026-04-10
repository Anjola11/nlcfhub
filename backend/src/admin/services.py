from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from src.admin.models import Post, Subgroup
from fastapi import HTTPException, status
from src.utils.logger import logger

class AdminServices:
    async def get_all_posts(self, session: AsyncSession):
        try:
            statement = select(Post)
            result = await session.exec(statement)
            posts = result.all()
            return [p.model_dump() for p in posts]
        except Exception as e:
            logger.error(f"Error retrieving posts in AdminServices: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve posts"
            )

    async def get_all_subgroups(self, session: AsyncSession):
        try:
            statement = select(Subgroup)
            result = await session.exec(statement)
            subgroups = result.all()
            return [s.model_dump() for s in subgroups]
        except Exception as e:
            logger.error(f"Error retrieving subgroups in AdminServices: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve subgroups"
            )
