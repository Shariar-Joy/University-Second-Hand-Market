import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface CartItem {
  productId: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalCount: number
}

const STORAGE_KEY = 'campus-exchange-cart'

const CartContext = createContext<CartContextValue | undefined>(undefined)

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(productId: string) {
    setItems((previous) => {
      const existing = previous.find((item) => item.productId === productId)
      if (existing) {
        return previous.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...previous, { productId, quantity: 1 }]
    })
  }

  function removeItem(productId: string) {
    setItems((previous) => previous.filter((item) => item.productId !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((previous) =>
      previous.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item)),
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
