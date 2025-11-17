export type ServiceType =
  | 'RECEPTION' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'KITCHEN' | 'RESTAURANT'
  | 'BAR' | 'CONCIERGE' | 'SPA' | 'SECURITY' | 'IT' | 'FINANCE' | 'HR';

export interface CrewMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string | null;
}

export interface Crew {
  id: number;
  name: string;
  service: ServiceType;
  hotelId: number;
  memberCount: number;
  members: CrewMember[];
}
