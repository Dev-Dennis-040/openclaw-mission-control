"""Merge upstream and custom migration heads

Revision ID: h1a2b3c4d5e6
Revises: e76c37a069d0, a9b1c2d3e4f7
Create Date: 2026-03-25 09:40:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "h1a2b3c4d5e6"
down_revision = ("e76c37a069d0", "a9b1c2d3e4f7")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
