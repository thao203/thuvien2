import classNames from 'classnames/bind';
import styles from './listbook.module.scss';
import Header from '../../Header/Header';
import { useEffect, useState } from 'react';
import useDebounce from '../../../../../customHook/useDebounce';
import request from '../../../../../config/Connect';
import MenuLeft from '../../MenuLeft/MenuLeft';
import Footer from '../../Footer/Footer';
import MainBooks from './Mainbook';

const cx = classNames.bind(styles);

function ListBook() {
    const [dataBooks, setDataBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const debounce = useDebounce(searchValue, 500);
    const [sortOption, setSortOption] = useState('');

    useEffect(() => {
        document.title = "Danh sách sách";
        request
            .get('/api/GetBooks')
            .then((res) => {
                setDataBooks(res.data);
            })
            .catch((error) => console.error(error));
    }, []);
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                if (searchValue.trim() === '') {
                    const res = await request.get('/api/GetBooks');
                    setDataBooks(res.data);
                    return;
                }

                const res = await request.get('/api/SearchProduct', {
                    params: { tensach: debounce },
                });

                setDataBooks(res.data);
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 404) {
                    setDataBooks([]);
                } else {
                    setDataBooks([]);
                }
            }
        };

        fetchSearchResults();
    }, [debounce]);

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <Header setSearchValue={setSearchValue} setSortOption={setSortOption} />
            </header>

            <div className={cx('main-container')}>
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>

                <main className={cx('content')}>
                    <MainBooks
                        dataBooks={dataBooks}
                        searchQuery={searchValue}
                        sortOption={sortOption}
                        isMenuOpen={false}
                    />
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
}

export default ListBook;