import axios from '../../../api/axios';
import { Credentials, AuthResponseDTO } from '../../../api/dto';


const _API = '/auth';

export const registerManager = async (data: any): Promise<AuthResponse> => {
  const res = await axios.post<AuthResponse>('/auth/register/manager', data);
  return res.data;
};


export interface AuthResponse {
  token: string;
  hotelId: number;
  hotelName: string;
  email: string;
}



export async function login(
  credentials: Credentials,
): Promise<AuthResponseDTO> {
  const { data } = await axios.post<AuthResponseDTO>(
    '/auth/login',
    credentials,
  );
  return data;  
}
