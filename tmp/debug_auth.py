from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

try:
    password = "password123"
    hashed = hash_password(password)
    print(f"Hashed: {hashed}")
    verified = verify_password(password, hashed)
    print(f"Verified: {verified}")
except Exception as e:
    print(f"Error: {e}")
