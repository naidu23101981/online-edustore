"use client"
import { useState, useEffect } from 'react'
import { EyeIcon, DownloadIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'

type OrderItem = {
  id: string
  title: string
  category: string
  price: number
  quantity: number
}

type Order = {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
  completedAt?: string
  downloadIds: string[]
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    items: [
      { id: '1', title: 'JavaScript Fundamentals', category: 'Programming', price: 19.99, quantity: 1 },
      { id: '2', title: 'React Basics', category: 'Programming', price: 24.99, quantity: 1 }
    ],
    subtotal: 44.98,
    tax: 4.50,
    total: 49.48,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:35:00Z',
    downloadIds: ['DL-001', 'DL-002']
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    items: [
      { id: '3', title: 'Machine Learning Intro', category: 'AI', price: 29.99, quantity: 1 }
    ],
    subtotal: 29.99,
    tax: 3.00,
    total: 32.99,
    status: 'processing',
    createdAt: '2024-01-20T14:15:00Z',
    downloadIds: ['DL-003']
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    items: [
      { id: '4', title: 'Deep Learning Basics', category: 'AI', price: 34.99, quantity: 2 }
    ],
    subtotal: 69.98,
    tax: 7.00,
    total: 76.98,
    status: 'pending',
    createdAt: '2024-01-25T09:45:00Z',
    downloadIds: []
  }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'processing': return <ClockIcon className="w-4 h-4" />
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'processing': return 'Processing'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = (downloadId: string, title: string) => {
    // TODO: Implement actual download functionality
    console.log(`Downloading ${title} with ID: ${downloadId}`)
    alert(`Download started for: ${title}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">My Orders</h1>
        <p className="text-gray-600">Track your orders and download your purchased PDFs</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                <p className="text-sm text-gray-500">
                  Ordered on {formatDate(order.createdAt)}
                </p>
                {order.completedAt && (
                  <p className="text-sm text-gray-500">
                    Completed on {formatDate(order.completedAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </span>
                <button
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex items-center justify-between text-sm">
              <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              <span className="font-semibold">Total: ${order.total.toFixed(2)}</span>
            </div>

            {/* Expanded Order Details */}
            {selectedOrder?.id === order.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Section */}
                {order.status === 'completed' && order.downloadIds.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Downloads:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-gray-500">Download ID: {order.downloadIds[index]}</p>
                          </div>
                          <button
                            onClick={() => handleDownload(order.downloadIds[index], item.title)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here
          </p>
        </div>
      )}
    </div>
  )
}
