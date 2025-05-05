import axios from 'axios';

const baseURL = 'https://server-plum-xi.vercel.app';

const request = axios.create({
    baseURL,
    withCredentials: true,
});

// Interceptor cho request (tùy chọn, để thêm token vào header nếu cần)
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default request;
