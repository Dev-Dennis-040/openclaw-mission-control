"""Family Posts API routes for logbook entries."""

from __future__ import annotations

from typing import Any
import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import SESSION_DEP, require_user_auth
from app.models.family_posts import FamilyPost
from app.schemas.family_posts import FamilyPostCreate, FamilyPostResponse

router = APIRouter(tags=["Family Posts"])

@router.get("/family-posts", response_model=Page[FamilyPostResponse])
async def list_family_posts(
    *,
    session: AsyncSession = SESSION_DEP,
    # Optional filtering:
    source: str | None = None,
    child_name: str | None = None,
) -> Any:
    """List and filter family posts for the Timeline view."""
    stmt = select(FamilyPost).order_by(FamilyPost.post_date.desc())
    if source:
        stmt = stmt.where(FamilyPost.source == source)
    if child_name:
        stmt = stmt.where(FamilyPost.child_name == child_name)
    return await paginate(session, stmt)

@router.post(
    "/family-posts",
    response_model=FamilyPostResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_user_auth)],
)
async def create_family_post(
    *,
    session: AsyncSession = SESSION_DEP,
    post_in: FamilyPostCreate,
) -> Any:
    """Create a new family post (typically called by n8n webhook)."""
    # Check if duplicate exists
    if post_in.original_id:
        existing = (await session.exec(
            select(FamilyPost).where(FamilyPost.original_id == post_in.original_id)
        )).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Post with original_id {post_in.original_id} already exists."
            )

    new_post = FamilyPost.model_validate(post_in)
    session.add(new_post)
    await session.commit()
    await session.refresh(new_post)
    return new_post

@router.post(
    "/family-posts/upload-media/{filename}",
    status_code=status.HTTP_201_CREATED,
    dependencies=[], # Open endpoint for now for n8n or add admin dep
)
async def upload_media(
    filename: str,
    request: Request,
) -> dict[str, str]:
    """Upload a raw binary media file."""
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty body")
        
    os.makedirs("media", exist_ok=True)
    file_path = os.path.join("media", filename)
    with open(file_path, "wb") as f:
        f.write(body)
        
    # Standard URL pattern for the frontend/n8n to consume
    return {"url": f"https://gateway.openclaw.com/media/{filename}"}
