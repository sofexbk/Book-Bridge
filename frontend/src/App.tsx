import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import BorrowedBooks from './pages/BorrowedBooks';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBorrowed from './pages/admin/AdminBorrowed';
import AdminUsers from './pages/admin/AdminUsers';
import { AuthProvider } from './contexts/AuthContext';


function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Show Navbar only if user is not null */}
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/borrowed" element={<BorrowedBooks />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/borrowed" element={<AdminBorrowed />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
