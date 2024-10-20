import axios from "axios"
import { jwtDecode } from 'jwt-decode';
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



  export const get = async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }; 
  
  export const post = async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }; 

  export const del = async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  };
  
export const put = async (endpoint, data) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('PUT request error:', error);
    throw error;
  }
};  
export {apiClient}