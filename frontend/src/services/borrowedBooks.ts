import axios from 'axios';

const BASE_URL = 'http://localhost:5154/api/emprunt';

export interface Emprunt {
  id: number;
  livreId: number;
  utilisateurId: number;
  dateEmprunt: string;
  dateRetourPrevue: string;
  dateRetourEffective?: string;
  estRetourne: boolean;
}

export interface EmpruntRequest {
  LivreId: number | undefined;
  UtilisateurId: number;
}

class BorrowedBookService {
  // Borrow a book
  async borrowBook(userId: number , bookId: number | undefined): Promise<void> {
    console.log(bookId, userId)
    await axios.post(`${BASE_URL}/emprunt`, {
      "LivreId": bookId,
      "UtilisateurId": userId,
    }, {
      headers:{ 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
  }

  // Return a book
  async returnBook(empruntId: number): Promise<void> {
    await axios.put(`${BASE_URL}/emprunt/retour/${empruntId}`,{
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  // Get all borrowed books
  async getAllBorrowedBooks(): Promise<Emprunt[]> {
    const response = await axios.get(`${BASE_URL}/emprunts`,{
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Get borrowed books for a user
  async getBorrowedBooksByUser(userId: number): Promise<Emprunt[]> {
    const response = await axios.get(`${BASE_URL}/emprunts/${userId}`, {
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Get borrowed books (with librarian authorization)
  async getBorrowedBooks(): Promise<Emprunt[]> {
    const response = await axios.get(`${BASE_URL}/livres/empruntes`,{
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
}

export default new BorrowedBookService();
