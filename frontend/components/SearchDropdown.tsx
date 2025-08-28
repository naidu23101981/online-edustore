"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { products, getCategories } from '@/lib/productData'

interface SearchDropdownProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

export default function SearchDropdown({ query, isOpen, onClose }: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Filter categories and products based on query
  const filteredCategories = getCategories().filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  )

  const hasResults = filteredCategories.length > 0 || filteredProducts.length > 0

  if (!isOpen || !query.trim()) return null

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-2">
        {!hasResults ? (
          <div className="p-4 text-center text-gray-500">
            <p>No results found for "{query}"</p>
            <p className="text-sm mt-1">Try searching for categories or product names</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Categories Section */}
            {filteredCategories.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Categories
                </h3>
                <div className="space-y-1">
                  {filteredCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/categories/${category.name.toLowerCase()}`}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">📁</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{category.productCount} products</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Products
                </h3>
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">📄</span>
                        <div>
                          <span className="font-medium">{product.title}</span>
                          <span className="text-sm text-gray-500 ml-2">({product.category})</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">${product.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* View All Results */}
            <div className="border-t pt-2">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="block px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={onClose}
              >
                View all results for "{query}" →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
