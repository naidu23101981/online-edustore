import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import LeftMenu from '@/components/LeftMenu'
import Footer from '@/components/Footer'
import AuthModal from '@/app/(auth)/AuthModal'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata = {
  title: 'EduStore',
  description: 'Buy PDFs and take exams securely',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex max-w-screen-xl w-full mx-auto gap-6 px-4 py-6">
              <aside className="w-64 shrink-0 hidden md:block">
                <LeftMenu />
              </aside>
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Footer />
            <AuthModal />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}


