"""add composite member indexes

Revision ID: b2f2c8c4a1e9
Revises: f16babe2eb9b
Create Date: 2026-04-13 16:05:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b2f2c8c4a1e9'
down_revision: Union[str, Sequence[str], None] = 'f16babe2eb9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        'ix_members_account_approved_created_at',
        'members',
        ['account_approved', 'created_at'],
        unique=False
    )
    op.create_index(
        'ix_members_account_approved_status',
        'members',
        ['account_approved', 'status'],
        unique=False
    )
    op.create_index(
        'ix_members_account_approved_birth_month_birth_day',
        'members',
        ['account_approved', 'birth_month', 'birth_day'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_members_account_approved_birth_month_birth_day', table_name='members')
    op.drop_index('ix_members_account_approved_status', table_name='members')
    op.drop_index('ix_members_account_approved_created_at', table_name='members')
