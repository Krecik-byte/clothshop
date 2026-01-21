import psycopg2
import os
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_db():
    conn = psycopg2.connect(
        host="localhost",
        database="shop",
        user="admsl",
        password="bajojajo1",
        port=5432,
        cursor_factory=RealDictCursor
    )
    conn.autocommit = True
    return conn