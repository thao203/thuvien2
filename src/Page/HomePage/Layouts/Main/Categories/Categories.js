import classNames from 'classnames/bind';
import styles from './Categories.module.scss';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import MenuLeft from '../../MenuLeft/MenuLeft';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../../../../config/Connect';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Pagination,
    PaginationItem,
    Grow,
    Fade,
    ButtonBase
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { motion } from 'framer-motion';

const cx = classNames.bind(styles);

const gradientColors = [
    'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)',
    'linear-gradient(135deg, #80deea 0%, #26c6da 100%)',
    'linear-gradient(135deg, #26c6da 0%, #0288d1 100%)',
    'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    'linear-gradient(135deg, #01579b 0%, #e0f7fa 100%)',
];

const representativeColors = [
    '#b0f2f2', '#53b2e2', '#15a7d6', '#016fb6', '#70a9cd'
];

const ITEMS_PER_PAGE = 16;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;
const StyledPaginationItem = styled(PaginationItem)(({ theme }) => ({
    '&.Mui-selected': {
        background: 'linear-gradient(45deg, #1e90ff, #00ced1)', // Gradient nền khi được chọn
        color: '#fff', // Màu chữ trắng
        fontWeight: 'bold', // Chữ đậm
        animation: `${float} 2s infinite ease-in-out`, // Hiệu ứng nổi lặp vô hạn
    },
    '&:hover': {
        backgroundColor: '#1e90ff', // Màu nền khi hover
        color: '#fff', // Màu chữ trắng
        transform: 'scale(1.15)', // Phóng to 115%
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Đổ bóng khi hover
    },
}));

const getRandomGradient = () => {
    const randomIndex = Math.floor(Math.random() * gradientColors.length);
    return {
        gradient: gradientColors[randomIndex],
        baseColor: representativeColors[randomIndex]
    };
};

// Hàm chuyển hex sang RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
};

// Hàm tính độ sáng (luminance)
const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const { r, g, b } = rgb;
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

// Hàm chọn màu chữ dựa trên độ sáng
const getTextColor = (baseColor) => {
    const luminance = getLuminance(baseColor);
    return luminance > 0.5 ? '#333' : '#fff';
};

function Categories() {
    const [categories, setCategories] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetchAllCategories = async () => {
        try {
            const res = await request.get('/api/getAllCategories');
            setCategories(res.data.data);
            setCurrentPage(1);
        } catch (error) {
            setCategories([]);
        }
    };

    const searchCategoriesByName = async (query) => {
        try {
            const res = await request.get('/api/searchCategories', {
                params: { tendanhmuc: query },
            });
            setCategories(res.data.data);
            setCurrentPage(1);
        } catch (error) {
            setCategories([]);
        }
    };

    useEffect(() => {
        document.title = "Danh mục sách";
        if (searchValue.trim() === '') {
            fetchAllCategories();
        } else {
            searchCategoriesByName(searchValue);
        }
    }, [searchValue]);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCategories = categories.slice(startIndex, endIndex);

    const handleViewDetailCategory = (madanhmuc) => {
        navigate(`/detailCategory/${madanhmuc}`);
    };

    const handlePageChange = (event
        , value) => {
        setCurrentPage(value);
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
                    <Box sx={{ padding: 4 }}>
                        <Fade in={true} timeout={800}>
                            <Typography
                                variant="h4"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    color: '#1a237e',
                                    mb: 4,
                                    textTransform: 'uppercase',
                                    letterSpacing: 2,
                                    background: 'linear-gradient(45deg, #0288d1, #7b1fa2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Danh Mục Sách
                            </Typography>
                        </Fade>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 3,
                                maxWidth: '1400px',
                                mx: 'auto'
                            }}
                        >
                            {currentCategories.length > 0 ? (
                                currentCategories.map((category, index) => {
                                    const { gradient: gradientBg, baseColor } = getRandomGradient();
                                    const textColor = getTextColor(baseColor);

                                    return (
                                        <Grow
                                            in={true}
                                            timeout={600 + index * 150}
                                            key={category.madanhmuc}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05, rotate: 1 }}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <ButtonBase
                                                    component="div"
                                                    onClick={() => handleViewDetailCategory(category.madanhmuc)}
                                                    sx={{ width: '100%', borderRadius: 4 }}
                                                >
                                                    <Card
                                                        sx={{
                                                            width: '100%',
                                                            background: gradientBg,
                                                            borderRadius: 4,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                            overflow: 'hidden',
                                                            position: 'relative',
                                                            '&:hover': {
                                                                boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
                                                                '& .overlay': {
                                                                    opacity: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Box
                                                            className="overlay"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                background: 'rgba(0,0,0,0.2)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                        </Box>

                                                        <CardContent sx={{ padding: 3, position: 'relative' }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: textColor,
                                                                    fontWeight: 700,
                                                                    mb: 1,
                                                                    textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {category.tendanhmuc || 'Không có tên'}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: `${textColor}cc`,
                                                                    fontSize: '0.9rem',
                                                                    fontStyle: 'italic'
                                                                }}
                                                            >
                                                                Mã: {category.madanhmuc || 'N/A'}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </ButtonBase>
                                            </motion.div>
                                        </Grow>
                                    );
                                })
                            ) : (
                                <Fade in={true} timeout={1000}>
                                    <Box
                                        sx={{
                                            gridColumn: '1 / -1',
                                            textAlign: 'center',
                                            py: 6,
                                            background: 'rgba(255,255,255,0.8)',
                                            borderRadius: 4,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: '#d32f2f',
                                                fontWeight: 600
                                            }}
                                        >
                                            Không tìm thấy danh mục nào
                                        </Typography>
                                    </Box>
                                </Fade>
                            )}
                        </Box>

                        {totalPages > 1 && (
                            <Fade in={true} timeout={1200}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 5,
                                    pb: 2
                                }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                        renderItem={(item) => <StyledPaginationItem {...item} />}
                                        sx={{
                                            '& .MuiPagination-ul': {
                                                background: '#fff', // Nền trắng
                                                borderRadius: '12px', // Bo góc 12px
                                                padding: '8px', // Đệm 8px
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Đổ bóng nhẹ
                                            },
                                        }}
                                    />
                                </Box>
                            </Fade>
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

export default Categories;