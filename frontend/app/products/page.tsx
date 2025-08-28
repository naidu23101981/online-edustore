"use client"
import { useState, useEffect } from 'react'
import { cartUtils } from '@/components/Cart'
import { products, type Product } from '@/lib/productData'

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(8)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleAddToCart = (product: Product) => {
    cartUtils.addToCart({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.filepath
    })
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    if (category === 'all') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === category))
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const goto = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">All Products</h1>
        <p className="text-gray-600">Browse all available educational PDFs</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentProducts.map((product) => (
          <article key={product.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <div className="text-xs text-blue-600 mb-1">{product.category}</div>
            <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-medium">${product.price.toFixed(2)}</span>
              <button 
                onClick={() => handleAddToCart(product)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button 
            onClick={() => goto(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => goto(page)}
              className={`w-9 h-9 rounded border text-sm ${
                page === currentPage 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => goto(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No products found</h2>
          <p className="text-gray-600">
            No products available in the selected category.
          </p>
        </div>
      )}
    </div>
  )
}


