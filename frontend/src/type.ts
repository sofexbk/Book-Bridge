export interface Book {
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

export interface Emprunt {
  id: number;
  livreId: number;
  utilisateurId: number;
  dateEmprunt: string;
  dateRetourPrevue: string;
  dateRetourEffective?: string;
  estRetourne: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}