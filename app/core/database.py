from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, DeclarativeBase
from app.core.config import settings

# Ajustar pool_size y argumentos según el tipo de base de datos
db_uri = settings.SQLALCHEMY_DATABASE_URI
is_sqlite = db_uri.startswith("sqlite")

engine_kwargs = {
    "echo": settings.DEBUG,
}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(db_uri, **engine_kwargs)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base declarativa moderna de SQLAlchemy 2.0
class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    """
    Dependencia de FastAPI para inyectar una sesión de base de datos en cada petición.
    Garantiza el cierre automático de la conexión al finalizar el ciclo de vida del request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

