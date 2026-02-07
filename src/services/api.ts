import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://smart-kiosk-api.onrender.com/api', 
  baseURL: 'https://smart-kiosk-api.onrender.com/api/Playlist',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
