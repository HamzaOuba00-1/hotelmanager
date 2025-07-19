// src/api/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // adapte selon ton backend
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;
