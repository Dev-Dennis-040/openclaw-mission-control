# 504 Gateway Timeout on VPS (Next.js SSR NAT Loopback)

**Issue**: You deploy the Mission Control panel to a VPS using Docker, but the frontend (`mc.devdennis.com`) hangs for 60 seconds and then returns a **`504 Gateway Timeout`**. However, accessing the backend API directly works, and the frontend container shows no errors.

## Root Cause
When Next.js performs Server-Side Rendering (SSR) for initial page loads (or Server Actions), it queries the API. If `NEXT_PUBLIC_API_URL` is configured to the public domain (`https://mc.devdennis.com`), the container attempts to resolve its own public IP.
Many VPS providers and default Docker bridged network iptables block **NAT loopback / hair-pinning**, dropping the requests. The Next.js SSR hangs waiting for a response that will never arrive, causing the reverse proxy (Traefik) to present a 504 Timeout.

## Solution

We have introduced an `INTERNAL_API_URL` environment variable check specifically for the Next.js API client wrapper (`src/lib/api-base.ts` and `src/api/mutator.ts`). 

1. By default, the `frontend/Dockerfile` exports `INTERNAL_API_URL=http://backend:8000`.
2. When the server tries to make an API request during SSR, it seamlessly bypasses the public DNS and talks directly to the backend container over the internal Docker network.
3. The browser still uses `NEXT_PUBLIC_API_URL` on the client side.

If you ever rebuild or modify the frontend networking, make sure the `INTERNAL_API_URL` variable correctly resolves to the API container (`http://backend:8000`), or the 504 Gateway Timeout loopback issue will reoccur.

### Traefik Cache Warning
**Important**: If you rebuild the `frontend` container (`docker compose build frontend && docker compose up -d frontend`), its internal IP address on the `traefik-net` bridge may change. Traefik might cache the old dead IP, meaning the 504 Gateway Timeout will persist even after fixing the code!

If the frontend works locally (`docker compose exec frontend wget -qO- http://localhost:3000`) but still 504s via Traefik, **restart Traefik**:
```bash
docker restart root-traefik-1 # (Or whatever your Traefik container is named)
```
