from fastapi import APIRouter, Depends, status, Response, Cookie, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from src.auth.schemas import (
    MemberCreateInput,
    MemberCreateResponse,
    MemberLoginInput,
    MemberLoginResponse,
    AdminLoginInput,
    AdminLoginResponse,
    RenewAccessTokenResponse,
    LogoutResponse,
    VerifyOtpInput,
    ResendOtpInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    OtpTypes
)
from src.db.main import get_session
from src.auth.services import AuthServices
from src.emailServices.services import EmailServices
from src.config import Config
from src.utils.auth import access_token_expiry, refresh_token_expiry, create_token, TokenType
from src.utils.dependencies import get_current_member, get_approved_member
from src.utils.logger import logger

auth_router = APIRouter()

cookie_settings = {
    "httponly": True,
    "secure": Config.IS_PRODUCTION,
    "samesite": "none" if Config.IS_PRODUCTION else "lax"
}

def get_auth_services() -> AuthServices:
    return AuthServices()

@auth_router.post('/signup', response_model=MemberCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    member_input: MemberCreateInput, 
    background_tasks: BackgroundTasks,
    response: Response,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"Signup attempt for email: {member_input.email}")
    member_data = await auth_services.create_member(member_input, session)
    uid = member_data.get("uid")
    
    email_services = EmailServices()
    otp_record = await email_services.save_otp(uid, session, type=OtpTypes.SIGNUP)
    background_tasks.add_task(
        email_services.send_email_verification_otp, 
        member_input.email, 
        otp_record.otp, 
        f"{member_input.first_name} {member_input.last_name}"
    )

    # Notify admin of new registration
    background_tasks.add_task(
        email_services.send_admin_new_registration_notification,
        f"{member_input.first_name} {member_input.last_name}",
        member_input.email
    )

    response.set_cookie(
        key="access_token",
        value=member_data.get("access_token"),
        **cookie_settings,
        max_age=int(access_token_expiry.total_seconds())
    )

    response.set_cookie(
        key="refresh_token",
        value=member_data.get("refresh_token"),
        **cookie_settings,
        max_age=int(refresh_token_expiry.total_seconds())
    )
    
    logger.info(f"Signup successful for email: {member_input.email}")
    return {
        "success": True,
        "message": "Signup successful, an OTP has been sent to your email to verify your account.",
        "data": member_data
    }

@auth_router.post('/verify-otp', status_code=status.HTTP_200_OK)
async def verify_otp(
    otp_input: VerifyOtpInput,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"OTP Verification attempt for user ID: {otp_input.uid}")
    result = await auth_services.verify_otp(otp_input, session)
    
    if otp_input.otp_type == OtpTypes.SIGNUP:
        return {
            "success": True,
            "message": "OTP verified, please wait for admin approval before you can login",
            "data": result
        }
        
    elif otp_input.otp_type == OtpTypes.FORGOTPASSWORD:
        # Convert result dict or model instance appropriately for token logic 
        # (create_token expects a dict, result from verify_otp needs to be dict if not already)
        token_data = {"uid": result.uid} if hasattr(result, "uid") else result
        reset_password_token = create_token(token_data, token_type=TokenType.RESET)
        
        # If result is an object/model, return standard dictionary payload
        response_data = result.model_dump() if hasattr(result, "model_dump") else result
        response_data['reset_token'] = reset_password_token
        
        return {
            "success": True,
            "message": "OTP verified successfully",
            "data": response_data
        }

@auth_router.post('/resend-otp', status_code=status.HTTP_200_OK)
async def resend_otp(
    resend_otp_input: ResendOtpInput,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"Resend OTP attempt for email: {resend_otp_input.email}")
    result = await auth_services.resend_otp(resend_otp_input, session, background_tasks)
    return result

@auth_router.post('/forgot-password', status_code=status.HTTP_200_OK)
async def forgot_password(
    forgot_password_input: ForgotPasswordInput,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"Forgot password attempt for email: {forgot_password_input.email}")
    member = await auth_services.forgotPassword(forgot_password_input, session)
    
    email_services = EmailServices()
    otp_record = await email_services.save_otp(member.uid, session, type=OtpTypes.FORGOTPASSWORD)
    background_tasks.add_task(
        email_services.send_forgot_password_otp, 
        member.email, 
        otp_record.otp, 
        f"{member.first_name} {member.last_name}"
    )

    return {
        "success": True,
        "message": "An OTP to reset password has been sent to your email.",
        "data": {
            "uid": str(member.uid)
        }
    }

@auth_router.post('/reset-password', status_code=status.HTTP_200_OK)
async def reset_password(
    reset_password_input: ResetPasswordInput,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info("Reset password attempt")
    member = await auth_services.resetPassword(reset_password_input, session)
    return {
        "success": True,
        "message": "Password reset successfully"
    }


@auth_router.post('/login', response_model=MemberLoginResponse, status_code=status.HTTP_200_OK)
async def login(
    login_input: MemberLoginInput,
    response: Response,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"Login attempt for email: {login_input.email}")
    member_data = await auth_services.login_member(login_input, session)

    response.set_cookie(
        key="access_token",
        value=member_data.get("access_token"),
        **cookie_settings,
        max_age=int(access_token_expiry.total_seconds())
    )

    response.set_cookie(
        key="refresh_token",
        value=member_data.get("refresh_token"),
        **cookie_settings,
        max_age=int(refresh_token_expiry.total_seconds())
    )
    
    logger.info(f"Login successful for email: {login_input.email}")
    return {
        "success": True,
        "message": "Login successful",
        "data": member_data
    }


@auth_router.post('/renew-access-token', response_model=RenewAccessTokenResponse, status_code=status.HTTP_200_OK)
async def renew_access_token(
    response: Response,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services),
    refresh_token: str | None = Cookie(default=None)
):
    logger.info("Renew access token request received.")
    tokens = await auth_services.renewAccessToken(refresh_token, session)

    response.set_cookie(
        key="access_token",
        value=tokens.get("access_token"),
        **cookie_settings,
        max_age=int(access_token_expiry.total_seconds())
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens.get("refresh_token"),
        **cookie_settings,
        max_age=int(refresh_token_expiry.total_seconds())
    )
    
    logger.info("Access token effectively renewed.")
    return {
        "success": True,
        "message": "Access token renewed",
        "data": tokens
    }


@auth_router.post('/logout', response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout(
    response: Response,
    auth_services: AuthServices = Depends(get_auth_services),
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None)
):
    logger.info("Logout request received.")
    result = await auth_services.logout(response, access_token, refresh_token)
    logger.info("Logout successful.")
    return result


@auth_router.post('/admin/login', response_model=AdminLoginResponse, status_code=status.HTTP_200_OK)
async def admin_login(
    login_input: AdminLoginInput,
    response: Response,
    session: AsyncSession = Depends(get_session),
    auth_services: AuthServices = Depends(get_auth_services)
):
    logger.info(f"Admin login attempt for email: {login_input.email}")
    admin_data = await auth_services.admin_login(login_input, session)

    response.set_cookie(
        key="access_token",
        value=admin_data.get("access_token"),
        **cookie_settings,
        max_age=int(access_token_expiry.total_seconds())
    )

    response.set_cookie(
        key="refresh_token",
        value=admin_data.get("refresh_token"),
        **cookie_settings,
        max_age=int(refresh_token_expiry.total_seconds())
    )
    
    logger.info("Admin login successful.")
    return {
        "success": True,
        "message": "Admin login successful",
        "data": admin_data
    }


@auth_router.get("/me")
async def get_me(current_member = Depends(get_approved_member), auth_services: AuthServices = Depends(get_auth_services)):
    return await auth_services.get_me(current_member)
