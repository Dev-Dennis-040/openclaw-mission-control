import sys
import json
import psycopg
conn = psycopg.connect("postgresql://postgres:postgres@localhost:5432/mission_control")
cursor = conn.cursor()
cursor.execute("SELECT id, cronjobs_config FROM agents WHERE id = 'mc-gateway-41f03aac-5669-4e1b-9fe8-cae9ed1417be'")
row = cursor.fetchone()
print(json.dumps(row[1], indent=2) if row else "Agent not found")
