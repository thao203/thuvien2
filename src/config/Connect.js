import axios from 'axios';

const baseURL = 'https://latn.onrender.com';

const request = axios.create({
    baseURL,
    withCredentials: true, // Gửi cookie kèm yêu cầu
});

// Interceptor cho request
request.interceptors.request.use(
    (config) => {
        // Thử lấy token từ cookie trước
        let token = null;
        const tokenCookie = document.cookie.split('; ').find((row) => row.startsWith('token='));
        if (tokenCookie) {
            token = tokenCookie.split('=')[1];
        } else {
            // Nếu không có trong cookie, lấy từ localStorage
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default request;
