"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import SearchDropdown from './SearchDropdown'
import Cart from './Cart'
import { cartUtils } from './Cart'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { user, isAuthenticated, logout } = useAuth()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'text-purple-600 bg-purple-100'
      case 'ADMIN': return 'text-blue-600 bg-blue-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'Super Admin'
      case 'ADMIN': return 'Admin'
      default: return 'User'
    }
  }

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSearchDropdown(value.length > 0)
  }

  // Close search dropdown when query is empty
  useEffect(() => {
    if (!query.trim()) {
      setShowSearchDropdown(false)
    }
  }, [query])

  // Load cart count on mount and listen for updates
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(cartUtils.getCartCount())
    }

    updateCartCount()
    window.addEventListener('cart-updated', updateCartCount)
    
    return () => {
      window.removeEventListener('cart-updated', updateCartCount)
    }
  }, [])

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="EduStore" width={36} height={36} className="rounded" />
          <span className="font-semibold">EduStore</span>
        </Link>

        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={handleSearchChange}
              onFocus={() => query.trim() && setShowSearchDropdown(true)}
              placeholder="Search categories, products..."
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          {/* Search Dropdown */}
          <SearchDropdown 
            query={query}
            isOpen={showSearchDropdown}
            onClose={() => setShowSearchDropdown(false)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Cart Icon */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user?.role || 'USER')}`}>
                    {getRoleLabel(user?.role || 'USER')}
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email || user?.phone}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href={user?.role === 'SUPERADMIN' ? '/superadmin' : user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <CogIcon className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowProfileMenu(false)
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                className="px-3 py-2 text-sm rounded border hover:bg-gray-50 transition" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
              >
                Login
              </button>
              <button 
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showProfileMenu || showSearchDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileMenu(false)
            setShowSearchDropdown(false)
          }}
        />
      )}

      {/* Cart Component */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
    </header>
  )
}


