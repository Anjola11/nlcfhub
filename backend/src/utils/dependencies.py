from fastapi import HTTPException, status, Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from src.utils.auth import decode_token
from src.db.main import get_session
from src.auth.models import Member
from src.admin.models import Admin
from src.db.redis import redis_client
from sqlmodel import select
from sqlalchemy.orm import selectinload
import uuid
import logging

logger = logging.getLogger(__name__)

async def get_current_member(
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    access_token = request.cookies.get("access_token")
    if not access_token:
        # check auth header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
    
    try:
        token_data = decode_token(access_token)
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    jti = token_data.get('jti')
    if jti:
        try:
            is_blacklisted = await redis_client.get(jti)
            if is_blacklisted:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked. Please login again."
                )
        except Exception as e:
            logger.warning(f"Failed to check token in redis: {e}")
        
    uid = token_data.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token data"
        )
        
    try:
        parsed_uid = uuid.UUID(uid)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format"
        )
        
    statement = (
        select(Member)
        .where(Member.uid == parsed_uid)
        .options(
            selectinload(Member.posts_held),
            selectinload(Member.subgroups)
        )
    )
    result = await session.exec(statement)
    member = result.first()
    
    if not member:
        admin_statement = select(Admin).where(Admin.uid == parsed_uid)
        admin_result = await session.exec(admin_statement)
        admin = admin_result.first()
        if admin:
            setattr(admin, "role", "admin")
            return admin
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Member not found"
        )
        
    return member

async def get_approved_member(
    current_member = Depends(get_current_member)
):
    if hasattr(current_member, "role") and current_member.role == "admin":
        return current_member
        
    if not current_member.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please verify your email first."
        )
        
    if not current_member.account_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval. Please wait while the admin approves your account."
        )
        
    return current_member


async def require_admin(
    current_user = Depends(get_current_member)
):
    """
    Dependency to strictly enforce Admin-only access.
    Reuses get_current_member, then verifies the user is an admin.
    """
    if not (hasattr(current_user, "role") and current_user.role == "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )

    return current_user
