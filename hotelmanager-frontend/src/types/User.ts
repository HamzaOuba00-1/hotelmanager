export type Role = 'MANAGER' | 'EMPLOYE' | 'CLIENT';

// Réponses API (lecture) — pas de password
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  hotelId?: number;
}

// Payload création (écriture) — avec password
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  hotelId?: number;
}
