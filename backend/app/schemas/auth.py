from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class SignUpRequest(BaseModel):
    email: EmailStr = Field(..., example="entrepreneur@arthsetu.gov.in")
    password: str = Field(..., min_length=6, example="SecurePassword123!")
    full_name: Optional[str] = Field(None, example="Applicant Name")
    phone: Optional[str] = Field(None, example="+919876543210")

class SignInRequest(BaseModel):
    email: EmailStr = Field(..., example="entrepreneur@arthsetu.gov.in")
    password: str = Field(..., min_length=6, example="SecurePassword123!")

class UserMetadata(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = "authenticated"
    created_at: Optional[str] = None
    user_metadata: Optional[Dict[str, Any]] = None
    app_metadata: Optional[Dict[str, Any]] = None

class AuthSessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = 3600
    refresh_token: Optional[str] = None
    user: UserResponse

class AuthMessageResponse(BaseModel):
    message: str
    success: bool = True
    user: Optional[UserResponse] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: Optional[Any] = None
