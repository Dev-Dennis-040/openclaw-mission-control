# OpenClaw Skills Ecosysteem & Capabilities

Dit document bevat de analyse en mogelijkheden rondom het uitbreiden van OpenClaw met **Vision** en **Browser Automatisering**.

## 1. Native Browser-sturing (CDP)
OpenClaw is fundamenteel gebouwd voor webautomatisering. In plaats van te leunen op visuele herkenning (screenshots) van het scherm:
- **Chrome DevTools Protocol (CDP):** OpenClaw stuurt de browser-engine direct aan via de code/DOM van de pagina.
- Hierdoor kan het razendsnel en betrouwbaar formulieren invullen, data scrapen, en knoppen indrukken.
- Dit maakt OpenClaw veel krachtiger voor automatisering dan een simpele llm-chat; het is een proactieve *automation executor*.

## 2. De community: `awesome-openclaw-skills` (VoltAgent)
Er bestaat een onmisbare bron voor OpenClaw vaardigheden:
- **Repository:** `github.com/VoltAgent/awesome-openclaw-skills` (oorspronkelijk Clawdbot / Moltbot).
- **Inhoud:** Een gecureerde lijst van meer dan **5.400 geverifieerde community-skills** afkomstig van ClawHub (de openbare skills registry met >13.000 items).
- **Nut:** In de plaats van zelf complexe Python-scripts (CDP aansturing) te schrijven, kunnen we hier kant-en-klare skills plukken voor browser navigatie, formulier interactie, scraping, etc.

## 3. Vision Capabilities ("Ogen")
Omdat OpenClaw 'headless' in onze SaaS-infrastructuur (via VPS/Docker) draait, heeft het zelf geen fysiek scherm om naar te kijken. 
Er zijn echter twee patronen om Vision-mogelijkheden te integreren:
1. **VisionClaw Integratie:** OpenClaw koppelen met een multimodale API zoals Gemini 1.5 Pro. Hier fungeert OpenClaw als de "handen" voor computergebruik, en Gemini als het model dat ingestuurde afbeeldingen begrijpt.
2. **De "Photo Flow" Webhook Bypass:** In plaats van afbeeldingen naar de browser-engine te pushen, vangen we afbeeldingen af in de backend (bijv. via n8n of Telegram). De afbeelding wordt direct naar Gemini-Vision gestuurd. Het resultaat (bijv. "dit is een rommelige kamer met speelgoed") wordt vervolgens als tekst/context aan de OpenClaw Agent (bijv. Nova) gevoed, zodat die haar planningswerk kan doen.

## 4. Specifieke Use-Cases: School & BSO Apps
Voor de integratie van informatie van de basisschool (De Rietpluim) en de BSO (Kids Society Erica) naar de Notion Family Timeline hanteren we een tweetraps aanpak, gebaseerd op de technische beperkingen van de platforms:

### Spoor 1: De School (Parentcom) - E-mail Interceptie
- **Systeem:** Parentcom (`noreply@parentcom.nl`).
- **Probleem:** Het Parentcom ouderportaal is exclusief via mobiele iOS/Android apps te raadplegen. Het webportaal (`cms.parentcom.nl`) is uitsluitend voor docenten/beheerders. CDP integratie is hier onmogelijk.
- **Oplossing:** Parentcom stuurt nieuwsbrieven ('Informatie Kerstweek' etc.) via e-mail. We integreren een Nova n8n-workflow die deze e-mails uitleest met een LLM (bijv. Gemini), de belangrijke afspraken/data extraheert, en deze direct naar de Notion Family Planner pusht.

### Spoor 2: De BSO (Konnect / Ovivio) - OpenClaw CDP Web Scraper
- **Systeem:** Konnect OuderApp (`https://kse.ouderportaal.nl/`).
- **Probleem:** Geen publieke of bruikbare open API beschikbaar voor het direct extraheren van planning/nieuws.
- **Oplossing:** Het betreft een Angular web-applicatie (waarbij Javascript renduering nodig is voordat content laadt). Dit is dé perfecte use-case voor **OpenClaw's CDP**. We schrijven een *OpenClaw scraper skill* waarbij Nova (periodiek) een onzichtbare Chromium sessie start, inlogt op het Konnect webportaal, het rooster/nieuws uitleest uit de DOM, en deze data naar Notion pusht.

## 5. Conclusie & Actionables
Om de agents te upgraden hoeven we het wiel niet opnieuw uit te vinden.
- Voordat we een agent (Max, Tess, Nova) een nieuwe functie willen geven op de browser of pc, checken we eerst de `awesome-openclaw-skills` repo.
- We sturen aan op de native CDP integratie van de container zelf voor betrouwbare webacties, tenzij er een hardware/app-vergrendeling is (zoals bij Parentcom), waarvoor we e-mail forwarding of n8n webhooks inzetten.

## 6. ClawTeam Integratie (Agent Swarm Intelligence)
Naast de standaard OpenClaw browser- en CLI-skills, is het systeem nu uitgebreid met support voor de **HKUDS/ClawTeam** repository (Agent Swarm Intelligence). 
- **Setup:** De `clawteam` applicatie is native geïnstalleerd via `pip install clawteam --break-system-packages` binnen de Docker containers van de agents (zoals `openclaw_prive` en `openclaw_zakelijk`).
- **Dependencies:** De agents hebben de beschikking over `git` en `tmux` voor workspace isolatie op de achtergrond.
- **Uitvoering:** Max en andere gespecificeerde OpenClaw agents hebben toegang tot de `execute-cli-skill`. Via een override in hun System Templates / Tools configuration in de database, zijn zij geïnstrueerd dat ze toegang hebben tot de CLI tool.
- **Use-cases:** Dit stelt een individuele "Manager" agent in staat om via commando's (bijv. `clawteam spawn` of `clawteam launch`) zelfstanding, op de achtergrond, nieuwe sub-agents of heuse *virtual teams* en *committees* te initialiseren en aan te sturen. Alles wordt gecoördineerd via je eigen OpenClaw dashboard / chat interface.

## 7. Use-Case: Autonomous SaaS Management (Oplevertool App)
Om The Swarm / OpenClaw in te zetten als de proactieve Lead Developer & QA Tester voor je SaaS (Oplevertool), hanteren we een gestructureerde fundering. *Let op: de Oplevertool website/marketing repo is in het verleden al succesvol gekoppeld en voorzien van GitHub issues. De focus ligt nu 100% op de Oplevertool App zélf.*

### De Fundering (Stap-voor-stap)
1. **GitHub Koppeling & Workspace Setup**
   - De AI-agent (Max/Sherlock) configureert de GitHub CLI (`gh`) lokaal op de VPS-workspace via een Personal Access Token (PAT).
   - De Oplevertool App repository wordt lokaal gecloned. Hierdoor kan de agent via de command-line statische bestanden lezen (bijv. React/Next.js componenten) en de structuur doorgronden.
2. **"Ogen" op de App (Live Auditing)**
   - De agent krijgt een test-account voor de live app (`app.oplevertool.nl`).
   - Via OpenClaw's native **Browser / CDP Skill** (of via Playwright in de terminal) logt de agent in op de live applicatie. De agent navigeert, klikt, zoekt naar verwarrende UX-flows, en leest console/DOM errors uit tijdens het gebruik.
3. **Beheer & Optimalisatie via ClawTeam**
   - Max spawnt een sub-team via de SDK (`clawteam spawn`).
   - De *QA Tester Agent* analyseert de bevindingen uit de browser.
   - De *Code Reviewer Agent* zoekt in de lokale GitHub codebase naar de oorzaak van de trage of onlogische flow.
   - Het team genereert autonoom GitHub Issues via de `gh` cli in de Oplevertool App repo met labels zoals "bug" of "enhancement" inclusief aanbevelingen, zodat het menselijke dev-team (wij) hiermee aan de slag kan.
