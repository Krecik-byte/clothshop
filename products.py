from fastapi import APIRouter, HTTPException, Depends, Query, Form, UploadFile, File
from typing import List, Optional
from database import get_db
from schemas import Product
from auth_utils import get_current_user_id
# Importujemy dokładnie to, co mamy w image_service.py
from image_service import save_product_image, delete_product_image 

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[Product])
def read_products(limit: int = 20, offset: int = 0):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT p.product_id, p.name, p.price, p.category,
                   COALESCE(json_agg(json_build_object('size', ps.size_name, 'stock', ps.stock)) 
                   FILTER (WHERE ps.size_name IS NOT NULL), '[]') as sizes
            FROM products p 
            LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
            GROUP BY p.product_id
            ORDER BY p.product_id DESC
            LIMIT %s OFFSET %s;
        """, (limit, offset))
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@router.get("/search")
def search_products(q: str = "", limit: int = 12, offset: int = 0, categories: Optional[str] = None, 
                    min_price: float = 0, max_price: float = 1000000, sort: str = "relevance"):
    conn = get_db()
    cur = conn.cursor()
    clean_q = q.strip()
    pattern_start, pattern_space = f"{clean_q}%", f"% {clean_q}%"
    sql = """
        SELECT p.product_id, p.name, p.price, p.category,
               COALESCE(json_agg(json_build_object('size', ps.size_name, 'stock', ps.stock)) 
               FILTER (WHERE ps.size_name IS NOT NULL), '[]') as sizes
        FROM products p 
        LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
        WHERE (p.name ILIKE %s OR p.name ILIKE %s OR p.category::TEXT ILIKE %s OR p.category::TEXT ILIKE %s)
        AND p.price >= %s AND p.price <= %s
    """
    params = [pattern_start, pattern_space, pattern_start, pattern_space, min_price, max_price]
    if categories:
        sql += " AND p.category::TEXT = ANY(%s)"
        params.append(categories.split(','))
    sql += " GROUP BY p.product_id"
    if sort == "low": sql += " ORDER BY p.price ASC"
    elif sort == "high": sql += " ORDER BY p.price DESC"
    else: sql += " ORDER BY p.product_id DESC"
    sql += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    try:
        cur.execute(sql, params)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@router.post("")
async def create_product(
    name: str = Form(...), 
    price: float = Form(...), 
    category: str = Form(...), 
    file: UploadFile = File(None), 
    user_id: int = Depends(get_current_user_id)
):
    conn = get_db()
    cur = conn.cursor()
    try:
        # 1. Dodawanie głównego produktu
        cur.execute(
            "INSERT INTO products (name, price, category) VALUES (%s, %s, %s) RETURNING product_id", 
            (name, price, category)
        )
        product_id = cur.fetchone()["product_id"]
        
        # 2. Inicjalizacja rozmiarów (żeby stock od razu działał)
        # Pobieramy ENUM z bazy, żeby nie było błędów
        sizes = ['S', 'M', 'L', 'XL']
        if category == 'ACCESSORIES':
            sizes = ['ONESIZE']

        for size in sizes:
            cur.execute(
                "INSERT INTO product_sizes (product_id, size_name, stock) VALUES (%s, %s, 0)",
                (product_id, size)
            )
        
        # 3. Obsługa zdjęcia
        if file:
            save_product_image(product_id, file)
            
        # KLUCZOWE: Tutaj kończymy transakcję i zdejmujemy blokady
        conn.commit() 
        
        return {"product_id": product_id, "name": name}

    except Exception as e:
        conn.rollback() # Jeśli coś padnie (np. błąd ENUM), wycofaj wszystko
        print(f"BŁĄD DODAWANIA: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close() # Uwalniamy połączenie dla innych (np. dla GET /products)

@router.patch("/{product_id}")
def update_product(product_id: int, data: dict, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE products SET price = %s WHERE product_id = %s", (data['price'], product_id))
        conn.commit()
        return {"message": "Price updated"}
    finally:
        cur.close()
        conn.close()

@router.patch("/{product_id}/stock")
def update_stock(product_id: int, data: dict, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE product_sizes SET stock = %s WHERE product_id = %s AND size_name = %s", (data['quantity'], product_id, data['size']))
        conn.commit()
        return {"message": "Stock updated"}
    finally:
        cur.close()
        conn.close()

@router.get("/{product_id}")
def read_product(product_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT p.product_id, p.name, p.price, p.category,
                   COALESCE(json_agg(json_build_object('size', ps.size_name, 'stock', ps.stock)) 
                   FILTER (WHERE ps.size_name IS NOT NULL), '[]') as sizes
            FROM products p 
            LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
            WHERE p.product_id = %s
            GROUP BY p.product_id;
        """, (product_id,))
        
        product = cur.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    finally:
        cur.close()
        conn.close()

@router.delete("/{product_id}")
def delete_product(product_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM product_sizes WHERE product_id = %s", (product_id,))
        cur.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
        
        # Wywołanie serwisu
        delete_product_image(product_id)
        
        conn.commit()
        return {"message": "Deleted"}
    finally:
        cur.close()
        conn.close()