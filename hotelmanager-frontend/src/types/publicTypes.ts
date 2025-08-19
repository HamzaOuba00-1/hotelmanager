export interface PublicRoom {
  id: number;
  roomNumber: number;
  roomType: string;
  floor: number;
  description?: string;
  roomState: string; // string côté public
  active: boolean;
}
