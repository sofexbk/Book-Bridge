import { Link } from 'react-router-dom';
import { BookOpen, Users, Library } from 'lucide-react';
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/books"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
        >
          <div className="flex items-center space-x-4">
            <Library className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Manage Books</h2>
              <p className="text-gray-600">Add, edit, or remove books</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/borrowed"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
        >
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Borrowed Books</h2>
              <p className="text-gray-600">View all borrowed books</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
        >
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Manage Users</h2>
              <p className="text-gray-600">Edit or remove user accounts</p>
            </div>
          </div>
        </Link>
        
      </div>
    </div>
  );
}