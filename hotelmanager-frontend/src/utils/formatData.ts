import { CreateUserPayload  } from '../types/User';


export const getEmptyUser = (): CreateUserPayload => ({
  hotelId: undefined, 
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYE', 
});
