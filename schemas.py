from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# --- ROZMIARY ---
class SizeInfo(BaseModel):
    size: str
    stock: int

# --- PRODUKT ---
class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    price: float = Field(..., gt=0)
    # ZMIANA: Z List[str] na str, bo teraz to jedna kategoria tekstowa
    category: Optional[str] = None 

class ProductCreate(BaseModel): 
    name: str
    price: float
    category: str # React wyśle to jako pojedynczy tekst

class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    product_id: int
    sizes: List[SizeInfo]

# --- AKTUALIZACJA STOCKU ---
class StockUpdate(BaseModel):
    size: str
    quantity: int

# --- KOSZYK ---
class CartItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    size_name: str = Field(...)
    quantity: int = Field(..., gt=0)

class CartItemRemove(BaseModel):
    product_id: int = Field(..., gt=0)
    size_name: str = Field(...)