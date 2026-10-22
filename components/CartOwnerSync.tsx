"use client"
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { GUEST, useCartStore } from '@/store'

// Shows the cart of whoever is logged in: switches carts when someone logs in, logs out or changes account
const CartOwnerSync = () => {
  const { isLoaded, userId } = useAuth()
  const switchOwner = useCartStore((state) => state.switchOwner)

  useEffect(() => {
    if (!isLoaded) return
    const owner = userId || GUEST
    // Wait until the saved carts are loaded from the browser before switching
    if (useCartStore.persist.hasHydrated()) switchOwner(owner)
    else return useCartStore.persist.onFinishHydration(() => switchOwner(owner))
  }, [isLoaded, userId, switchOwner])

  return null
}

export default CartOwnerSync
