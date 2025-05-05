import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalRequestBook from '../Modal/ModalRequestBook';
import ModalCart from '../Modal/ModalCart';
import request  from '../../../../../config/Connect';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Pagination,
    PaginationItem,
    IconButton, Grow, Fade, Slide,
} from '@mui/material';
import { styled } from '@mui/system';
import { keyframes } from '@emotion/react'; // Thêm import keyframes từ @emotion/react
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ITEMS_PER_PAGE = 16;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
`;

const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0); }
`;

function MainBooks({ isMenuOpen, searchQuery = '', sortOption = '' }) {
    const [showRequest, setShowRequest] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [selectedMasach, setSelectedMasach] = useState('');
    const [selectedTensach, setSelectedTensach] = useState('');
    const [selectedVitri, setSelectedVitri] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataBooks, setDataBooks] = useState([]); // Thêm state cho dataBooks
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const navigate = useNavigate();

    // Logic gọi API
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                if (searchQuery.trim() === '') {
                    const res = await request.get('/api/GetBooks');
                    setDataBooks(res.data);
                    setCurrentPage(1);
                    return;
                }

                const res = await request.get('/api/SearchProduct', {
                    params: { tensach: searchQuery },
                });

                setDataBooks(res.data);
                setCurrentPage(1);
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 404) {
                    setDataBooks([]);
                } else {
                    setDataBooks([]);
                }
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    // Lọc và sắp xếp sách
    useEffect(() => {
        const filtered = filterBooks(searchQuery);
        const sorted = sortBooks(filtered);
        setFilteredBooks(sorted);
        setCurrentPage(1);
    }, [dataBooks, searchQuery, sortOption]);

    const filterBooks = (query) => {
        if (!query) return dataBooks;

        const normalizedQuery = query
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        return dataBooks.filter((book) => {
            const normalizedTensach = book.tensach
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            const normalizedMasach = book.masach
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            const normalizedTacgia = book.tacgia
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            return (
                normalizedTensach.includes(normalizedQuery) ||
                normalizedMasach.includes(normalizedQuery) ||
                normalizedTacgia.includes(normalizedQuery)
            );
        });
    };

    const sortBooks = (books) => {
        let sortedBooks = [...books];
        switch (sortOption) {
            case 'newest':
                sortedBooks.sort((a, b) => new Date(b.ngaycapnhat) - new Date(a.ngaycapnhat));
                break;
            case 'oldest':
                sortedBooks.sort((a, b) => new Date(a.ngaycapnhat) - new Date(b.ngaycapnhat));
                break;
            case 'az':
                sortedBooks.sort((a, b) => a.tensach.localeCompare(b.tensach));
                break;
            case 'za':
                sortedBooks.sort((a, b) => b.tensach.localeCompare(a.tensach));
                break;
            case 'mostBorrowed':
                sortedBooks.sort((a, b) => {
                    const borrowA = a.vitri.reduce((sum, v) => sum + v.soluongmuon, 0);
                    const borrowB = b.vitri.reduce((sum, v) => sum + v.soluongmuon, 0);
                    return borrowB - borrowA;
                });
                break;
            default:
                break;
        }
        return sortedBooks;
    };

    useEffect(() => {
        const filtered = filterBooks(searchQuery);
        const sorted = sortBooks(filtered);
        setFilteredBooks(sorted);
        setCurrentPage(1);
    }, [dataBooks, searchQuery, sortOption]);

    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBooks = filteredBooks.slice(startIndex, endIndex);

    const handleShowRequest = (masach, tensach, vitri) => {
        setShowRequest(true);
        setSelectedMasach(masach);
        setSelectedTensach(tensach);
        setSelectedVitri(vitri || []);
    };

    const handleShowCart = (masach, tensach, vitri) => {
        setShowCart(true);
        setSelectedMasach(masach);
        setSelectedTensach(tensach);
        setSelectedVitri(vitri || []);
    };

    const handleViewDetail = (masach) => {
        navigate(`/detailbook/${masach}`);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const truncateLocation = (vitri) => {
        if (!vitri || vitri.length === 0) return '';
        const fullText = vitri.map((v) => `${v.mavitri} (${v.soluong - v.soluongmuon})`).join(', ');
        const maxLength = 50;
        return fullText.length <= maxLength ? fullText : `${fullText.substring(0, maxLength - 3)}...`;
    };

    const handleAddToCart = (cartItem) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(
            (item) => item.masach === cartItem.masach && item.mavitri === cartItem.mavitri
        );

        if (existingItem) {
            existingItem.soluong += cartItem.quantity;
        } else {
            cart.push({
                masach: cartItem.masach,
                tensach: cartItem.tensach,
                mavitri: cartItem.mavitri,
                ngaymuon: cartItem.ngaymuon,
                soluong: cartItem.quantity,
                img: cartItem.img,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const StyledCard = styled(Card)(({ theme }) => ({
        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff, #eef2f7)',
        transition: 'all 0.4s ease',
        position: 'relative',
        '&:hover': {
            transform: 'translateY(-10px) scale(1.03)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            background: 'linear-gradient(145deg, #f0faff, #e6f0fa)',
        },
        display: 'flex',
        flexDirection: 'column',
    }));

    const StyledButton = styled(Button)(({ theme }) => ({
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 'bold',
        padding: '6px 8px',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(45deg, #1e90ff, #00ced1)',
        color: '#fff',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 20px rgba(30, 144, 255, 0.5)',
            background: 'linear-gradient(45deg, #00ced1, #1e90ff)',
        },
        '&:active': {
            transform: 'translateY(0)',
            animation: `${pulse} 0.3s ease`,
        },
    }));

    const CartButton = styled(IconButton)(({ theme }) => ({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(45deg, #ff4500, #ff8c00)',
        color: '#fff',
        padding: '12px',
        zIndex: 10,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.1)',
            boxShadow: '0 6px 20px rgba(255, 69, 0, 0.5)',
            background: 'linear-gradient(45deg, #ff8c00, #ff4500)',
        },
        '&:active': {
            transform: 'translate(-50%, -50%)',
        },
    }));

    const StyledPaginationItem = styled(PaginationItem)(({ theme }) => ({
        '&.Mui-selected': {
            background: 'linear-gradient(45deg, #1e90ff, #00ced1)',
            color: '#fff',
            fontWeight: 'bold',
            animation: `${float} 2s infinite ease-in-out`,
        },
        '&:hover': {
            backgroundColor: '#1e90ff',
            color: '#fff',
            transform: 'scale(1.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
    }));

    const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
        height: 250,
        objectFit: 'contain',
        backgroundColor: '#f8fafc',
        padding: '10px',
        borderBottom: '1px solid #e0e7ff',
        transition: 'transform 0.4s ease, opacity 0.3s ease',
        [theme.breakpoints.down('sm')]: {
            height: 200,
        },
        [theme.breakpoints.down('xs')]: {
            height: 150,
        },
    }));

    const StyledTypography = styled(Typography)({
        transition: 'opacity 0.3s ease',
    });

    return (
        <Box
            sx={{
                padding: { xs: 1, sm: 2, md: 3 },
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
            }}
        >
            <Slide direction="up" in={true} timeout={800}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(1, minmax(250px, 1fr))',
                            sm: 'repeat(2, minmax(250px, 1fr))',
                            md: `repeat(${isMenuOpen ? 3 : 4}, minmax(250px, 1fr))`,
                        },
                        gap: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    {currentBooks.map((item, index) => {
                        const isHovered = hoveredCard === item.masach;
                        return (
                            <Grow
                                key={item.masach}
                                in={true}
                                timeout={500 + index * 150}
                                style={{ transformOrigin: 'bottom center' }}
                            >
                                <StyledCard
                                    onMouseEnter={() => setHoveredCard(item.masach)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <StyledCardMedia
                                        component="img"
                                        image={item.img}
                                        alt={item.tensach}
                                        sx={{ opacity: isHovered ? 0.3 : 1 }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, padding: { xs: 1, sm: 2 } }}>
                                        <StyledTypography
                                            variant="h6"
                                            component="div"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 'bold',
                                                color: '#1e90ff',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                                opacity: isHovered ? 0.3 : 1,
                                            }}
                                        >
                                            {item.tensach}
                                        </StyledTypography>
                                        <StyledTypography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 0.5,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                opacity: isHovered ? 0.3 : 1,
                                            }}
                                        >
                                            <strong>Mã Sách:</strong> {item.masach}
                                        </StyledTypography>
                                        <StyledTypography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 0.5,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                opacity: isHovered ? 0.3 : 1,
                                            }}
                                        >
                                            <strong>Tác Giả:</strong> {item.tacgia}
                                        </StyledTypography>
                                        <StyledTypography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 0.5,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                opacity: isHovered ? 0.3 : 1,
                                            }}
                                        >
                                            <strong>Nhà xuất bản:</strong> {item.nhaxuatban}
                                        </StyledTypography>
                                        <StyledTypography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 0.5,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                opacity: isHovered ? 0.3 : 1,
                                            }}
                                        >
                                            <strong>Tổng số sách:</strong> {item.Tongsoluong}
                                        </StyledTypography>
                                        {item.vitri && item.vitri.length > 0 && (
                                            <StyledTypography
                                                variant="body2"
                                                color="text.secondary"
                                                title={item.vitri
                                                    .map((v) => `${v.mavitri} (${v.soluong - v.soluongmuon})`)
                                                    .join(', ')}
                                                sx={{
                                                    mb: 0.5,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    opacity: isHovered ? 0.3 : 1,
                                                }}
                                            >
                                                <strong>Vị trí:</strong> {truncateLocation(item.vitri)}
                                            </StyledTypography>
                                        )}
                                        <Box
                                            mt={2}
                                            display="flex"
                                            justifyContent="space-between"
                                            sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}
                                        >
                                            <StyledButton
                                                size="small"
                                                color="info"
                                                onClick={() => handleViewDetail(item.masach)}
                                                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                            >
                                                Xem Chi Tiết
                                            </StyledButton>
                                            <StyledButton
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleShowRequest(item.masach, item.tensach, item.vitri)}
                                                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                            >
                                                Gửi Yêu Cầu
                                            </StyledButton>
                                        </Box>
                                    </CardContent>
                                    {isHovered && (
                                        <Fade in={isHovered} timeout={300}>
                                            <CartButton
                                                onClick={() =>
                                                    handleShowCart(item.masach, item.tensach, item.vitri)
                                                }
                                            >
                                                <ShoppingCartIcon fontSize="large" />
                                            </CartButton>
                                        </Fade>
                                    )}
                                </StyledCard>
                            </Grow>
                        );
                    })}
                </Box>
            </Slide>

            {totalPages > 1 && (
                <Slide direction="up" in={true} timeout={1200}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            renderItem={(item) => <StyledPaginationItem {...item} />}
                            sx={{
                                '& .MuiPagination-ul': {
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        />
                    </Box>
                </Slide>
            )}

            <ModalRequestBook
                show={showRequest}
                setShow={setShowRequest}
                masach={selectedMasach}
                tensach={selectedTensach}
                vitri={selectedVitri}
            />

            <ModalCart
                show={showCart}
                setShow={setShowCart}
                masach={selectedMasach}
                tensach={selectedTensach}
                vitri={selectedVitri}
                img={currentBooks.find((book) => book.masach === selectedMasach)?.img || ''}
                onAddToCart={handleAddToCart}
            />
        </Box>
    );
}

export default MainBooks;