export type Role = 'MANAGER' | 'EMPLOYE' | 'CLIENT';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  hotelId?: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  hotelId?: number;
}
