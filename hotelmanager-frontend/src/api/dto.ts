export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  hotelId: number;
  hotelName: string;
}

