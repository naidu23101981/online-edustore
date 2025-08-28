"use client"
import { useState, useEffect } from 'react'
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { OrderAPI } from '@/lib/api'

type CartItem = {
  id: string
  title: string
  category: string
  price: number
  quantity: number
  image?: string
}

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount and when cart is opened
  useEffect(() => {
    if (isOpen) {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart:', error)
          setCartItems([])
        }
      } else {
        setCartItems([])
      }
    }
  }, [isOpen])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } else {
      localStorage.removeItem('cart')
    }
  }, [cartItems])

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      setCartItems(event.detail)
    }

    window.addEventListener('cart-updated', handleCartUpdate as EventListener)
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener)
    }
  }, [])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.1 // 10% tax
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const orderData = {
        items: cartItems,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal()
      }

      console.log('Processing order:', orderData)
      
      // Create order via API
      const response = await OrderAPI.createOrder(orderData)
      
      console.log('Order created:', response)
      
      // Clear cart after successful order
      setCartItems([])
      localStorage.removeItem('cart')
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }))
      
      // Close cart and show success message
      onClose()
      alert(`Order placed successfully! Order number: ${response.order.orderNumber}`)
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Export cart functions for use in other components
export const cartUtils = {
  addToCart: (item: Omit<CartItem, 'quantity'>) => {
    const savedCart = localStorage.getItem('cart')
    const cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : []
    
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.push({ ...item, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems))
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cartItems }))
  },
  
  getCartCount: () => {
    const savedCart = localStorage.getItem('cart')
    if (!savedCart) return 0
    
    try {
      const cartItems: CartItem[] = JSON.parse(savedCart)
      return cartItems.reduce((total, item) => total + item.quantity, 0)
    } catch {
      return 0
    }
  },
  
  clearCart: () => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }))
  }
}
