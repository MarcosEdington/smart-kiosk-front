import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smart-kiosk-api.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;