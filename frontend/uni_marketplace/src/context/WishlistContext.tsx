import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { extractErrorMessage } from '../utils/errorMessage'
import * as wishlistService from '../services/wishlistService'
import type { WishlistItem } from '../services/wishlistService'

interface WishlistContextValue {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
  isWishlisted: (productId: number) => boolean
  addToWishlist: (productId: number) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!user) {
      setItems([])
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const fetched = await wishlistService.listWishlist()
      setItems(fetched)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load your wishlist. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  function isWishlisted(productId: number): boolean {
    return items.some((item) => item.product.id === productId)
  }

  async function addToWishlist(productId: number) {
    const created = await wishlistService.addToWishlist(productId)
    setItems((previous) =>
      previous.some((item) => item.product.id === productId) ? previous : [created, ...previous],
    )
  }

  async function removeFromWishlist(productId: number) {
    await wishlistService.removeFromWishlist(productId)
    setItems((previous) => previous.filter((item) => item.product.id !== productId))
  }

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, error, isWishlisted, addToWishlist, removeFromWishlist, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
