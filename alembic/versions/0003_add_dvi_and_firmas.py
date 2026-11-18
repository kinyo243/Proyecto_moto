"""Add DVI Inspection and Signatures

Revision ID: 0003_add_dvi_and_firmas
Revises: 0002_add_bahias_and_camaras
Create Date: 2026-11-02 15:52:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0003_add_dvi_and_firmas'
down_revision: Union[str, None] = '0002_add_bahias_and_camaras'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear tipos Enum en PostgreSQL
    estado_dvi_enum = postgresql.ENUM('Verde', 'Amarillo', 'Rojo', name='estado_dvi_enum')
    estado_aprobacion_enum = postgresql.ENUM('Pendiente', 'Aprobado', 'Rechazado', name='estado_aprobacion_enum')
    tipo_evidencia_dvi_enum = postgresql.ENUM('foto', 'video', name='tipo_evidencia_dvi_enum')

    estado_dvi_enum.create(op.get_bind(), checkfirst=True)
    estado_aprobacion_enum.create(op.get_bind(), checkfirst=True)
    tipo_evidencia_dvi_enum.create(op.get_bind(), checkfirst=True)

    # 2. Crear tabla inspecciones_dvi
    op.create_table(
        'inspecciones_dvi',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('fecha_inspeccion', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('tecnico_responsable', sa.String(length=150), nullable=True),
        sa.Column('notas_generales', sa.Text(), nullable=True),
        sa.Column('firma_cliente', sa.String(length=500), nullable=True),
        sa.Column('nombre_firmante', sa.String(length=150), nullable=True),
        sa.Column('documento_firmante', sa.String(length=50), nullable=True),
        sa.Column('fecha_firma', sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            'estado_aprobacion',
            postgresql.ENUM('Pendiente', 'Aprobado', 'Rechazado', name='estado_aprobacion_enum', create_type=False),
            server_default='Pendiente',
            nullable=False
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_reparacion.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('orden_id')
    )
    op.create_index(op.f('ix_inspecciones_dvi_id'), 'inspecciones_dvi', ['id'], unique=False)
    op.create_index(op.f('ix_inspecciones_dvi_orden_id'), 'inspecciones_dvi', ['orden_id'], unique=True)
    op.create_index(op.f('ix_inspecciones_dvi_estado_aprobacion'), 'inspecciones_dvi', ['estado_aprobacion'], unique=False)

    # 3. Crear tabla items_dvi
    op.create_table(
        'items_dvi',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('inspeccion_id', sa.Integer(), nullable=False),
        sa.Column('categoria', sa.String(length=100), nullable=False),
        sa.Column('nombre_item', sa.String(length=150), nullable=False),
        sa.Column(
            'estado',
            postgresql.ENUM('Verde', 'Amarillo', 'Rojo', name='estado_dvi_enum', create_type=False),
            server_default='Verde',
            nullable=False
        ),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['inspeccion_id'], ['inspecciones_dvi.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_items_dvi_id'), 'items_dvi', ['id'], unique=False)
    op.create_index(op.f('ix_items_dvi_inspeccion_id'), 'items_dvi', ['inspeccion_id'], unique=False)
    op.create_index(op.f('ix_items_dvi_categoria'), 'items_dvi', ['categoria'], unique=False)

    # 4. Crear tabla evidencias_item_dvi
    op.create_table(
        'evidencias_item_dvi',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('item_dvi_id', sa.Integer(), nullable=False),
        sa.Column(
            'tipo_archivo',
            postgresql.ENUM('foto', 'video', name='tipo_evidencia_dvi_enum', create_type=False),
            server_default='foto',
            nullable=False
        ),
        sa.Column('archivo_path', sa.String(length=500), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['item_dvi_id'], ['items_dvi.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidencias_item_dvi_id'), 'evidencias_item_dvi', ['id'], unique=False)
    op.create_index(op.f('ix_evidencias_item_dvi_item_dvi_id'), 'evidencias_item_dvi', ['item_dvi_id'], unique=False)


def downgrade() -> None:
    op.drop_table('evidencias_item_dvi')
    op.drop_table('items_dvi')
    op.drop_table('inspecciones_dvi')

    tipo_evidencia_dvi_enum = postgresql.ENUM('foto', 'video', name='tipo_evidencia_dvi_enum')
    estado_aprobacion_enum = postgresql.ENUM('Pendiente', 'Aprobado', 'Rechazado', name='estado_aprobacion_enum')
    estado_dvi_enum = postgresql.ENUM('Verde', 'Amarillo', 'Rojo', name='estado_dvi_enum')

    tipo_evidencia_dvi_enum.drop(op.get_bind(), checkfirst=True)
    estado_aprobacion_enum.drop(op.get_bind(), checkfirst=True)
    estado_dvi_enum.drop(op.get_bind(), checkfirst=True)

