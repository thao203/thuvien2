import axios from 'axios';

const baseURL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://172.31.27.177:5000';

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