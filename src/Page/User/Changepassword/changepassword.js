import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ChangePassword.module.scss';
import Header from '../../HomePage/Layouts/Header/Header';
import MenuLeft from '../../HomePage/Layouts/MenuLeft/MenuLeft';
import Footer from '../../HomePage/Layouts/Footer/Footer';
import request from '../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

export const requestChangePassword = async ({ oldPass, newPass, confirmNewPass }) => {
    const res = await request.put('/api/changePassword', { oldPass, newPass, confirmNewPass });
    return res.data;
};

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        document.title = "Đổi mật khẩu";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await requestChangePassword({
                oldPass: oldPassword,
                newPass: newPassword,
                confirmNewPass: confirmPassword
            });
            toast.success(response.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            // Xử lý lỗi chi tiết dựa trên mã trạng thái từ backend
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu!';
            toast.error(errorMessage);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header className={cx('header')}>
                <Header />
            </header>
            <div className={cx('main-container')}>
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>
                <main className={cx('content')}>
                    <h2>Thay Đổi Mật Khẩu</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={cx('input-group')}>
                            <label>Mật khẩu cũ</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={cx('input-group')}>
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={cx('input-group')}>
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={cx('btn-submit')}>Xác nhận</button>
                    </form>
                </main>
            </div>
            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
}

export default ChangePassword;