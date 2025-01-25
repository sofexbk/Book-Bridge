import React, { useState, useEffect } from 'react';
import { Book } from '../../type';
import { Plus, AlertCircle } from 'lucide-react';
import LivreService from '../../services/books';

const initialFormData: Omit<Book, 'imageUrl'> & { imageFile: File | null } = {
  titre: "",
  auteur: "",
  editeur: "",
  genre: "",
  anneePublication: 0,
  exemplairesDisponibles: 0,
  dateCreation: "",
  dateMiseAJour: "",
  imageFile: null,
};

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await LivreService.getAll();
      setBooks(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedBook(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({ ...book, imageFile: null }); // Keep current book data; allow image upload override
    setShowModal(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        setErrorMessage('Only .jpg, .jpeg, and .png files are allowed.');
        return;
      }

      setErrorMessage('');
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Titre', formData.titre);
      formDataToSend.append('Auteur', formData.auteur);
      formDataToSend.append('Editeur', formData.editeur);
      formDataToSend.append('Genre', formData.genre);
      formDataToSend.append('AnneePublication', formData.anneePublication.toString());
      formDataToSend.append('ExemplairesDisponibles', formData.exemplairesDisponibles.toString());

      if (formData.imageFile) {
        formDataToSend.append('ImageUrl', formData.imageFile); 
      }

      if (selectedBook) {
        // Update an existing book
        await LivreService.updateLivre(selectedBook.id, formDataToSend);
      } else {
        // Add a new book
        
         // Log the contents of FormData for debugging
    for (let value of formDataToSend.entries()) {
      console.log(value);
    }
        await LivreService.addLivre(formDataToSend);
      }

      await fetchBooks();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBook) return;
    try {
      await LivreService.deleteLivre(selectedBook.id);
      await fetchBooks();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting book:', error);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Books</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Book</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Cover
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Title
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Author
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Category
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Year
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Stock
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {books.map((book) => (
          <tr key={book.id} className="hover:bg-gray-80">
            <td className="px-6 py-4 whitespace-nowrap flex items-center">
              <img
                src={`http://localhost:5154${book.imageUrl}`}
                alt={book.titre}
                className="h-16 w-16 object-cover rounded mr-4"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{book.titre}</td>
            <td className="px-6 py-4 whitespace-nowrap">{book.auteur}</td>
            <td className="px-6 py-4 whitespace-nowrap">{book.genre}</td>
            <td className="px-6 py-4 whitespace-nowrap">{book.anneePublication}</td>
            <td className="px-6 py-4 whitespace-nowrap">{book.exemplairesDisponibles}</td>
            <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
              <button
                onClick={() => handleEdit(book)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(book)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  value={formData.auteur}
                  onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    value={formData.anneePublication}
                    onChange={(e) => setFormData({ ...formData, anneePublication: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    value={formData.exemplairesDisponibles}
                    onChange={(e) => setFormData({ ...formData, exemplairesDisponibles: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm"
                  accept=".jpg,.jpeg,.png"
                />
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.editeur}
                  onChange={(e) => setFormData({ ...formData, editeur: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {selectedBook ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Confirm Delete</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedBook.titre}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
