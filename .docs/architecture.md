# OpenClaw Mission Control - Architecture

# OpenClaw Mission Control - Architecture

## 1. Technologische Basis
OpenClaw Mission Control is een AI Agent Orchestration Dashboard met een Next.js frontend en een bijbehorende backend (FastAPI/Python) en een PostgreSQL database. Het platform wordt beheerd via Docker Compose.

## 2. Remote VPS Installatie
Mission Control is geïnstalleerd via Docker Compose op de remote VPS (`/root/openclaw-saas/instances/mission-control-src/`) achter Traefik.
- **Frontend url:** `https://mc.devdennis.com`
- **Installatie:** Maakt gebruik van de pre-built image `ghcr.io/abhi1693/openclaw-mission-control:latest`.
- **Backend API:** Gekoppeld aan de frontend via Traefik.
- **Authenticatie:** `AUTH_MODE=local` ingesteld via `.env`.

## 3. Remote Gateway Connectie (VPS)
We configureren de remote gateways via de backend API of de Mission Control interface.
- **Privé Omgeving**: `https://prive.devdennis.com`
- **Zakelijk Omgeving**: `https://zakelijk.devdennis.com`
- **Tess Omgeving**: `https://tess.devdennis.com`

Om deze omgevingen succesvol te koppelen aan Mission Control hebben we voor elke Gateway de HTTP endpoint nodig en de ingestelde API Key (Bearer token). In de volgende stap zullen we de configuratie uitvoeren, waarschijnlijk via de REST API van Mission Control of een script op de VPS.

## 4. Test en Verificatie Procedure
- **Docker Stack**: Controleer of alle containers correct opstarten (`frontend`, `backend`, `db`).
- **Health check**: Bezoek `http://localhost:8000/healthz`.
- **UI Access**: Log in op `http://localhost:3000` met het `LOCAL_AUTH_TOKEN`.
- **Gateway Binding**: Controleer of de remote gateway (IP 31.97.125.75) gekoppeld kan worden en status 'Connected' aangeeft onder 'Gateways'.
