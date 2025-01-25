import { useState, useEffect } from 'react';
import { Emprunt } from '../type';
import { BookOpen, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns'; 
import LivreService from '../services/books';
import BorrowedBookService from '../services/borrowedBooks';

export default function BorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returning, setReturning] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const borrowedBooksData: Emprunt[] = await BorrowedBookService.getBorrowedBooksByUser(user.userId);

      const borrowedBooksWithDetails = await Promise.all(
        borrowedBooksData.map(async (borrowedBook) => {
          const bookDetails = await LivreService.getById(borrowedBook.livreId);
          return { ...borrowedBook, book: bookDetails };
        })
      );

      setBorrowedBooks(borrowedBooksWithDetails);
      console.log(borrowedBooksWithDetails);
    } catch (error) {
      console.error('Error fetching borrowed books or book details:', error);
      setError('Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowedBook: any) => {
    console.log(borrowedBook);
    if (!borrowedBook) return;

    try {
      setReturning(borrowedBook);

      await BorrowedBookService.returnBook(borrowedBook);

      await fetchBorrowedBooks();
    } catch (error) {
      console.error('Error returning book:', error);
      setError('Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (borrowedBooks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No borrowed books</h2>
        <p className="text-gray-600">You haven't borrowed any books yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Borrowed Books</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {borrowedBooks.map((borrowed) => (
          <div key={borrowed.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {borrowed.book && (
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    src={`http://localhost:5154${borrowed.book.imageUrl}`}
                    alt={borrowed.book.titre}
                    className="h-48 w-full md:h-full md:w-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800">{borrowed.book.titre}</h3>
                  <p className="text-gray-600">{borrowed.book.auteur}</p>

                  <div className="mt-4 space-y-2">
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Borrowed on: {format(new Date(borrowed.dateEmprunt), 'yyyy-MM-dd')}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Return by: {format(new Date(borrowed.dateRetourPrevue), 'yyyy-MM-dd')}</span>
                    </div>

                    {!borrowed.estRetourne && (
                      <button
                        onClick={() => handleReturn(borrowed.id)}
                        disabled={returning === borrowed.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
                      >
                        <Check className="h-4 w-4" />
                        <span>{returning === borrowed.id ? 'Returning...' : 'Return Book'}</span>
                      </button>
                    )}

                    {borrowed.estRetourne && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span>Returned</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
