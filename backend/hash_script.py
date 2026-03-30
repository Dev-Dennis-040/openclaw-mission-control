import bcrypt
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(b'D3vD3nn!s2026', salt)
print(hashed.decode('utf-8'))
