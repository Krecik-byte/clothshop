import os
import shutil
from fastapi import UploadFile

# Folder gdzie beda foty
UPLOAD_DIR = "static/uploads"

# Tworzy folder jesli go nie ma
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_product_image(product_id: int, file: UploadFile):
    if not file:
        return None
    
    # Sciezka: static/uploads/5.jpg
    file_path = os.path.join(UPLOAD_DIR, f"{product_id}.jpg")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path

def delete_product_image(product_id: int):
    file_path = os.path.join(UPLOAD_DIR, f"{product_id}.jpg")
    if os.path.exists(file_path):
        os.remove(file_path)