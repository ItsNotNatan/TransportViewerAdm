import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Interceptor para colocar o crachá (AccessToken) em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar o token automaticamente se der erro 403 (Expirado)
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 403 e ainda não tentamos renovar...
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Pede um novo Access Token para o Back-end
        const res = await axios.post('http://localhost:3001/api/auth/refresh', { 
          refreshToken 
        });

        const novoAccessToken = res.data.accessToken;

        // Salva o novo e tenta a requisição original de novo
        localStorage.setItem('accessToken', novoAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${novoAccessToken}`;
        
        return api(originalRequest); 
      } catch (refreshError) {
        // Se o Refresh Token também falhar, desloga tudo
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;