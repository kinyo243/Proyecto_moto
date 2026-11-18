"""Add Bahias, Camaras and Evidencias

Revision ID: 0002_add_bahias_and_camaras
Revises: 0001_initial_schema
Create Date: 2026-11-02 15:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0002_add_bahias_and_camaras'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear Enum estado_camara_enum en PostgreSQL
    estado_camara_enum = postgresql.ENUM('Activa', 'Inactiva', 'En Falla', name='estado_camara_enum')
    estado_camara_enum.create(op.get_bind(), checkfirst=True)

    # 2. Crear tabla bahias
    op.create_table(
        'bahias',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre_bahia', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bahias_id'), 'bahias', ['id'], unique=False)
    op.create_index(op.f('ix_bahias_nombre_bahia'), 'bahias', ['nombre_bahia'], unique=True)

    # 3. Crear tabla camaras
    op.create_table(
        'camaras',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('bahia_id', sa.Integer(), nullable=False),
        sa.Column('url_rtsp', sa.String(length=255), nullable=False),
        sa.Column(
            'estado',
            postgresql.ENUM('Activa', 'Inactiva', 'En Falla', name='estado_camara_enum', create_type=False),
            server_default='Activa',
            nullable=False
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['bahia_id'], ['bahias.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_camaras_id'), 'camaras', ['id'], unique=False)
    op.create_index(op.f('ix_camaras_bahia_id'), 'camaras', ['bahia_id'], unique=False)
    op.create_index(op.f('ix_camaras_estado'), 'camaras', ['estado'], unique=False)

    # 4. Agregar bahia_id a ordenes_reparacion
    op.add_column('ordenes_reparacion', sa.Column('bahia_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_ordenes_reparacion_bahia_id', 'ordenes_reparacion', 'bahias', ['bahia_id'], ['id'], ondelete='SET NULL')
    op.create_index(op.f('ix_ordenes_reparacion_bahia_id'), 'ordenes_reparacion', ['bahia_id'], unique=False)

    # 5. Crear tabla evidencias_inspeccion
    op.create_table(
        'evidencias_inspeccion',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('camara_id', sa.Integer(), nullable=True),
        sa.Column('archivo_path', sa.String(length=500), nullable=False),
        sa.Column('notas', sa.Text(), nullable=True),
        sa.Column('fecha_captura', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_reparacion.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['camara_id'], ['camaras.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidencias_inspeccion_id'), 'evidencias_inspeccion', ['id'], unique=False)
    op.create_index(op.f('ix_evidencias_inspeccion_orden_id'), 'evidencias_inspeccion', ['orden_id'], unique=False)
    op.create_index(op.f('ix_evidencias_inspeccion_camara_id'), 'evidencias_inspeccion', ['camara_id'], unique=False)


def downgrade() -> None:
    op.drop_table('evidencias_inspeccion')
    op.drop_constraint('fk_ordenes_reparacion_bahia_id', 'ordenes_reparacion', type_='foreignkey')
    op.drop_index(op.f('ix_ordenes_reparacion_bahia_id'), table_name='ordenes_reparacion')
    op.drop_column('ordenes_reparacion', 'bahia_id')
    op.drop_table('camaras')
    op.drop_table('bahias')

    estado_camara_enum = postgresql.ENUM('Activa', 'Inactiva', 'En Falla', name='estado_camara_enum')
    estado_camara_enum.drop(op.get_bind(), checkfirst=True)

