"use client"
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { searchProducts, type Product } from '@/lib/productData'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchProducts(query)
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
    setLoading(false)
  }, [query])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Searching...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any products matching "{query}"
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Try:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="border rounded-md p-4 hover:shadow-sm transition">
              <div className="text-xs text-blue-600 mb-1">{product.category}</div>
              <h3 className="font-semibold line-clamp-1">{product.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-medium">${product.price.toFixed(2)}</span>
                <button 
                  className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition" 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                >
                  Buy
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
