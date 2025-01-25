import axios from 'axios';

// Define the base URL for the API
const BASE_URL = 'http://localhost:5154/api/livre';

export interface Livre {
  id?: number;
  titre: string;
  auteur: string;
  editeur: string;
  genre: string;
  anneePublication: number;
  exemplairesDisponibles: number;
  dateCreation?: string;
  dateMiseAJour?: string;
  imageUrl?: string;
}

export interface SearchCriteria {
  titre?: string;
  auteur?: string;
  genre?: string;
  anneePublication?: number;
  disponiblesUniquement?: boolean;
}

class LivreService {
  // Get all books
  async getAll(): Promise<Livre[]> {
    const response = await axios.get(`${BASE_URL}`);
    return response.data;
  }

  // Get a book by ID
  async getById(id: number): Promise<Livre> {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  }

  async addLivre(formData: FormData): Promise<void> {
     const response = await axios.post('http://localhost:5154/api/livre',{
      "Titre": formData.get('Titre'),
      "Auteur": formData.get('Auteur'),
      "Editeur": formData.get('Editeur'),
      "Genre": formData.get('Genre'),
      "AnneePublication": formData.get('AnneePublication'),
      "ExemplairesDisponibles": formData.get('ExemplairesDisponibles'),
      "ImageUrl": formData.get('ImageUrl')
     }, {
      headers: { 
        'Content-Type': 'multipart/form-data' ,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      
    });
    console.log(response.data);
    return response.data ;
  }

  // Update a book (requires authentication)
  async updateLivre(id: number | undefined, formData: FormData): Promise<void> {
    const response = await axios.put(`http://localhost:5154/api/livre/${id}`, {
      "Titre": formData.get('Titre'),
      "Auteur": formData.get('Auteur'),
      "Editeur": formData.get('Editeur'),
      "Genre": formData.get('Genre'),
      "AnneePublication": formData.get('AnneePublication'),
      "ExemplairesDisponibles": formData.get('ExemplairesDisponibles'),
      "ImageUrl": formData.get('ImageUrl')
     }, {
      headers: { 
        'Content-Type': 'multipart/form-data' ,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return response.data;
  }

  // Delete a book by ID (requires authentication)
  async deleteLivre(id: number | undefined): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`,{ 
      headers: { 
        'Content-Type': 'multipart/form-data' ,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  // Search books
  async searchBooks(criteria: SearchCriteria): Promise<Livre[]> {
    const params = new URLSearchParams();
    if (criteria.titre) params.append('titre', criteria.titre);
    if (criteria.auteur) params.append('auteur', criteria.auteur);
    if (criteria.genre) params.append('genre', criteria.genre);
    if (criteria.anneePublication) params.append('anneePublication', criteria.anneePublication.toString());
    if (criteria.disponiblesUniquement) params.append('disponiblesUniquement', criteria.disponiblesUniquement.toString());

    const response = await axios.get(`${BASE_URL}/search`, { params });
    return response.data;
  }
}

export default new LivreService();
