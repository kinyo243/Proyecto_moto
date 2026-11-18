from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.usuario import RolUsuario


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_completo: str = Field(..., min_length=2, max_length=150)
    rol: RolUsuario = Field(default=RolUsuario.RECEPCIONISTA)
    is_active: bool = True


class UsuarioCreate(BaseModel):
    email: EmailStr
    nombre_completo: str = Field(..., min_length=2, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    rol: RolUsuario = Field(default=RolUsuario.RECEPCIONISTA)


class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


class LoginPayload(BaseModel):
    email: EmailStr
    password: str

