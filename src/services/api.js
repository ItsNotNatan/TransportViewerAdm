import axios from 'axios';

// 🟢 Captura a URL da API das variáveis de ambiente
// Se estiver usando Vite: import.meta.env.VITE_API_URL
// Se estiver usando Create React App: process.env.REACT_APP_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL
});

// Interceptor para colocar o crachá (AccessToken) em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar o token automaticamente
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // 🟢 IMPORTANTE: Usa a variável API_URL aqui também!
        const res = await axios.post(`${API_URL}/auth/refresh`, { 
          refreshToken 
        });

        const novoAccessToken = res.data.accessToken;

        localStorage.setItem('accessToken', novoAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${novoAccessToken}`;
        
        return api(originalRequest); 
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
