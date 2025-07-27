import axios from "axios";


export const getHotelById = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`http://localhost:8080/hotels/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // doit contenir { name: '...' }
};
