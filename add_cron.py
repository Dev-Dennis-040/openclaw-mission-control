import json

with open("openclaw-nova-fix.json", "r") as f:
    config = json.load(f)

for agent in config["agents"]["list"]:
    if agent["id"] == "mc-gateway-41f03aac-5669-4e1b-9fe8-cae9ed1417be":
        # Add cron job block based on OpenClaw typical config
        if "cron" not in agent:
            agent["cron"] = {}
        
        agent["cron"]["Morning brief"] = {
            "schedule": "0 20 * * 4",
            "message": "Het is donderdagavond 20:00! Gebruik je exec tool om het kse_scraper.py script aan te roepen, analyseer het nieuwe ouderportaal nieuws dat eruit komt, en post een aparte wekelijkse samenvatting voor zowel Dane als Rain in onze documenten.",
            "enabled": True
        }
        
with open("openclaw-nova-fix.json", "w") as f:
    json.dump(config, f, indent=4)
