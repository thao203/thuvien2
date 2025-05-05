import classNames from 'classnames/bind';
import styles from './ForgotPassword.module.scss';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import request from '../../config/Connect';

const cx = classNames.bind(styles);

function ForgotPassword() {
    const [masinhvien, setMasinhvien] = useState('');
    const [email, setEmail] = useState('');
    const [checkStatus, setCheckStatus] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Quên mật khẩu";
    }, []);

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const res = await request.post('/api/sendOTP', { masinhvien, email });
            if (res.status === 200) {
                setCheckStatus(true);
                toast.success('OTP đã được gửi đến email của bạn!');
            } else {
                setErrorMessage('Lỗi khi gửi OTP, vui lòng thử lại!');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Không thể gửi yêu cầu, kiểm tra lại mã sinh viên và email!';
            setErrorMessage(errorMsg);
            console.error('Error:', error); // Log lỗi
        }
        setIsLoading(false);
    };
    const handleChangePass = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const res = await request.post('/api/verifyOTP', { masinhvien, otp, newPassword });
            if (res.status === 200) {
                toast.success('Đổi mật khẩu thành công!', { autoClose: 1000 }    );
                window.location.href = '/';
            } else {
                setErrorMessage('OTP không hợp lệ hoặc đã hết hạn!');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi đổi mật khẩu, vui lòng thử lại!';
            setErrorMessage(errorMsg);
            console.error('Error:', error);
        }
        setIsLoading(false);
    };
    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                {errorMessage && <p className={cx('error')}>{errorMessage}</p>}
                {!checkStatus ? (
                    <>
                        <h2>Quên mật khẩu?</h2>
                        <div className={cx('input-group')}>
                            <TextField
                                label="Mã Sinh Viên"
                                variant="outlined"
                                size="medium"
                                fullWidth
                                value={masinhvien}
                                onChange={(e) => setMasinhvien(e.target.value)}
                            />
                            <TextField
                                label="Email"
                                variant="outlined"
                                size="medium"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            onClick={handleSubmit}
                            className={cx('submit-button')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
                        </Button>
                        <div style={{ paddingTop: '20px' }}>
                            <Link to="/">Đăng Nhập</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Mật Khẩu Mới</h2>
                        <div className={cx('input-group')}>
                            <TextField
                                label="Nhập Mật Khẩu Mới"
                                variant="outlined"
                                size="medium"
                                fullWidth
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <TextField
                                label="OTP Của Bạn"
                                variant="outlined"
                                size="medium"
                                fullWidth
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            onClick={handleChangePass}
                            className={cx('submit-button')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Thay Đổi Mật Khẩu'}
                        </Button>
                        <div style={{ paddingTop: '20px' }}>
                            <Link to="/">Đăng Nhập</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;