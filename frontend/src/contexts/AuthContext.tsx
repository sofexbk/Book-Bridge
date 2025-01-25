import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, Prenom:string, Nom: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  const apiBaseUrl = 'http://localhost:5154/api'; 

  const login = async (email: string, MotDePasse: string) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        email,
        MotDePasse,
      });
  
      const { token, id, prenom, nom, role } = response.data;
  
      const userData = {
        id,
        email,
        prenom,
        nom,
        role,
      };
  
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(response.data)); 
      localStorage.setItem('token', token); 
      console.log('User logged in:', response.data);
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, MotDePasse: string, Prenom:string, Nom:string ) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/register`, {
        email,
        MotDePasse,
        Prenom,
        Nom
      });
      const { id, prenom, nom, role } = response.data;
      setUser({
        id,
        email,
        prenom,
        nom,
        role,
      });
    } catch (error) {
      console.error('Error during register:', error);
      throw new Error('Error creating account');
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await axios.post(`${apiBaseUrl}/auth/reset-password`, { email });
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error during password reset:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
