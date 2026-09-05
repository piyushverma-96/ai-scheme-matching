import logging
from fastapi import APIRouter, HTTPException, status, Depends
from app.config import settings
from app.database import get_supabase_admin, get_supabase_anon
from app.middleware.auth import get_current_user
from app.schemas.auth import (
    SignUpRequest,
    SignInRequest,
    UserResponse,
    AuthSessionResponse,
    AuthMessageResponse,
    ErrorResponse,
)

logger = logging.getLogger("arthsetu.auth_route")
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/signup",
    response_model=AuthMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new entrepreneur/student account",
    description="Registers a new user in Supabase Auth with email, password, and metadata.",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def sign_up(body: SignUpRequest):
    try:
        supabase = get_supabase_anon()
        metadata = {}
        if body.full_name:
            metadata["full_name"] = body.full_name
        if body.phone:
            metadata["phone"] = body.phone
            
        credentials = {
            "email": body.email,
            "password": body.password,
        }
        if metadata:
            credentials["options"] = {"data": metadata}

        res = supabase.auth.sign_up(credentials)
        
        if not res or not res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed. Please verify the provided details.",
            )

        user_data = UserResponse(
            id=str(res.user.id),
            email=res.user.email,
            role=res.user.role,
            created_at=str(res.user.created_at) if hasattr(res.user, "created_at") else None,
            user_metadata=res.user.user_metadata or metadata,
            app_metadata=res.user.app_metadata or {},
        )

        return AuthMessageResponse(
            message="Account registered successfully. Please check your email if confirmation is required.",
            success=True,
            user=user_data,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error for {body.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post(
    "/login",
    response_model=AuthSessionResponse,
    summary="Authenticate user and return JWT session",
    description="Authenticates user credentials against Supabase Auth and returns an access token.",
    responses={401: {"model": ErrorResponse}, 400: {"model": ErrorResponse}},
)
async def sign_in(body: SignInRequest):
    try:
        supabase = get_supabase_anon()
        res = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })

        if not res or not res.session or not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        session = res.session
        user = res.user

        user_data = UserResponse(
            id=str(user.id),
            email=user.email,
            role=user.role,
            created_at=str(user.created_at) if hasattr(user, "created_at") else None,
            user_metadata=user.user_metadata or {},
            app_metadata=user.app_metadata or {},
        )

        return AuthSessionResponse(
            access_token=session.access_token,
            token_type=session.token_type or "bearer",
            expires_in=session.expires_in or 3600,
            refresh_token=session.refresh_token,
            user=user_data,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for {body.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Invalid email or password.",
        )

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description="Validates Bearer token and returns user profile details.",
    responses={401: {"model": ErrorResponse}},
)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user.get("email"),
        role=current_user.get("role", "authenticated"),
        created_at=current_user.get("created_at"),
        user_metadata=current_user.get("user_metadata", {}),
        app_metadata=current_user.get("app_metadata", {}),
    )

@router.post(
    "/logout",
    response_model=AuthMessageResponse,
    summary="Sign out user session",
)
async def sign_out(current_user: dict = Depends(get_current_user)):
    try:
        supabase = get_supabase_anon()
        supabase.auth.sign_out()
    except Exception as e:
        logger.warning(f"Signout notice: {str(e)}")
        
    return AuthMessageResponse(
        message="Signed out successfully",
        success=True,
    )
