import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book } from '../type';
import  LivreService from '../services/books';
import BorrowedBookService from '../services/borrowedBooks';

export default function BookDetails() {
  const { id } = useParams();
  const numericId = Number(id);
  const user = JSON.parse(localStorage.getItem('user')!);
  if (isNaN(numericId)) {
    console.error('Invalid ID provided in the route.');
  }
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookAndReviews();
    }
  }, [id]);

  const fetchBookAndReviews = async () => {
    try {
      const [bookData] = await Promise.all([LivreService.getById(numericId)]);
      if (!bookData) throw new Error('Book not found');
      setBook(bookData);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!book || !localStorage.getItem('user')) return;

    try {
      setBorrowing(true);
      await BorrowedBookService.borrowBook(user.userId, book.id);
      navigate('/borrowed');
    } catch (error) {
      console.error('Error borrowing book:', error);
      setError('Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">{error || 'Book not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 p-4">
      <div className="max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden w-full h-1/2">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2">
            <img
              src={`http://localhost:5154${book.imageUrl}`}
              alt={book.titre}
              className="h-full w-full object-cover"
            />
          </div>
  
          {/* Details Section */}
          <div className="p-8 md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{book.titre}</h1>
              <p className="mt-2 text-gray-600 text-lg">{book.auteur}</p>
              <p className="mt-4 text-gray-600">{book.editeur}</p>
              <div className="mt-4">
                <p className="mt-2 text-gray-500">{book.anneePublication}</p>
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {book.genre}
                </span>
              </div>
            </div>
  
            <div className="mt-6 flex items-center justify-between">
              <p className="text-gray-600 text-lg">
                Available Copies: {book.exemplairesDisponibles}
              </p>
              <button
                onClick={handleBorrow}
                disabled={book.exemplairesDisponibles === 0 || borrowing}
                className={`px-6 py-2 rounded-md text-white transition duration-200 ${
                  book.exemplairesDisponibles === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {borrowing
                  ? 'Borrowing...'
                  : book.exemplairesDisponibles === 0
                  ? 'Out of Stock'
                  : 'Borrow Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
