import { BookOpen, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white shadow-lg mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-bold text-gray-800">LibraryApp</span>
          </div>
          <p className="text-gray-600 text-sm flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for book lovers
          </p>
        </div>
      </div>
    </footer>
  );
}