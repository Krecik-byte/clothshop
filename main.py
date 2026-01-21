from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import traceback

# Importy routerow
from auth import router as auth_router
from products import router as products_router
from cart_orders import router as cart_router

app = FastAPI()

# --- AUTOMATYCZNE TWORZENIE FOLDERÓW ---
# Musisz mieć te foldery, inaczej app.mount wywali błąd
if not os.path.exists("static/uploads"):
    os.makedirs("static/uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Udostępnianie plików statycznych (zdjęć produktów)
# Teraz zdjęcia są pod adresem: http://127.0.0.1:8001/static/uploads/ID.jpg
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rejestracja routerow
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(cart_router)

# Endpoint testowy, żebyś wiedział, że backend żyje
@app.get("/")
def home():
    return {"status": "WSN STUDIO API IS RUNNING"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)