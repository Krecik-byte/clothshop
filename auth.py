from fastapi import APIRouter, HTTPException, Form, Depends
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from database import get_db
from auth_utils import get_user_by_email, create_access_token, get_current_user_id

router = APIRouter(tags=["auth"])

@router.post("/signup")
def signup(username: str = Form(...), email: str = Form(...), password: str = Form(...)):
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="Wszystkie pola musza byc wypelnione.")
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM users WHERE email=%s OR username=%s", (email, username))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email lub nazwa uzytkownika sa zajete")

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    try:
        cur.execute("INSERT INTO users (username, email) VALUES (%s, %s) RETURNING user_id, username, email", (username, email))
        new_user = cur.fetchone()
        cur.execute("INSERT INTO passwords (user_id, password) VALUES (%s, %s)", (new_user["user_id"], hashed_pw))
        conn.commit()
        return new_user
    finally:
        conn.close()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form_data.username) 
    if not user or not bcrypt.checkpw(form_data.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Nieprawidlowe dane logowania")
    token = create_access_token({"user_id": user["user_id"], "username": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT user_id, username, email FROM users WHERE user_id=%s", (user_id,))
    user = cur.fetchone()
    conn.close()
    return user