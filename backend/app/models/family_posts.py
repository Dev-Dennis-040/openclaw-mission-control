"""Family post model for storing logbook entries and pictures from external apps like KSE."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column

from app.models.base import QueryModel

class FamilyPost(QueryModel, table=True):
    """Archived logbook entry or timeline post."""

    __tablename__ = "family_posts"  # pyright: ignore[reportAssignmentType]

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    source: str = Field(default="kse_ouderportaal", index=True) # E.g., kse_ouderportaal, school_app
    child_name: str | None = Field(default=None, index=True) # E.g. Rain, Dane
    post_date: datetime = Field(index=True)
    title: str | None = None
    content: str | None = None
    media_urls: list[str] | None = Field(
        default=[], sa_column=Column(JSONB)
    )
    original_id: str | None = Field(default=None, unique=True, index=True) # To prevent duplicates from n8n webhooks
