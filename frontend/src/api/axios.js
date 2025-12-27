import axios from 'axios';
const api = axios.create({
  baseURL: "http://localhost:8081/api",
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (
    userId &&
    (config.method === 'post' || config.method === 'put') &&
    config.url &&
    config.url.startsWith('/category-budgets')
  ) {
    config.data = {
      ...config.data,
      userId: Number(userId)
    };
  }
  return config;
}, error => {
  return Promise.reject(error);
});
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login'; 
  }
  return Promise.reject(error);
});
export default api;