// Product data based on actual PDF files in uploads/pdfs
export type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  filename: string
  filepath: string
}

// Real products based on actual PDF files in uploads/pdfs
export const products: Product[] = [
  // AI Category
  {
    id: 'ai-1',
    title: 'Machine Learning Introduction',
    description: 'Comprehensive introduction to machine learning concepts, algorithms, and applications. Perfect for beginners starting their AI journey.',
    price: 29.99,
    category: 'AI',
    filename: 'Machine_Learning_Intro.pdf',
    filepath: '/uploads/pdfs/AI/Machine_Learning_Intro.pdf'
  },
  {
    id: 'ai-2',
    title: 'Basics of Machine Learning',
    description: 'Fundamental concepts and practical applications of machine learning. Learn core algorithms and implementation techniques.',
    price: 34.99,
    category: 'AI',
    filename: 'Basics_of_Machine_Learning.pdf',
    filepath: '/uploads/pdfs/AI/Basics_of_Machine_Learning.pdf'
  },

  // Programming Category
  {
    id: 'prog-1',
    title: 'JavaScript Basics',
    description: 'Essential JavaScript fundamentals for web development. Learn core concepts, syntax, and best practices.',
    price: 19.99,
    category: 'Programming',
    filename: 'JavaScript_Basics.pdf',
    filepath: '/uploads/pdfs/Programming/JavaScript_Basics.pdf'
  },
  {
    id: 'prog-2',
    title: 'Introduction to JavaScript',
    description: 'Complete guide to JavaScript programming language. From basics to advanced concepts and modern ES6+ features.',
    price: 24.99,
    category: 'Programming',
    filename: 'Introduction_to_JavaScript.pdf',
    filepath: '/uploads/pdfs/Programming/Introduction_to_JavaScript.pdf'
  },

  // Sports Category
  {
    id: 'sports-1',
    title: 'Football Strategies',
    description: 'Advanced football tactics and strategies for players and coaches. Learn professional techniques and game plans.',
    price: 14.99,
    category: 'Sports',
    filename: 'Football_Strategies.pdf',
    filepath: '/uploads/pdfs/Sports/Football_Strategies.pdf'
  },
  {
    id: 'sports-2',
    title: 'Basketball Techniques',
    description: 'Professional basketball techniques and training methods. Master shooting, dribbling, and defensive skills.',
    price: 16.99,
    category: 'Sports',
    filename: 'Basketball_Techniques.pdf',
    filepath: '/uploads/pdfs/Sports/Basketball_Techniques.pdf'
  },

  // Movies Category
  {
    id: 'movies-1',
    title: 'Movie Analysis Guide',
    description: 'How to analyze and critique films like a professional. Learn cinematography, storytelling, and film theory.',
    price: 12.99,
    category: 'Movies',
    filename: 'Movie_Analysis_Guide.pdf',
    filepath: '/uploads/pdfs/Movies/Movie_Analysis_Guide.pdf'
  },
  {
    id: 'movies-2',
    title: 'Cinema History',
    description: 'Complete history of cinema from its origins to modern filmmaking. Explore the evolution of the art form.',
    price: 18.99,
    category: 'Movies',
    filename: 'Cinema_History.pdf',
    filepath: '/uploads/pdfs/Movies/Cinema_History.pdf'
  },

  // Medical Category
  {
    id: 'medical-1',
    title: 'Medical Terminology',
    description: 'Essential medical terms and definitions for healthcare professionals and students.',
    price: 22.99,
    category: 'Medical',
    filename: 'Medical_Terminology.pdf',
    filepath: '/uploads/pdfs/Medical/Medical_Terminology.pdf'
  },
  {
    id: 'medical-2',
    title: 'Anatomy Basics',
    description: 'Human anatomy fundamentals for medical students and healthcare professionals.',
    price: 26.99,
    category: 'Medical',
    filename: 'Anatomy_Basics.pdf',
    filepath: '/uploads/pdfs/Medical/Anatomy_Basics.pdf'
  },

  // Arts Category
  {
    id: 'arts-1',
    title: 'Digital Art Guide',
    description: 'Digital art techniques and tools for modern artists. Master digital painting and illustration.',
    price: 20.99,
    category: 'Arts',
    filename: 'Digital_Art_Guide.pdf',
    filepath: '/uploads/pdfs/Arts/Digital_Art_Guide.pdf'
  },
  {
    id: 'arts-2',
    title: 'Photography Tips',
    description: 'Professional photography tips and techniques. Learn composition, lighting, and post-processing.',
    price: 15.99,
    category: 'Arts',
    filename: 'Photography_Tips.pdf',
    filepath: '/uploads/pdfs/Arts/Photography_Tips.pdf'
  },

  // Politics Category
  {
    id: 'politics-1',
    title: 'Political Science',
    description: 'Introduction to political science concepts and theories. Understand governance and political systems.',
    price: 21.99,
    category: 'Politics',
    filename: 'Political_Science.pdf',
    filepath: '/uploads/pdfs/Politics/Political_Science.pdf'
  },
  {
    id: 'politics-2',
    title: 'World Politics',
    description: 'Global political systems and international relations. Explore contemporary political challenges.',
    price: 19.99,
    category: 'Politics',
    filename: 'World_Politics.pdf',
    filepath: '/uploads/pdfs/Politics/World_Politics.pdf'
  }
]

// Helper functions
export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase())
}

export const getProductById = (id: string) => {
  return products.find(product => product.id === id)
}

export const searchProducts = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return products.filter(product => 
    product.title.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery)
  )
}

export const getCategories = () => {
  const categories = [...new Set(products.map(product => product.category))]
  return categories.map(category => ({
    name: category,
    productCount: products.filter(product => product.category === category).length
  }))
}
