from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.usuario import Usuario, RolUsuario
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioResponse,
    TokenResponse,
    LoginPayload,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    usuario = db.get(Usuario, int(user_id))
    if not usuario or not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo o no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return usuario


def require_role(roles_permitidos: List[RolUsuario]):
    def role_checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: Se requiere rol {', '.join(r.value for r in roles_permitidos)}.",
            )
        return current_user
    return role_checker


@router.post(
    "/registro",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario (empleado o mecánico)",
)
def registrar_usuario(
    payload: UsuarioCreate,
    db: Session = Depends(get_db),
):
    existing = db.execute(
        select(Usuario).where(Usuario.email == payload.email.lower().strip())
    ).scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario registrado con el correo {payload.email}.",
        )

    nuevo_usuario = Usuario(
        email=payload.email.lower().strip(),
        nombre_completo=payload.nombre_completo.strip(),
        hashed_password=hash_password(payload.password),
        rol=payload.rol,
        is_active=True,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión con JSON (correo y contraseña)",
)
def login_json(
    payload: LoginPayload,
    db: Session = Depends(get_db),
):
    usuario = db.execute(
        select(Usuario).where(Usuario.email == payload.email.lower().strip())
    ).scalars().first()

    if not usuario or not verify_password(payload.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (correo o contraseña no válidos).",
        )

    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cuenta se encuentra inactiva.",
        )

    token = create_access_token(subject=usuario.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        usuario=UsuarioResponse.model_validate(usuario),
    )


@router.post(
    "/token",
    summary="Iniciar sesión formato OAuth2 form (para Swagger Docs)",
)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    usuario = db.execute(
        select(Usuario).where(Usuario.email == form_data.username.lower().strip())
    ).scalars().first()

    if not usuario or not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
        )

    token = create_access_token(subject=usuario.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UsuarioResponse,
    summary="Obtener perfil del usuario autenticado actual",
)
def get_me(
    current_user: Usuario = Depends(get_current_user),
):
    return current_user

