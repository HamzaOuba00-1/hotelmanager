import axios from "axios";

export const addUser = (data: any) =>
  axios.post("/users", data).then((res) => res.data);

export const fetchUsers = () =>
  axios.get("/users").then((res) => res.data);
