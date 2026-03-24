"""add_loop_limits

Revision ID: e76c37a069d0
Revises: g1c2d3e4f5a7
Create Date: 2026-03-24 20:52:19.829770

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e76c37a069d0'
down_revision = 'g1c2d3e4f5a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('agents', sa.Column('max_iterations', sa.Integer(), nullable=True))
    op.add_column('agents', sa.Column('token_budget', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('agents', 'token_budget')
    op.drop_column('agents', 'max_iterations')
