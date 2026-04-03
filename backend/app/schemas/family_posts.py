"""Family Post API schemas for create, update, and read operations."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field
from sqlmodel import SQLModel

class FamilyPostBase(SQLModel):
    """Common payload schema for family timeline posts."""

    source: str = Field(
        default="kse_ouderportaal",
        description="Source system that generated the post.",
    )
    child_name: str | None = Field(
        default=None,
        description="Name of the child associated with the post.",
        examples=["Rain", "Dane"],
    )
    post_date: datetime = Field(
        description="The original creation date of the post.",
    )
    title: str | None = Field(
        default=None,
        description="Title or main message of the post.",
    )
    content: str | None = Field(
        default=None,
        description="Detailed text content or full message.",
    )
    media_urls: list[str] | None = Field(
        default=[],
        description="List of URLs pointing to images or other media.",
    )
    original_id: str | None = Field(
        default=None,
        description="Unique identifier from the original source for deduplication.",
    )

class FamilyPostCreate(FamilyPostBase):
    """Properties to receive via api logic or webhooks upon post creation."""

    pass

class FamilyPostUpdate(FamilyPostBase):
    """Properties to receive on post update."""

    pass

class FamilyPostResponse(FamilyPostBase):
    """Properties to return to the client."""

    id: UUID = Field(description="Internal unique identifier for the timeline post.")
