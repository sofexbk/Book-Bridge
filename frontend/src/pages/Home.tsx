import { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { Book } from '../type';
import { Search } from 'lucide-react';
import  LivreService  from '../services/books';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'Bibliothecaire') {
      navigate("/admin");
    }
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await LivreService.getAll();
      setBooks(data);
      const uniqueCategories = [...new Set(data.map(book => book.genre))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = search.toLowerCase() === '' || 
      book.titre.toLowerCase().includes(search.toLowerCase()) ||
      book.auteur.toLowerCase().includes(search.toLowerCase()) ||
      book.anneePublication.toString().includes(search);
    
    const matchesCategory = category === '' || book.genre === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, author, or year..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
          >
            <img
              src={`http://localhost:5154${book.imageUrl}`}
              alt={book.titre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{book.titre}</h3>
              <p className="text-gray-600">{book.auteur}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-purple-600">{book.genre}</span>
                <span className="text-sm text-gray-500">{book.anneePublication}</span>
              </div>
              <div className="mt-2 text-sm">
                {book.exemplairesDisponibles > 0 ? (
                  <span className="text-green-600">{book.exemplairesDisponibles} available</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}