import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import request from '../../config/Connect';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const [masinhvien, setmasinhvien] = useState('');
    const [password, setPassword] = useState('');
    const [checkSaveLogin, setCheckSaveLogin] = useState(true);

    useEffect(() => {
        document.title = "Đăng nhập";
        const savedMaSinhVien = localStorage.getItem('masinhvien');
        const savedPassword = localStorage.getItem('password');
        if (savedMaSinhVien) setmasinhvien(savedMaSinhVien);
        if (savedPassword) setPassword(savedPassword);
    }, []);

    const handleLogin = async () => {
        try {
            const data = { masinhvien, password };
            const res = await request.post('api/login', data);
            if (res.data.token) {
                const cookieOptions = {
                    path: '/',
                    domain: 'https://latn.onrender.com',
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                };

                const cookieString = Object.entries(cookieOptions)
                    .filter(([key, value]) => value !== undefined)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ');

                document.cookie =  `token=${res.data.token}; ${cookieString}`;
                window.location.href = '/homepage';
            }

            if (checkSaveLogin) {
                localStorage.setItem('masinhvien', masinhvien);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('masinhvien');
                localStorage.removeItem('password');
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className={cx('inner')}>
                <div className={cx('column-left')}>
                    <div className={cx('text-container')}>
                        <h1>Thư viện trực tuyến</h1>
                        <h2>Đại Học Kinh Tế - Kĩ Thuật Công Nghiệp</h2>
                    </div>
                    <div className={cx('image-container')}>
                        <img src="/Books_preview.png" alt="Hình ảnh thư viện" className={cx('animated-image')} />
                    </div>
                </div>
                <div className={cx('column-right')}>
                    <h1>Đăng Nhập</h1>
                    <span>Chào mừng đến với cơ sở dữ liệu trực tuyến</span>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <TextField
                            id="username-field"
                            label="Mã sinh viên của bạn"
                            variant="outlined"
                            size="medium"
                            fullWidth
                            autoComplete="username"
                            value={masinhvien}
                            onChange={(e) => setmasinhvien(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            id="password-field"
                            label="Mật Khẩu"
                            variant="outlined"
                            type="password"
                            size="medium"
                            fullWidth
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />
                        <div className={cx('remember-me')}>
                            <FormControlLabel
                                control={<Checkbox checked={checkSaveLogin} onChange={(e) => setCheckSaveLogin(e.target.checked)} />}
                                label="Nhớ tài khoản của tôi"
                            />
                            <Link to="/forgot" className={cx('forgot-password')}>
                                Quên Mật Khẩu ?
                            </Link>
                        </div>
                        <Button type="submit" variant="contained" fullWidth size="large" className={cx('login-button')}>
                            Đăng Nhập
                        </Button>
                    </form>
                    <div className={cx('register-link')}>
                        <Link to="/reg">Bạn Chưa Có Tài Khoản ?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
