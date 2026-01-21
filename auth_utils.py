import os
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import get_db

JWT_SECRET = os.getenv("JWT_SECRET") or "TWOJ_SEKRETNY_KLUCZ_JWT"
JWT_ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None: raise JWTError
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Nieprawidlowy token (brak dostepu)")

    ADMIN_EMAIL = "DAWID@SPOKO.PL"

def verify_admin(user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        # Pobieramy email użytkownika na podstawie ID z tokena
        cur.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Użytkownik nie istnieje"
            )

        # Kluczowe sprawdzenie: czy e-mail to e-mail admina
        if user['email'].upper() != ADMIN_EMAIL.upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Brak uprawnień administratora. Dostęp zabroniony."
            )
            
        return user_id # Zwracamy ID, jeśli wszystko jest OK
    finally:
        cur.close()
        conn.close()

def get_user_by_email(identifier: str):
    conn = get_db()
    cur = conn.cursor()
    try:
        # Poprawiłem zapytanie, żeby szukało po emailu LUB loginie
        cur.execute("""
            SELECT u.user_id, u.username, u.email, p.password 
            FROM users u
            JOIN passwords p ON u.user_id = p.user_id
            WHERE u.email = %s OR u.username = %s;
        """, (identifier, identifier))
        user = cur.fetchone()
        return user
    except Exception as e:
        print(f"Błąd bazy w get_user_by_email: {e}")
        return None
    finally:
        cur.close()
        conn.close() # TO TERAZ WYKONA SIĘ ZAWSZE