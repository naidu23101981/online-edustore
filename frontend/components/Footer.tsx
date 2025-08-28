// components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-6 border-t border-gray-200 py-4 text-center text-sm text-gray-600">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2">
          <p>© {new Date().getFullYear()} EduStore</p>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <a href="#" className="hover:text-blue-700">Terms and Conditions</a>
            <a href="#" className="hover:text-blue-700">Privacy Policy</a>
            <a href="#" className="hover:text-blue-700">Cancellation and Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
