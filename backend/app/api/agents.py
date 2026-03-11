"""Thin API wrappers for async agent lifecycle operations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sse_starlette.sse import EventSourceResponse

from app.api.deps import ActorContext, require_admin_or_agent, require_org_admin
from app.core.auth import AuthContext, get_auth_context
from app.db.session import get_session
from app.schemas.agents import (
    AgentCreate,
    AgentHeartbeat,
    AgentHeartbeatCreate,
    AgentHubGatewayRead,
    AgentRead,
    AgentUpdate,
)
from app.schemas.common import OkResponse
from app.schemas.pagination import DefaultLimitOffsetPage
from app.services.openclaw.provisioning_db import AgentLifecycleService, AgentUpdateOptions
from app.services.organizations import OrganizationContext

if TYPE_CHECKING:
    from fastapi_pagination.limit_offset import LimitOffsetPage
    from sqlmodel.ext.asyncio.session import AsyncSession

from sqlalchemy import func as sa_func
from sqlmodel import col, select

from app.models.agents import Agent
from app.models.gateways import Gateway
from app.models.tasks import Task

router = APIRouter(prefix="/agents", tags=["agents"])

BOARD_ID_QUERY = Query(default=None)
GATEWAY_ID_QUERY = Query(default=None)
SINCE_QUERY = Query(default=None)
SESSION_DEP = Depends(get_session)
ORG_ADMIN_DEP = Depends(require_org_admin)
ACTOR_DEP = Depends(require_admin_or_agent)
AUTH_DEP = Depends(get_auth_context)


@dataclass(frozen=True, slots=True)
class _AgentUpdateParams:
    force: bool
    auth: AuthContext
    ctx: OrganizationContext


def _agent_update_params(
    *,
    force: bool = False,
    auth: AuthContext = AUTH_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> _AgentUpdateParams:
    return _AgentUpdateParams(force=force, auth=auth, ctx=ctx)


AGENT_UPDATE_PARAMS_DEP = Depends(_agent_update_params)


@router.get("", response_model=DefaultLimitOffsetPage[AgentRead])
async def list_agents(
    board_id: UUID | None = BOARD_ID_QUERY,
    gateway_id: UUID | None = GATEWAY_ID_QUERY,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> LimitOffsetPage[AgentRead]:
    """List agents visible to the active organization admin."""
    service = AgentLifecycleService(session)
    return await service.list_agents(
        board_id=board_id,
        gateway_id=gateway_id,
        ctx=ctx,
    )


@router.get("/stream")
async def stream_agents(
    request: Request,
    board_id: UUID | None = BOARD_ID_QUERY,
    since: str | None = SINCE_QUERY,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> EventSourceResponse:
    """Stream agent updates as SSE events."""
    service = AgentLifecycleService(session)
    return await service.stream_agents(
        request=request,
        board_id=board_id,
        since=since,
        ctx=ctx,
    )


@router.post("", response_model=AgentRead)
async def create_agent(
    payload: AgentCreate,
    session: AsyncSession = SESSION_DEP,
    actor: ActorContext = ACTOR_DEP,
) -> AgentRead:
    """Create and provision an agent."""
    service = AgentLifecycleService(session)
    return await service.create_agent(payload=payload, actor=actor)


@router.get("/hub", response_model=list[AgentHubGatewayRead])
async def list_agents_hub(
    session: "AsyncSession" = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> list[AgentHubGatewayRead]:
    """Return agents grouped by gateway with task counts, skills, and activity for the Agent Hub."""
    from app.models.activity_events import ActivityEvent
    from app.models.skills import GatewayInstalledSkill, MarketplaceSkill
    from app.schemas.agents import AgentActivityItem, AgentRead as _AgentRead

    # 1. Fetch all agents for this org (Agent has no org_id — join via Gateway)
    agent_rows = list(
        await session.exec(
            select(Agent)
            .join(Gateway, col(Agent.gateway_id) == col(Gateway.id))
            .where(col(Gateway.organization_id) == ctx.member.organization_id)
        )
    )
    if not agent_rows:
        return []

    agents: list[_AgentRead] = [_AgentRead.model_validate(a) for a in agent_rows]
    agent_ids = [a.id for a in agents]

    # 2. Fetch gateway metadata (name + url)
    gateway_ids = list({a.gateway_id for a in agents})
    gateway_meta_rows = list(
        await session.exec(
            select(Gateway.id, Gateway.name, Gateway.url).where(
                col(Gateway.id).in_(gateway_ids)
            )
        )
    )
    gateway_name_map: dict[UUID, str] = {row[0]: row[1] for row in gateway_meta_rows}
    gateway_url_map: dict[UUID, str] = {row[0]: row[2] for row in gateway_meta_rows}

    # 3. Task counts per agent (done / active)
    done_rows = list(
        await session.exec(
            select(Task.assigned_agent_id, sa_func.count().label("cnt"))
            .where(col(Task.assigned_agent_id).in_(agent_ids))
            .where(col(Task.status) == "done")
            .group_by(col(Task.assigned_agent_id))
        )
    )
    active_rows = list(
        await session.exec(
            select(Task.assigned_agent_id, sa_func.count().label("cnt"))
            .where(col(Task.assigned_agent_id).in_(agent_ids))
            .where(col(Task.status) == "in_progress")
            .group_by(col(Task.assigned_agent_id))
        )
    )
    done_map: dict[UUID, int] = {row[0]: int(row[1]) for row in done_rows if row[0]}
    active_map: dict[UUID, int] = {row[0]: int(row[1]) for row in active_rows if row[0]}

    # 4. Skills per gateway (join GatewayInstalledSkill → MarketplaceSkill)
    skill_rows = list(
        await session.exec(
            select(GatewayInstalledSkill.gateway_id, MarketplaceSkill.name)
            .join(
                MarketplaceSkill,
                col(GatewayInstalledSkill.skill_id) == col(MarketplaceSkill.id),
            )
            .where(col(GatewayInstalledSkill.gateway_id).in_(gateway_ids))
        )
    )
    gateway_skills_map: dict[UUID, list[str]] = {}
    for gw_id, skill_name in skill_rows:
        gateway_skills_map.setdefault(gw_id, []).append(skill_name)

    # 5. Recent activity events (last 5 per gateway, via agent_id membership)
    activity_rows = list(
        await session.exec(
            select(ActivityEvent)
            .where(col(ActivityEvent.agent_id).in_(agent_ids))
            .order_by(col(ActivityEvent.created_at).desc())
            .limit(50)
        )
    )
    agent_name_map: dict[UUID, str] = {a.id: a.name for a in agents}
    # group by gateway via agent_id → gateway_id lookup
    agent_gw_map: dict[UUID, UUID] = {a.id: a.gateway_id for a in agents}
    gw_activity_map: dict[UUID, list] = {}
    for ev in activity_rows:
        if ev.agent_id is None:
            continue
        gw_id = agent_gw_map.get(ev.agent_id)
        if gw_id is None:
            continue
        lst = gw_activity_map.setdefault(gw_id, [])
        if len(lst) < 5:
            lst.append(
                AgentActivityItem(
                    event_type=ev.event_type,
                    message=ev.message,
                    agent_name=agent_name_map.get(ev.agent_id),
                    created_at=ev.created_at,
                )
            )

    # 6. Group and assemble result
    gateway_agents: dict[UUID, list[_AgentRead]] = {}
    for agent in agents:
        gateway_agents.setdefault(agent.gateway_id, []).append(agent)

    result: list[AgentHubGatewayRead] = []
    for gw_id, gw_agents in gateway_agents.items():
        result.append(
            AgentHubGatewayRead(
                gateway_id=gw_id,
                gateway_name=gateway_name_map.get(gw_id, str(gw_id)),
                gateway_url=gateway_url_map.get(gw_id, ""),
                total_tasks_done=sum(done_map.get(a.id, 0) for a in gw_agents),
                total_tasks_active=sum(active_map.get(a.id, 0) for a in gw_agents),
                gateway_skills=gateway_skills_map.get(gw_id, []),
                recent_activity=gw_activity_map.get(gw_id, []),
                agents=gw_agents,
            )
        )

    return sorted(result, key=lambda g: g.gateway_name)


@router.get("/{agent_id}", response_model=AgentRead)
async def get_agent(
    agent_id: str,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> AgentRead:
    """Get a single agent by id."""
    service = AgentLifecycleService(session)
    return await service.get_agent(agent_id=agent_id, ctx=ctx)


@router.patch("/{agent_id}", response_model=AgentRead)
async def update_agent(
    agent_id: str,
    payload: AgentUpdate,
    params: _AgentUpdateParams = AGENT_UPDATE_PARAMS_DEP,
    session: AsyncSession = SESSION_DEP,
) -> AgentRead:
    """Update agent metadata and optionally reprovision."""
    service = AgentLifecycleService(session)
    return await service.update_agent(
        agent_id=agent_id,
        payload=payload,
        options=AgentUpdateOptions(
            force=params.force,
            user=params.auth.user,
            context=params.ctx,
        ),
    )


@router.post("/{agent_id}/heartbeat", response_model=AgentRead)
async def heartbeat_agent(
    agent_id: str,
    payload: AgentHeartbeat,
    session: AsyncSession = SESSION_DEP,
    actor: ActorContext = ACTOR_DEP,
) -> AgentRead:
    """Record a heartbeat for a specific agent."""
    service = AgentLifecycleService(session)
    return await service.heartbeat_agent(agent_id=agent_id, payload=payload, actor=actor)


@router.post("/heartbeat", response_model=AgentRead)
async def heartbeat_or_create_agent(
    payload: AgentHeartbeatCreate,
    session: AsyncSession = SESSION_DEP,
    actor: ActorContext = ACTOR_DEP,
) -> AgentRead:
    """Heartbeat an existing agent or create/provision one if needed."""
    service = AgentLifecycleService(session)
    return await service.heartbeat_or_create_agent(payload=payload, actor=actor)


@router.delete("/{agent_id}", response_model=OkResponse)
async def delete_agent(
    agent_id: str,
    session: AsyncSession = SESSION_DEP,
    ctx: OrganizationContext = ORG_ADMIN_DEP,
) -> OkResponse:
    """Delete an agent and clean related task state."""
    service = AgentLifecycleService(session)
    return await service.delete_agent(agent_id=agent_id, ctx=ctx)
