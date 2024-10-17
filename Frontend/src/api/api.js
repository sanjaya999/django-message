import axios from "axios"

//base axios instance created with base url and headers (default)
const apiClient = axios.create({
    baseURL: "http://localhost:9000",
    headers : {
        'Content-Type': 'application/json',
    }
})

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

//get request
export const get = async(endpoint) =>{
    try{
        const response = await apiClient.get(endpoint);
        return response.data;
    }catch(error){
        console.error('Error fetching data:', error);
        throw error;        
    }

}
 
//post request
export const post = async(endpoint, data)=>{
    try{
        const response = await apiClient.post(endpoint , data);
        return response.data;
    }catch(error){
        console.error('Error fetching data:', error);
        throw error;
    }
}

//delete req

export const del = async(endpoint)=>{
    try{
        const response = await apiClient.delete(endpoint);
        return response;
    }catch(error){
        console.error('Error fetching data:', error);
        throw error;
    }
}

export {apiClient}