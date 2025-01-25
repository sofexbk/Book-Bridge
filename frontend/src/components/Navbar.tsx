import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-800">LibraryApp</span>
          </div>

          <div className="flex items-center space-x-4">
          {(localStorage.getItem('user')&& user.role !="Bibliothecaire") && (
            <Link
            to="/borrowed"
            className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            My Books
          </Link>
          )}
            
            {user.role =="Bibliothecaire" && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            {localStorage.getItem('user') &&(
              <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
            )}
            {localStorage.getItem('user') &&(
              <div className="flex items-center space-x-1 text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            )}

            
          </div>
        </div>
      </div>
    </nav>
  );
}