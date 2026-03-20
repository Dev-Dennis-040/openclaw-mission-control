# OpenClaw Mission Control - Project Status

## Actuele Status
- **Fase**: Voltooid
- **Laatste update**: Mission Control is live op `mc.devdennis.com`. Gateways zijn intern gekoppeld via het Traefik netwerk. Git is geïnstalleerd op de VPS backend om externe GitHub Git repositories in de Skills Marketplace in te kunnen laden (zoals `VoltAgent/awesome-openclaw-skills`). Het probleem met Nova's `permission denied` foutmeldingen is geïdentificeerd als een bewuste architectuurkeuze (Docker-sandbox) en opgelost door *geen* bash-hacks te gebruiken, maar uitsluitend officiële Web Scraper (en soortgelijke) Skills via de marketplace toe te wijzen.
- **Doel**: Remote OpenClaw gateways koppelen aan Mission Control en configuratie stroomlijnen. Alles is succesvol ingeregeld, inclusief het uitbreiden van skills en respecteren van de agent sandbox.

## Openstaande Taken
- [x] Onderzoek naar `abhi1693/openclaw-mission-control` uitvoeren.
- [x] Architectuur/configuratie plan schrijven in `architecture.md`.
- [x] Vraag goedkeuring aan de gebruiker.
- [x] Installatie op VPS (Door andere agent / gebruiker).
- [x] Onderzoek hoe we OpenClaw Gateways in Mission Control registreren (API vs UI).
- [x] API keys per gateway verzamelen.
- [x] Gateways in Mission Control aanmaken en verbinding testen (Afgewerkt via intern VPS netwerk).

## 2026-03-16 Update
- Fixed downtime issue: `mc.devdennis.com` was returning a 404 because the `mission-control` container pulling from ghcr.io was stopped.
- Added identity_template, soul_template, provider, and model configurations to the Agent Edit form frontend.
- Routed Traefik proxy traffic to the source code container (`mission-control-src`) instead of the pre-built Github image so that custom repository modifications go live immediately.
- Added automation scripts to the VPS (`/root/openclaw-saas/instances/update-gateways.sh` and `update-mission-control.sh`) to effortlessly update `.env` versions, download new images, and restart containers without manual intervention.

## 2026-03-18 Update
- **Billing Security Fix**: Identified and resolved a massive billing issue (e.g. Google Cloud Vertex AI / OpenAI) caused by background agents stuck in an infinite `MEMORY.md` token loop.
- **Enforced Prepaid Usage**: Removed all `OPENAI_API_KEY` and `GEMINI_API_KEY` values from all OpenClaw instances (`zakelijk`, `prive`, `tess`) on the VPS. This forces Mission Control and all agents to gracefully fail on OpenRouter's prepaid model (`OPENROUTER_API_KEY`) if funds run out, entirely preventing unexpected €100+ end-of-month backend provider bills.
- **Corrupted Memory Cleared**: Emptied corrupted `/data/MEMORY.md` files for stuck agents to break active processing loops and restarted their respective containers.
