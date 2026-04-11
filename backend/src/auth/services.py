from sqlmodel import select, desc
from sqlalchemy.orm import selectinload
from src.auth.models import Member, SignupOtp, ForgotPasswordOtp
from src.auth.schemas import (
    MemberCreateInput, VerifyOtpInput, MemberLoginInput, AdminLoginInput, ForgotPasswordInput, 
    ResetPasswordInput, RenewAccessTokenInput, ResendOtpInput, LogoutInput, OtpTypes
)
from src.admin.models import Admin
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status, UploadFile, Request, Response
from fastapi import BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.exc import DatabaseError
from src.admin.models import Post, Subgroup
from src.utils.logger import logger
from src.utils.auth import generate_password_hash, verify_password_hash, create_token, decode_token
from datetime import datetime, timezone, timedelta
import uuid
from src.db.redis import redis_client
from src.file_upload.main import FileUploadServices, ImageCategory
from src.emailServices.services import EmailServices

file_upload_service = FileUploadServices()
email_services = EmailServices()

# Token expiration configurations
access_token_expiry = timedelta(hours=2)
refresh_token_expiry = timedelta(days=3)
reset_password_expiry = timedelta(minutes=5)

class AuthServices:

    async def get_member(self, email:str, session:AsyncSession, return_data: bool):
        
        statement = (
            select(Member)
            .where(Member.email == email.lower())
            .options(
                selectinload(Member.posts_held),
                selectinload(Member.subgroups)
            )
        )
        result = await session.exec(statement)
        member = result.first()
        
        if member:
            if return_data:
                return member
            logger.warning(f"Conflict: Account with email {email} already exists")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail = f"An account with these details already exists"
            )
        return None

    async def create_member(self, memberInput: MemberCreateInput, session: AsyncSession):
        # Verify member doesn't already exist
        await self.get_member(memberInput.email, session, return_data=False)
        
        # Hash password before storing
        hashed_password = generate_password_hash(memberInput.password)

        # Create new member instance
        new_member = Member(
            first_name=memberInput.first_name,
            last_name=memberInput.last_name,
            email=memberInput.email,
            title=memberInput.title,
            birth_month=memberInput.birth_month,
            birth_day=memberInput.birth_day,
            phone_number=memberInput.phone_number,
            status=memberInput.status,
            password_hash=hashed_password,
        )

        posts = []
        if memberInput.post_ids:
            requested_post_ids = list(set(memberInput.post_ids))
            post_statement = select(Post).where(Post.id.in_(requested_post_ids))
            post_result = await session.exec(post_statement)
            posts = post_result.all()

            if len(posts) != len(requested_post_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more selected posts do not exist"
                )

        subgroups = []
        if memberInput.subgroup_ids:
            requested_subgroup_ids = list(set(memberInput.subgroup_ids))
            subgroup_statement = select(Subgroup).where(Subgroup.id.in_(requested_subgroup_ids))
            subgroup_result = await session.exec(subgroup_statement)
            subgroups = subgroup_result.all()

            if len(subgroups) != len(requested_subgroup_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more selected subgroups do not exist"
                )

        # Attach relations after all queries complete
        # Use run_sync to prevent MissingGreenlet on relationship assignment
        session.add(new_member)

        def _set_relations(sync_session):
            if posts:
                new_member.posts_held = posts
            if subgroups:
                new_member.subgroups = subgroups

        await session.run_sync(lambda s: _set_relations(s))

        try:
            session.add(new_member)
            await session.commit()
            await session.refresh(new_member)

            # Generate tokens automatically upon signup
            member_dict = new_member.model_dump()
            access_token = create_token(member_dict, TokenType="access") if False else create_token(member_dict, token_type="access")
            refresh_token = create_token(member_dict, TokenType="refresh") if False else create_token(member_dict, token_type="refresh")
            
            return {
                **member_dict,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'profile_picture_url': new_member.profile_picture_url
            }

        except DatabaseError:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def verify_otp(self, otp_input: VerifyOtpInput, session: AsyncSession):
        """Verify a member's OTP and activate their account."""
        
        model = SignupOtp if otp_input.otp_type == OtpTypes.SIGNUP else ForgotPasswordOtp
        
        # Retrieve the most recent OTP record for this member
        otp_statement = (select(model)
                       .where(model.uid == otp_input.uid)
                       .order_by(desc(model.created_at)))
        
        result = await session.exec(otp_statement)
        latest_otp_record = result.first()

        # Validate OTP record exists
        if not latest_otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="No OTP found for this member"
            )
        
        # Validate OTP code matches
        if latest_otp_record.otp != otp_input.otp:
            latest_otp_record.attempts += 1
            if latest_otp_record.attempts >= latest_otp_record.max_attempts:  
                await session.delete(latest_otp_record)
                await session.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="OTP expired due to too many failed attempts"
                )
            
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid OTP. {latest_otp_record.max_attempts - latest_otp_record.attempts} attempts remaining"
            )

        # Check if OTP has expired
        if datetime.now(timezone.utc) > latest_otp_record.expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired, please request a new one"
            )
        
        if otp_input.otp_type == OtpTypes.SIGNUP:
            member_statement = select(Member).where(Member.uid == otp_input.uid)
            result = await session.exec(member_statement)
            member = result.first()

            if not member:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Member not found"
                )
        
            try:
                member.email_verified = True
                session.add(member)
                await session.delete(latest_otp_record)
                await session.commit()
                await session.refresh(member)
                return member

            except DatabaseError:
                await session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error"
                )
        
        elif otp_input.otp_type == OtpTypes.FORGOTPASSWORD:
            try:
                await session.delete(latest_otp_record)
                await session.commit()
                return {
                    "uid": latest_otp_record.uid,
                }
            except DatabaseError:
                await session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error"
                )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP type provided"
        )

    async def resend_otp(self, resend_otp_input: ResendOtpInput,session: AsyncSession, background_tasks = BackgroundTasks):
        """Resends an OTP to the member if applicable."""
        
        member = await self.get_member(resend_otp_input.email, session, True)

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member with this email does not exist"
            )
        
        datetime_now = datetime.now(timezone.utc)

        if resend_otp_input.otp_type == OtpTypes.SIGNUP:
            if member.email_verified:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Member is already verified. Please login."
                )
            
            signup_otp_statement = select(SignupOtp).where(SignupOtp.uid == member.uid).order_by(
                SignupOtp.created_at.desc()
            )
            result = await session.exec(signup_otp_statement)
            signup_otp = result.first()

            if signup_otp and signup_otp.expires > datetime_now:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You already requested for an otp, check your email"
                )
            
            otp_record = await email_services.save_otp(member.uid, session, type =OtpTypes.SIGNUP)

            background_tasks.add_task(
                email_services.send_email_verification_otp, 
                member.email, 
                otp_record.otp, 
                member.fullname
            )
            
            return {
                "success": True,
                "message": "Signup OTP resent successfully", 
                "uid": member.uid
            }

        elif resend_otp_input.otp_type == OtpTypes.FORGOTPASSWORD:
             
            forgot_password_otp_statement = select(ForgotPasswordOtp).where(ForgotPasswordOtp.uid == member.uid).order_by(
                ForgotPasswordOtp.created_at.desc()
            )
            result = await session.exec(forgot_password_otp_statement)
            forgot_password_otp = result.first()

            if forgot_password_otp and forgot_password_otp.expires > datetime_now:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You already requested for an otp, check your email"
                )
            
            otp_record = await email_services.save_otp(member.uid, session, type =OtpTypes.FORGOTPASSWORD)

            background_tasks.add_task(
                email_services.send_forgot_password_otp, 
                member.email, 
                otp_record.otp, 
                member.fullname
            )
            return {
                "success": True, 
                "message": "Password reset OTP resent successfully",
                "uid": member.uid
            }
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP type provided"
        )
            
    async def login_member(self, loginInput: MemberLoginInput, session: AsyncSession):
        member = await self.get_member(loginInput.email, session, True)
        
        INVALID_CREDENTIALS = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Credentials"
        )

        if not member:
            raise INVALID_CREDENTIALS
        
        if not member.email_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Please verify your account before you can login. [UID:{member.uid}]"
            )

        verified_password = verify_password_hash(loginInput.password, member.password_hash)

        if not verified_password:
            raise INVALID_CREDENTIALS

        member_dict = member.model_dump()
        access_token = create_token(member_dict, token_type="access")
        refresh_token = create_token(member_dict, token_type="refresh")
        
        # Login returns lightweight data — full profile comes from /me
        return {
            'uid': str(member.uid),
            'first_name': member.first_name,
            'last_name': member.last_name,
            'account_approved': member.account_approved,
            'email_verified': member.email_verified,
            'access_token': access_token,
            'refresh_token': refresh_token,
        }

    async def admin_login(self, loginInput: AdminLoginInput, session: AsyncSession):
        statement = select(Admin).where(Admin.email == loginInput.email.lower())
        result = await session.exec(statement)
        admin = result.first()
        
        INVALID_CREDENTIALS = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Credentials"
        )

        if not admin:
            raise INVALID_CREDENTIALS

        verified_password = verify_password_hash(loginInput.password, admin.password_hash)

        if not verified_password:
            raise INVALID_CREDENTIALS

        admin_dict = admin.model_dump()
        admin_dict["role"] = "admin"
        # Using correct custom util kwargs signature
        access_token = create_token(admin_dict, token_type="access")
        refresh_token = create_token(admin_dict, token_type="refresh")
        
        admin_details = {
            **admin_dict, 
            'access_token': access_token,
            'refresh_token': refresh_token,
        }
        
        return admin_details

    async def check_admin(self, current_user):
        if hasattr(current_user, "role") and current_user.role == "admin":
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized. Admin access required."
        )

    async def forgotPassword(self, forgotPasswordInput: ForgotPasswordInput, session: AsyncSession):
        member = await self.get_member(forgotPasswordInput.email, session, True)

        if not member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is not registered"
            ) 
        
        return member
    
    async def resetPassword(self, resetPasswordInput: ResetPasswordInput, session: AsyncSession):
        token_decode = decode_token(resetPasswordInput.reset_token)

        if token_decode.get('type') != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid token type"
            )

        uid_from_token = token_decode.get('sub')

        statement = select(Member).where(Member.uid == uuid.UUID(uid_from_token))
        result = await session.exec(statement)
        member = result.first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Member not found"
            )

        new_hashed_password = generate_password_hash(resetPasswordInput.new_password)
        member.password_hash = new_hashed_password

        try:
            session.add(member)
            await session.commit()
            await session.refresh(member)
            return member
        except DatabaseError:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
        
    async def upload_profile_picture(self, uid: str, file: UploadFile, session: AsyncSession):
        member_statement = select(Member).where(Member.uid == uuid.UUID(uid))
        result = await session.exec(member_statement)

        member = result.first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        old_profile_picture_id = member.profile_picture_public_id
        profile_picture_id = await file_upload_service.upload_image(
            file=file, 
            old_picture_id=old_profile_picture_id, 
            member_id=uuid.UUID(uid),
            image_category=ImageCategory.PROFILE_PHOTO
        )

        member.profile_picture_public_id = profile_picture_id

        try:
            await session.commit()
            await session.refresh(member)

            return member
        except DatabaseError:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
        
    async def renewAccessToken(self, old_refresh_token_str: str,  session: AsyncSession):
        old_refresh_token_decode = decode_token(old_refresh_token_str)

        if old_refresh_token_decode.get('type') != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token type"
            )
        
        jti = old_refresh_token_decode.get('jti')
        if await self.is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Refresh token reused. Login required."
            )

        uid = old_refresh_token_decode.get("sub") 
        statement = select(Member).where(Member.uid == uuid.UUID(uid))
        result = await session.exec(statement)
        member = result.first()

        if not member:
            # Fallback check for admin
            admin_stmt = select(Admin).where(Admin.uid == uuid.UUID(uid))
            admin_result = await session.exec(admin_stmt)
            admin = admin_result.first()
            if not admin:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Member or Admin not found"
                )
            user_data = {"uid": admin.uid, "email": admin.email, "role": "admin"}
        else:
            user_data = {"uid": member.uid, "email": member.email}

        new_token = create_token(user_data, token_type="access")
        await self.add_token_to_blocklist(old_refresh_token_str)
        new_refresh_token = create_token(user_data, token_type="refresh")
        
        return {
            "access_token" : new_token,
            "refresh_token": new_refresh_token
        }
    
    async def add_token_to_blocklist(self, token):
        token_decoded = decode_token(token)
        token_id = token_decoded.get('jti')
        exp_timestamp = token_decoded.get('exp')

        current_time = datetime.now(timezone.utc).timestamp()
        time_to_live = int(exp_timestamp - current_time)

        if time_to_live > 0:
            try:
                await redis_client.setex(name=token_id, time=time_to_live, value="true")
            except Exception as e:
                logger.error(f"Redis error in add_token_to_blocklist: {e}")
                pass
        
    async def is_token_blacklisted(self, jti: str) -> bool:
        try:
            result = await redis_client.get(jti)
            return result is not None
        except Exception as e:
            logger.error(f"Redis error in is_token_blacklisted: {e}")
            return False
    
    async def logout(self, response: Response, access_token: str = None, refresh_token: str = None):
        if access_token == None and refresh_token == None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tokens missing"
            )

        if access_token:
            await self.add_token_to_blocklist(access_token)
        if refresh_token:
            await self.add_token_to_blocklist(refresh_token)

        response.delete_cookie(key="access_token", httponly=True, samesite="none", secure=True)
        response.delete_cookie(key="refresh_token", httponly=True, samesite="none", secure=True)
        
        return {
            "success": True,
            "message": "Logged out successfully",
            "data": {}
        }

    async def get_me(self, current_member):
        member_dict = current_member.model_dump()
        
        # Enrich with computed fields and relationships that model_dump() misses
        member_dict['phone_number'] = str(current_member.phone_number)
        member_dict['profile_picture_url'] = current_member.profile_picture_url
        member_dict['birthday_picture_url'] = current_member.birthday_picture_url
        member_dict['fullname'] = current_member.fullname
        
        # Ensure title is a clean string for the frontend dropdown
        title_val = getattr(current_member.title, 'value', current_member.title) if current_member.title else None
        member_dict['title'] = str(title_val) if title_val else None
        
        member_dict['posts_held'] = [{'id': str(p.id), 'name': p.name} for p in current_member.posts_held]
        member_dict['subgroups'] = [{'id': str(s.id), 'name': s.name} for s in current_member.subgroups]

        return {
            "success": True,
            "message": "Member details fetched successfully",
            "data": member_dict
        }