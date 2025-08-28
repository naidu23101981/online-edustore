import Link from 'next/link'
import { HomeIcon, FolderIcon, DocumentTextIcon, AcademicCapIcon, EyeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function LeftMenu() {
  const menuItems = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/categories', icon: FolderIcon, label: 'Categories' },
    { href: '/products', icon: DocumentTextIcon, label: 'Products' },
    { href: '/exams', icon: AcademicCapIcon, label: 'Exams' },
    { href: '/previews', icon: EyeIcon, label: 'Product Previews' },
    { href: '/orders', icon: ShoppingBagIcon, label: 'Orders' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}


