export default function CategoriesPage() {
  const mock = ['Programming', 'AI', 'Sports', 'Movies', 'Medical', 'Arts', 'Politics']
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Categories</h1>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {mock.map((c) => (
          <li key={c} className="border rounded p-3 hover:shadow-sm">{c}</li>
        ))}
      </ul>
    </div>
  )
}


