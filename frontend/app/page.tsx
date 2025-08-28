"use client"
import { useState, useEffect } from 'react'
import { cartUtils } from '@/components/Cart'
import { products, type Product } from '@/lib/productData'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(8)

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  const totalPages = Math.ceil(products.length / productsPerPage)

  const handleAddToCart = (product: Product) => {
    cartUtils.addToCart({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.filepath
    })
  }

  const goto = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome to EduStore</h1>
        <p className="text-gray-600">Discover educational PDFs across various categories</p>
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
    </div>
  )
}


