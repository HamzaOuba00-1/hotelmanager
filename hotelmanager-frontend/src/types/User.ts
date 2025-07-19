export type Role = 'MANAGER' | 'EMPLOYE' | 'CLIENT';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  hotelId?: number; // optionnel si l'utilisateur est lié à un hôtel
}
