import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import Header from '../Header/Header';
import MainPage from './MainPage';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Thêm useLocation
import useDebounce from '../../../../customHook/useDebounce';
import request from '../../../../config/Connect';
import MenuLeft from '../MenuLeft/MenuLeft';
import Footer from '../Footer/Footer';
import ModalSugestionBooks from '../../../../Modal/ExtenBooks/ModalSugestionBooks';

const cx = classNames.bind(styles);

function HomePage() {
    const location = useLocation(); // Lấy location để kiểm tra state
    const [dataBooks, setDataBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [showModal, setShowModal] = useState(false); // Trạng thái cho modal
    const debounce = useDebounce(searchValue, 500);

    useEffect(() => {
        document.title = "Thư viện điện tử - Trang chủ";

        // Kiểm tra state từ navigate để hiển thị modal
        if (location.state?.showModal) {
            setShowModal(true);
            // Xóa state để modal không hiển thị lại khi refresh
            window.history.replaceState({}, document.title);
        }

        // Xử lý tìm kiếm sách
        try {
            if (searchValue === '') {
                // Nếu không có giá trị tìm kiếm, lấy toàn bộ sách
                request.get('/api/GetBooks').then((res) => setDataBooks(res.data));
            } else {
                // Nếu có giá trị tìm kiếm, gọi API tìm kiếm
                request
                    .get('/api/search', { params: { nameBook: debounce } })
                    .then((res) => setDataBooks(res.data));
            }
        } catch (error) {
            console.log(error);
        }
    }, [debounce, searchValue, location]); // Thêm location vào dependencies

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <Header setSearchValue={setSearchValue} />
            </header>

            <div className={cx('main-container')}>
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>

                <main className={cx('content')}>
                    <MainPage dataBooks={dataBooks} setDataBooks={setDataBooks} />
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>

            {/* Thêm ModalSugestionBooks */}
            <ModalSugestionBooks show={showModal} handleClose={handleCloseModal} />
        </div>
    );
}

export default HomePage;