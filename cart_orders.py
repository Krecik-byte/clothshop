from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import CartItemCreate, CartItemRemove
from auth_utils import get_current_user_id

router = APIRouter(tags=["cart_orders"])

@router.put("/cart/add")
def add_to_cart(item: CartItemCreate, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        # 1. Pobranie nazwy produktu
        cur.execute("SELECT name FROM products WHERE product_id = %s", (item.product_id,))
        res = cur.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Produkt nie istnieje")
        p_name = res["name"]

        # 2. Szukanie aktywnego zamówienia
        cur.execute("SELECT order_id FROM orders WHERE user_id = %s AND status = 'Pending';", (user_id,))
        active_order = cur.fetchone()
        
        if not active_order:
            cur.execute("INSERT INTO orders (user_id, total_amount, status) VALUES (%s, 0.00, 'Pending') RETURNING order_id;", (user_id,))
            order_id = cur.fetchone()["order_id"]
        else:
            order_id = active_order["order_id"]

        # 3. Dodawanie/Aktualizacja w koszyku
        cur.execute("""
            INSERT INTO cart (order_id, product_id, size_name, quantity, name) 
            VALUES (%s, %s, %s, %s, %s) 
            ON CONFLICT (order_id, product_id, size_name) 
            DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
        """, (order_id, item.product_id, item.size_name, item.quantity, p_name))

        conn.commit()
        return {"message": "Success", "order_id": order_id}
    except Exception as e:
        conn.rollback()
        print(f"BŁĄD SQL: {e}") 
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.delete("/cart/remove")
def remove_from_cart(item: CartItemRemove, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT order_id FROM orders WHERE user_id = %s AND status = 'Pending';", (user_id,))
        order = cur.fetchone()
        if not order: 
            raise HTTPException(status_code=404, detail="Nie znaleziono koszyka")
            
        cur.execute("DELETE FROM cart WHERE order_id = %s AND product_id = %s AND size_name = %s", 
                    (order["order_id"], item.product_id, item.size_name))
        
        conn.commit()
        return {"message": "Removed from cart"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/cart")
def get_cart(user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 
                c.product_id, 
                p.name, 
                p.price, 
                c.size_name, 
                c.quantity
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            JOIN orders o ON c.order_id = o.order_id
            WHERE o.user_id = %s AND o.status = 'Pending';
        """, (user_id,))
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@router.patch("/checkout")
def checkout(user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        # 1. Szukamy aktywnego koszyka (status 'Pending')
        cur.execute("SELECT order_id FROM orders WHERE user_id = %s AND status = 'Pending';", (user_id,))
        order = cur.fetchone()
        if not order: 
            raise HTTPException(status_code=404, detail="Brak aktywnego koszyka")
        
        order_id = order["order_id"]

        # 2. Pobieramy produkty z koszyka
        cur.execute("SELECT product_id, size_name, quantity FROM cart WHERE order_id = %s", (order_id,))
        items = cur.fetchall()

        if not items:
            raise HTTPException(status_code=400, detail="Koszyk jest pusty")

        # 3. Sprawdzamy stan magazynowy i aktualizujemy
        for item in items:
            # Dodano rzutowanie ::product_size, aby SQL zrozumiał Twój typ danych
            cur.execute("""
                SELECT stock FROM product_sizes 
                WHERE product_id = %s AND size_name = %s::product_size 
                FOR UPDATE
            """, (item['product_id'], item['size_name']))
            
            res = cur.fetchone()
            
            if not res:
                raise Exception(f"Produkt lub rozmiar {item['size_name']} nie istnieje w magazynie")
            
            if res['stock'] < item['quantity']:
                raise Exception(f"Brak wystarczającej ilości towaru: {item['size_name']} (Dostępne: {res['stock']})")

            # Odejmujemy ze stanu (tutaj również dodano ::product_size)
            cur.execute("""
                UPDATE product_sizes 
                SET stock = stock - %s 
                WHERE product_id = %s AND size_name = %s::product_size
            """, (item['quantity'], item['product_id'], item['size_name']))

        # 4. Finalizacja zamówienia: obliczenie sumy, zmiana statusu i daty
        cur.execute("""
            UPDATE orders 
            SET total_amount = (
                SELECT SUM(c.quantity * p.price) 
                FROM cart c 
                JOIN products p ON c.product_id = p.product_id 
                WHERE c.order_id = %s
            ),
            status = 'Paid', 
            order_date = CURRENT_TIMESTAMP 
            WHERE order_id = %s;
        """, (order_id, order_id))
        
        conn.commit()
        return {"message": "Order completed successfully", "order_id": order_id}

    except Exception as e:
        conn.rollback()
        # Wyświetlamy błąd w terminalu dla Ciebie
        print(f"BŁĄD CHECKOUT: {str(e)}")
        # Zmieniamy status na 400, aby frontend mógł wyświetlić komunikat
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/orders/{order_id}/status")
def get_order_status(order_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT status, total_amount, order_date FROM orders WHERE order_id = %s AND user_id = %s;", (order_id, user_id))
        order = cur.fetchone()
        if not order: raise HTTPException(status_code=404)
        return order
    finally:
        cur.close()
        conn.close()

@router.get("/orders/history")
def get_order_history(user_id: int = Depends(get_current_user_id)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 
                o.order_id, 
                o.total_amount, 
                o.status, 
                o.order_date,
                json_agg(json_build_object(
                    'name', c.name, 
                    'quantity', c.quantity, 
                    'size', c.size_name
                )) as items
            FROM orders o
            JOIN cart c ON o.order_id = c.order_id
            WHERE o.user_id = %s AND o.status != 'Pending'  -- ZMIANA TUTAJ
            GROUP BY o.order_id
            ORDER BY o.order_date DESC;
        """, (user_id,))
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@router.get("/admin/orders")
def get_orders(user_id: int = Depends(get_current_user_id)):
    # Tutaj warto dodać sprawdzenie czy email == Twój admin email
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 
                o.order_id, 
                u.email, 
                o.total_amount, 
                o.status, 
                o.order_date,
                json_agg(json_build_object(
                    'name', c.name, 
                    'quantity', c.quantity, 
                    'size', c.size_name
                )) as items
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN cart c ON o.order_id = c.order_id
            WHERE o.status != 'Pending'
            GROUP BY o.order_id, u.email
            ORDER BY o.order_date DESC;
        """)
        return cur.fetchall()
    finally:
        conn.close()

@router.patch("/admin/orders/{order_id}/status")
def update_order_status_admin(order_id: int, new_status: str):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE orders SET status = %s WHERE order_id = %s", (new_status, order_id))
        conn.commit()
        return {"message": "Status updated"}
    finally:
        cur.close()
        conn.close()