import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
    Divider,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ModalCart from '../Modal/ModalCart';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import MenuLeft from '../../MenuLeft/MenuLeft';
import styles from './listbook.module.scss';

const cx = classNames.bind(styles);

const Cart = () => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [selectedItems, setSelectedItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);

    const toastOptions = {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const handleAddToCart = (cartItem) => {
        const existingItem = cartItems.find(
            (item) => item.masach === cartItem.masach && item.mavitri === cartItem.mavitri
        );
        if (existingItem) {
            setCartItems(
                cartItems.map((item) =>
                    item.masach === cartItem.masach && item.mavitri === cartItem.mavitri
                        ? { ...item, soluong: item.soluong + cartItem.quantity }
                        : item
                )
            );
        } else {
            setCartItems([...cartItems, { ...cartItem, soluong: cartItem.quantity }]);
        }
    };

    const openCartModal = (book) => {
        setCurrentBook(book);
        setShowModal(true);
    };

    const increaseQuantity = (masach, mavitri) => {
        setCartItems(
            cartItems.map((item) =>
                item.masach === masach && item.mavitri === mavitri
                    ? { ...item, soluong: item.soluong + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (masach, mavitri) => {
        setCartItems(
            cartItems.map((item) =>
                item.masach === masach && item.mavitri === mavitri && item.soluong > 1
                    ? { ...item, soluong: item.soluong - 1 }
                    : item
            )
        );
    };

    const removeItem = (masach, mavitri) => {
        setCartItems(
            cartItems.filter((item) => !(item.masach === masach && item.mavitri === mavitri))
        );
        setSelectedItems(selectedItems.filter((id) => id !== `${masach}-${mavitri}`));
    };

    const clearCart = () => {
        setCartItems([]);
        setSelectedItems([]);
        toast.info('Giỏ hàng đã được xóa!', toastOptions);
    };

    const handleCheckout = async () => {
        try {
            const selectedCartItems = cartItems.filter((item) =>
                selectedItems.includes(`${item.masach}-${item.mavitri}`)
            );

            if (selectedCartItems.length === 0) {
                toast.error('Vui lòng chọn ít nhất một mục để mượn sách!', toastOptions);
                return;
            }

            // Nhóm các item theo ngày mượn
            const groupedByDate = selectedCartItems.reduce((acc, item) => {
                const date = item.ngaymuon;
                if (!date) {
                    toast.error(`Vui lòng cung cấp ngày mượn cho sách ${item.tensach}!`, toastOptions);
                    return acc;
                }
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push({
                    masach: item.masach,
                    mavitri: item.mavitri,
                    soluong: item.soluong,
                });
                return acc;
            }, {});

            // Kiểm tra nếu không có item nào được nhóm (do lỗi ngày mượn)
            if (Object.keys(groupedByDate).length === 0) {
                return;
            }

            // Tạo và gửi từng phiếu mượn
            const borrowRequests = Object.keys(groupedByDate).map(async (ngaymuon) => {
                const books = groupedByDate[ngaymuon];
                const payload = [...books, { ngaymuon }];

                const response = await request.post('/api/requestborrowbook', payload, {
                    withCredentials: true,
                });

                return response;
            });

            // Chờ tất cả các yêu cầu hoàn tất
            const responses = await Promise.all(borrowRequests);

            // Kiểm tra kết quả
            const allSuccessful = responses.every((response) => response.status === 200);

            if (allSuccessful) {
                toast.success('Tất cả yêu cầu mượn sách đã được gửi thành công!', toastOptions);

                // Trì hoãn xóa giỏ hàng để đảm bảo thông báo được hiển thị
                setTimeout(() => {
                    setCartItems(
                        cartItems.filter(
                            (item) => !selectedItems.includes(`${item.masach}-${item.mavitri}`)
                        )
                    );
                    setSelectedItems([]);
                }, toastOptions.autoClose + 500);
            } else {
                toast.error('Một số yêu cầu mượn sách thất bại!', toastOptions);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu mượn sách!';
            toast.error(errorMessage, toastOptions);
        }
    };

    const toggleItemSelection = (masach, mavitri) => {
        const itemId = `${masach}-${mavitri}`;
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => `${item.masach}-${item.mavitri}`));
        }
    };

    const CartContainer = styled(Box)(({ theme }) => ({
        padding: theme.spacing(3),
        backgroundColor: '#f5f5f5',
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
        },
    }));

    const CartPaper = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(3),
        borderRadius: '16px',
        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(145deg, #ffffff, #eef2f7)',
        marginBottom: theme.spacing(3),
    }));

    const CartItem = styled(Box)(({ theme, isSelected }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2),
        borderBottom: '1px solid #e0e7ff',
        backgroundColor: isSelected ? '#e6f0fa' : 'transparent',
        '&:last-child': {
            borderBottom: 'none',
        },
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: theme.spacing(2),
        },
    }));

    const QuantityControls = styled(Box)(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginLeft: 'auto',
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
        },
    }));

    const StyledButton = styled(Button)(({ theme }) => ({
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #1e90ff, #00ced1)',
        color: '#fff',
        padding: theme.spacing(1, 3),
        marginLeft: theme.spacing(2),
    }));

    const IconBtn = styled(IconButton)(({ theme }) => ({
        backgroundColor: '#e0e7ff',
        color: '#1e90ff',
    }));

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
                    <CartContainer>
                        <ToastContainer />
                        {currentBook && (
                            <ModalCart
                                show={showModal}
                                setShow={setShowModal}
                                masach={currentBook.masach}
                                tensach={currentBook.tensach}
                                vitri={currentBook.vitri}
                                onAddToCart={handleAddToCart}
                            />
                        )}

                        {cartItems.length === 0 ? (
                            <Typography
                                variant="h6"
                                sx={{ textAlign: 'center', color: '#666' }}
                            >
                                Giỏ hàng trống
                            </Typography>
                        ) : (
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    selectedItems.length === cartItems.length &&
                                                    cartItems.length > 0
                                                }
                                                onChange={toggleSelectAll}
                                                color="primary"
                                            />
                                        }
                                        label="Chọn tất cả"
                                    />
                                    <StyledButton
                                        variant="contained"
                                        onClick={clearCart}
                                        sx={{
                                            background: 'linear-gradient(45deg, #d32f2f, #ff5252)',
                                        }}
                                    >
                                        Xóa tất cả
                                    </StyledButton>
                                </Box>
                                {cartItems.map((item) => (
                                    <CartPaper key={`${item.masach}-${item.mavitri}`} elevation={0}>
                                        <CartItem
                                            isSelected={selectedItems.includes(
                                                `${item.masach}-${item.mavitri}`
                                            )}
                                        >
                                            <Checkbox
                                                checked={selectedItems.includes(
                                                    `${item.masach}-${item.mavitri}`
                                                )}
                                                onChange={() =>
                                                    toggleItemSelection(item.masach, item.mavitri)
                                                }
                                                color="primary"
                                            />
                                            <Box
                                                component="img"
                                                src={item.img || 'https://via.placeholder.com/80'}
                                                alt={item.tensach}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    objectFit: 'contain',
                                                    mr: 2,
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f8fafc',
                                                    p: 1,
                                                }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#1e90ff',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {item.tensach}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#666' }}
                                                >
                                                    Mã sách: {item.masach}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#666' }}
                                                >
                                                    Vị trí: {item.mavitri}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#666' }}
                                                >
                                                    Ngày mượn: {item.ngaymuon}
                                                </Typography>
                                            </Box>
                                            <QuantityControls>
                                                <IconBtn
                                                    size="small"
                                                    onClick={() =>
                                                        decreaseQuantity(item.masach, item.mavitri)
                                                    }
                                                    disabled={item.soluong <= 1}
                                                >
                                                    <RemoveIcon />
                                                </IconBtn>
                                                <Typography
                                                    sx={{ minWidth: 30, textAlign: 'center' }}
                                                >
                                                    {item.soluong}
                                                </Typography>
                                                <IconBtn
                                                    size="small"
                                                    onClick={() =>
                                                        increaseQuantity(item.masach, item.mavitri)
                                                    }
                                                >
                                                    <AddIcon />
                                                </IconBtn>
                                                <IconBtn
                                                    size="small"
                                                    onClick={() =>
                                                        removeItem(item.masach, item.mavitri)
                                                    }
                                                    sx={{
                                                        backgroundColor: '#ffebee',
                                                        color: '#d32f2f',
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconBtn>
                                            </QuantityControls>
                                        </CartItem>
                                    </CartPaper>
                                ))}
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ textAlign: 'right' }}>
                                    <StyledButton
                                        variant="contained"
                                        onClick={handleCheckout}
                                    >
                                        Mượn sách
                                    </StyledButton>
                                </Box>
                            </Box>
                        )}
                    </CartContainer>
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
};

export default Cart;