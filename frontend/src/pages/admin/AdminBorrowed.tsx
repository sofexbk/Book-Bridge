import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Emprunt } from '../../type';
import  BorrowedBookService  from '../../services/borrowedBooks';


export default function AdminBorrowed() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]); // Includes detailed book and user info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);

      // Fetch all borrowed books
      const borrowedBooksData: Emprunt[] = await BorrowedBookService.getAllBorrowedBooks();
      console.log(borrowedBooksData);

      setBorrowedBooks(borrowedBooksData);
    } catch (error) {
      console.error('Error fetching borrowed books or details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">All Borrowed Books</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowedBooks.map((borrowed) => (
                <tr key={borrowed.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {borrowed.titreLivre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {borrowed.nomUtilisateur}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(borrowed.dateEmprunt), 'MMM dd, yyyy')} {/* Updated */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(borrowed.dateRetourPrevue), 'MMM dd, yyyy')} {/* Updated */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        borrowed.estRetourne
                          ? 'bg-green-100 text-green-800'
                          : new Date(borrowed.dateRetourPrevue) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {borrowed.estRetourne
                        ? 'Returned'
                        : new Date(borrowed.dateRetourPrevue) < new Date()
                        ? 'Overdue'
                        : 'Borrowed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
