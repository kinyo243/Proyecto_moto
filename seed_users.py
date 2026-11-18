from app.core.database import SessionLocal
from app.models.usuario import Usuario, RolUsuario
from app.core.security import hash_password


def seed_default_users():
    db = SessionLocal()
    try:
        users = [
            ("admin@taller.com", "Administrador Taller", "admin123", RolUsuario.ADMINISTRADOR),
            ("recepcion@taller.com", "Recepcionista Mostrador", "recepcion123", RolUsuario.RECEPCIONISTA),
            ("mecanico@taller.com", "Mecánico Especialista", "mecanico123", RolUsuario.MECANICO),
        ]

        for email, nombre, pwd, rol in users:
            existing = db.query(Usuario).filter(Usuario.email == email).first()
            if not existing:
                u = Usuario(
                    email=email,
                    nombre_completo=nombre,
                    hashed_password=hash_password(pwd),
                    rol=rol,
                    is_active=True,
                )
                db.add(u)
                print(f"Creado usuario: {email} ({rol.value})")
            else:
                print(f"Usuario ya existente: {email}")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_default_users()

