import axios from "axios"
import jwtDecode from "jwt-decode"

//base axios instance created with base url and headers (default)
const apiClient = axios.create({
    baseURL: "http://localhost:9000",
    headers : {
        'Content-Type': 'application/json',
    }
})

let isRefreshing = false;;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    failedQueue = [];
  };
//interceptor will add authorization headers to every request
apiClient.interceptors.request.use(
    config =>{
        const token = localStorage.getItem('authToken');
        if(token){
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error =>{
        return Promise.reject(error)
    }
)


apiClient.interceptors.request.use(
    response => response,
    async error =>{
        const originalRequest = error.config;
        if(error.response.status === 401 && !originalRequest._retry ){
            if(!isRefreshing){
                return new Promise((resolve , reject)=>{
                    failedQueue.push({resolve , reject});
                }).then(token =>{
                    originalRequest.headers['Authorization'] = 'Bearer '+ token;
                     return apiClient(originalRequest);
                }).catch(err=> Promise.reject(err)  )
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await apiClient.post('/auth/refresh-token', { refreshToken });
                const { token } = response.data;
                
                localStorage.setItem('authToken', token);
                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                processQueue(null, token);
                return apiClient(originalRequest);
            
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');

                window.location.href = '/login';
                return Promise.reject(refreshError);
                
            }finally {
                isRefreshing = false;
              }
        }    return Promise.reject(error);

    }
)


export const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, refreshToken } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };


export const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  };

  export const get = (endpoint) => apiClient.get(endpoint);
  export const post = (endpoint, data) => apiClient.post(endpoint, data);
  export const del = (endpoint) => apiClient.delete(endpoint);
  export const put = (endpoint, data) => apiClient.put(endpoint, data);
  
export {apiClient}