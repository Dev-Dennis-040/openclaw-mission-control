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

## 4. Agent Sandbox & Capabilities
OpenClaw agents draaien uit veiligheidsoverwegingen binnen een sterk afgeschermde Docker-sandbox. 
- **Restricties:** Sinds een recente beveiligingspatch (ter voorkoming van RCE's zoals CVE-2026-25253) staat de `tools.exec.host` configuratie standaard op `sandbox`. Hierdoor heeft de agent expliciet **geen permissies** om host binaries (zoals `curl`, `node`, `jq`) via een terminal direct uit te voeren. Commando's stuiten op `Command not executable (permission denied)`.
- **Mission Control Conflict:** Het Mission Control panel (de `BOARD_TOOLS.md.j2` template) instrueert de agents standaard nog steeds om `curl` en `jq` te gebruiken om de OpenAPI specificatie (`openapi.json`) op te halen om met de backend te communiceren. Omdat deze tools geblokkeerd zijn, faalt deze communicatie.
- **Architectuur Beslissing:** Probeer dit *niet* op te lossen met terminal hacks, bash scripts via `source /dev/tcp`, of door de sandbox uit te schakelen. De agent wordt geacht te communiceren en acties uit te voeren via gecontroleerde, officiële **AgentSkills**.
- **Oplossing:** Voeg een specifieke HTTP/API-Skill (bijv. een "REST API plugin") toe via de Mission Control Skills Marketplace en wijs deze toe aan de agent. Eerder hebben we dit al gedaan voor externe web-interacties via de "Web Scraper" skill. Zodra de agent een HTTP/API-skill heeft, kan hij de interne Mission Control API weer netjes bereiken.

## 5. Agent Live Progress
Naast de standaard heartbeat status in de database (`status`), ondersteunen de OpenClaw agents een `current_task_info` payload (JSON). Agents en webhooks (bijv. via n8n) kunnen de API endpoint aanroepen met updates (bijv. `{"task": "Scraping", "progress_pct": 50, "eta": "2m"}`) om live voortgangsbalken over de hele OpenClaw interface aan te sturen zonder webhook payload overhead.

## 6. Test en Verificatie Procedure
- **Docker Stack**: Controleer of alle containers correct opstarten (`frontend`, `backend`, `db`).
- **Health check**: Bezoek `http://localhost:8000/healthz`.
- **UI Access**: Log in op `http://localhost:3000` met het `LOCAL_AUTH_TOKEN`.
- **Gateway Binding**: Controleer of de remote gateway (IP 31.97.125.75) gekoppeld kan worden en status 'Connected' aangeeft onder 'Gateways'.
