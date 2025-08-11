// src/utils/formData.ts
import { CreateUserPayload  } from '../types/User';

/**
 * Donne une structure vide d'un utilisateur.
 */
export const getEmptyUser = (): CreateUserPayload => ({
  hotelId: undefined, // optionnel
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYE', // valeur par défaut
});
