import classNames from 'classnames/bind';
import styles from './DetailCategory.module.scss';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import MenuLeft from '../../MenuLeft/MenuLeft';
import MainBooks from '../ListBook/Mainbook';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../../../../../config/Connect';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const cx = classNames.bind(styles);

function DetailCategory() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { madanhmuc } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = madanhmuc ? `Sách danh mục ${madanhmuc}` : 'Sách theo danh mục';

        const fetchBooksByCategory = async () => {
            setLoading(true);
            setError(null);

            if (!madanhmuc) {
                setBooks([]);
                setError('Không có mã danh mục');
                setLoading(false);
                return;
            }

            try {
                const booksRes = await request.get('/api/getBooksByCategory', {
                    params: { madanhmuc },
                });

                setBooks(booksRes.data?.books || []);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setError('Không có sách tại danh mục này.');
                setBooks([]);
            } finally {
                setTimeout(() => setLoading(false), 300); // Độ trễ tối thiểu 300ms
            }
        };

        fetchBooksByCategory();
    }, [madanhmuc]);

    const handleBack = () => {
        navigate('/categories');
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <Header />
            </header>

            <div className={cx('main-container')}>
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>

                <main className={cx('content')}>
                    <Box sx={{ padding: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3,
                                position: 'relative',
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                aria-label="Quay lại danh sách danh mục"
                                sx={{
                                    borderColor: '#3498DB',
                                    color: '#3498DB',
                                    '&:hover': { borderColor: '#2C3E50', color: '#2C3E50' },
                                    textTransform: 'none',
                                    zIndex: 10,
                                }}
                            >
                                Quay lại
                            </Button>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#2C3E50',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5,
                                    borderBottom: '3px solid #3498DB',
                                    paddingBottom: '5px',
                                    flexGrow: 1,
                                }}
                            >
                                📚 Danh mục: {madanhmuc || 'Sách'}
                            </Typography>

                            <Box sx={{ width: '80px' }} />
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, color: '#d32f2f' }}>
                                {error}
                            </Typography>
                        ) : books.length > 0 ? (
                            <MainBooks dataBooks={books} isMenuOpen={true} />
                        ) : (
                            <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                                Không có sách nào trong danh mục này.
                            </Typography>
                        )}
                    </Box>
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailCategory;