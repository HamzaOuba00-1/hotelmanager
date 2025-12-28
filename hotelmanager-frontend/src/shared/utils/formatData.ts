import { CreateUserPayload  } from '../../features/users/User';


export const getEmptyUser = (): CreateUserPayload => ({
  hotelId: undefined, 
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYE', 
});
