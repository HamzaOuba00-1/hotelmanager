// src/utils/formData.ts
import { User } from '../types/User';

/**
 * Donne une structure vide d'un utilisateur.
 */
export const getEmptyUser = (): User => ({
  id: 0,
  hotelId: undefined, // optionnel
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYE', // valeur par défaut
});
