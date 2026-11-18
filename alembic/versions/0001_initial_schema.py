"""Initial schema for Clientes, Vehiculos and Ordenes de Reparacion

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-02 14:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Creación explícita de tipos Enum en PostgreSQL
    tipo_cliente_enum = postgresql.ENUM('regular', 'flotilla', name='tipo_cliente_enum')
    nivel_combustible_enum = postgresql.ENUM('Vacio', 'Reserva', '1/4', '1/2', '3/4', 'Lleno', name='nivel_combustible_enum')
    estado_orden_enum = postgresql.ENUM('En Espera', 'En Diagnóstico', 'En Reparación', 'Listo', 'Entregado', name='estado_orden_enum')

    tipo_cliente_enum.create(op.get_bind(), checkfirst=True)
    nivel_combustible_enum.create(op.get_bind(), checkfirst=True)
    estado_orden_enum.create(op.get_bind(), checkfirst=True)

    # 2. Creación de Tabla Clientes
    op.create_table(
        'clientes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('telefono', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('direccion', sa.String(length=255), nullable=True),
        sa.Column(
            'tipo',
            postgresql.ENUM('regular', 'flotilla', name='tipo_cliente_enum', create_type=False),
            server_default='regular',
            nullable=False
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clientes_id'), 'clientes', ['id'], unique=False)
    op.create_index(op.f('ix_clientes_nombre'), 'clientes', ['nombre'], unique=False)
    op.create_index(op.f('ix_clientes_telefono'), 'clientes', ['telefono'], unique=False)
    op.create_index(op.f('ix_clientes_email'), 'clientes', ['email'], unique=False)

    # 3. Creación de Tabla Vehículos
    op.create_table(
        'vehiculos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('cliente_id', sa.Integer(), nullable=False),
        sa.Column('marca', sa.String(length=100), nullable=False),
        sa.Column('modelo', sa.String(length=100), nullable=False),
        sa.Column('anio', sa.Integer(), nullable=False),
        sa.Column('placa', sa.String(length=20), nullable=False),
        sa.Column('vin', sa.String(length=50), nullable=True),
        sa.Column('kilometraje_actual', sa.Integer(), server_default='0', nullable=False),
        sa.Column(
            'nivel_combustible',
            postgresql.ENUM('Vacio', 'Reserva', '1/4', '1/2', '3/4', 'Lleno', name='nivel_combustible_enum', create_type=False),
            server_default='1/2',
            nullable=False
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vehiculos_id'), 'vehiculos', ['id'], unique=False)
    op.create_index(op.f('ix_vehiculos_cliente_id'), 'vehiculos', ['cliente_id'], unique=False)
    op.create_index(op.f('ix_vehiculos_marca'), 'vehiculos', ['marca'], unique=False)
    op.create_index(op.f('ix_vehiculos_modelo'), 'vehiculos', ['modelo'], unique=False)
    op.create_index(op.f('ix_vehiculos_placa'), 'vehiculos', ['placa'], unique=True)
    op.create_index(op.f('ix_vehiculos_vin'), 'vehiculos', ['vin'], unique=True)

    # 4. Creación de Tabla Órdenes de Reparación
    op.create_table(
        'ordenes_reparacion',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('vehiculo_id', sa.Integer(), nullable=False),
        sa.Column(
            'estado',
            postgresql.ENUM('En Espera', 'En Diagnóstico', 'En Reparación', 'Listo', 'Entregado', name='estado_orden_enum', create_type=False),
            server_default='En Espera',
            nullable=False
        ),
        sa.Column('notas_recepcion', sa.Text(), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['vehiculo_id'], ['vehiculos.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_reparacion_id'), 'ordenes_reparacion', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_reparacion_vehiculo_id'), 'ordenes_reparacion', ['vehiculo_id'], unique=False)
    op.create_index(op.f('ix_ordenes_reparacion_estado'), 'ordenes_reparacion', ['estado'], unique=False)


def downgrade() -> None:
    # 1. Eliminar tablas en orden inverso de dependencia referencial
    op.drop_table('ordenes_reparacion')
    op.drop_table('vehiculos')
    op.drop_table('clientes')

    # 2. Eliminar tipos Enum de PostgreSQL
    estado_orden_enum = postgresql.ENUM('En Espera', 'En Diagnóstico', 'En Reparación', 'Listo', 'Entregado', name='estado_orden_enum')
    nivel_combustible_enum = postgresql.ENUM('Vacio', 'Reserva', '1/4', '1/2', '3/4', 'Lleno', name='nivel_combustible_enum')
    tipo_cliente_enum = postgresql.ENUM('regular', 'flotilla', name='tipo_cliente_enum')

    estado_orden_enum.drop(op.get_bind(), checkfirst=True)
    nivel_combustible_enum.drop(op.get_bind(), checkfirst=True)
    tipo_cliente_enum.drop(op.get_bind(), checkfirst=True)
