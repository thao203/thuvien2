import classNames from 'classnames/bind';
import styles from './HistoryBook.module.scss';
import Header from '../../Header/Header';
import MenuLeft from '../../MenuLeft/MenuLeft';
import Footer from '../../Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faBook } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Chip,
    Fade,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Modal,
    Box,
    Button as MuiButton,
} from '@mui/material';

const cx = classNames.bind(styles);

// Toast configuration
const toastOptions = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

function HistoryBook() {
    const token = document.cookie;
    const [dataBooks, setDataBooks] = useState([]);
    const [masinhvien, setMasinhvien] = useState('');
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [selectedMaphieumuon, setSelectedMaphieumuon] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        overflowX: 'auto',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%',
        },
    }));

    const StyledTableHead = styled(TableHead)(({ theme }) => ({
        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        '& th': {
            color: '#fff',
            fontWeight: 600,
            padding: theme.spacing(2),
            borderBottom: 'none',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
            whiteSpace: 'nowrap',
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:hover': {
            backgroundColor: theme.palette.grey[100],
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
        },
        transition: 'all 0.2s ease-in-out',
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        padding: theme.spacing(1.5),
        fontSize: { xs: '0.7rem', sm: '0.875rem' },
        whiteSpace: 'nowrap',
    }));

    const ModalBox = styled(Box)(({ theme }) => ({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        maxWidth: 1200,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 24,
        padding: theme.spacing(6),
        borderRadius: 16,
        maxHeight: '90vh',
        overflowY: 'auto',
    }));

    useEffect(() => {
        document.title = 'Lịch sử mượn';
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Hàm tính số ngày quá hạn
    const calculateOverdueDays = (dueDate, isReturned = false, savedOverdueDays = 0, returnDate = null) => {
        if (isReturned && savedOverdueDays !== undefined) {
            return savedOverdueDays; // Sử dụng số ngày quá hạn đã lưu
        }
        if (!dueDate || isReturned) return 0;
        try {
            const today = new Date();
            const due = new Date(dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - due.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        } catch {
            return 0;
        }
    };

    const handleExtendAllBooks = async (maphieumuon) => {
        try {
            const borrowingSlip = dataBooks.find(item => item.maphieumuon === maphieumuon);
            if (!borrowingSlip) {
                toast.error('Không tìm thấy phiếu mượn!', toastOptions);
                return;
            }

            const booksToExtend = borrowingSlip.books.filter(
                book => !book.tinhtrang && !book.giahan
            );

            if (booksToExtend.length === 0) {
                toast.info('Không có sách nào cần gia hạn!', toastOptions);
                return;
            }

            const extensionPromises = booksToExtend.map(book =>
                request.post('/api/ExtendBorrowing', { maphieumuon, masach: book.masach })
            );

            const responses = await Promise.all(extensionPromises);

            const allSuccessful = responses.every(response => response.status === 200);
            if (allSuccessful) {
                toast.success('Gia hạn tất cả sách thành công!', toastOptions);
                fetchDataAndUpdate();
            } else {
                toast.error('Có lỗi xảy ra khi gia hạn một số sách!', toastOptions);
            }
        } catch (error) {
            console.error('Lỗi khi gia hạn tất cả sách:', error);
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gia hạn!', toastOptions);
        }
    };

    const handleExtendBorrowing = async (maphieumuon, masach) => {
        try {
            const response = await request.post('/api/ExtendBorrowing', { maphieumuon, masach });
            toast.success(response.data.message, toastOptions);
            if (response.status === 200) {
                setSelectedBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.masach === masach
                            ? {
                                ...book,
                                giahan: true,
                                newngayhentra: response.data.newngayhentra || new Date().toISOString(),
                            }
                            : book
                    )
                );
                fetchDataAndUpdate();
            }
        } catch (error) {
            console.error('Lỗi khi gia hạn sách:', error);
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gia hạn!', toastOptions);
        }
    };

    const fetchDataAndUpdate = async () => {
        if (token && masinhvien) {
            try {
                const response = await request.get('/api/GetBorrowsByStudent', {
                    params: { masinhvien },
                });
                const data = response.data.data || [];
                // Tính toán overdueDays cho sách đã trả
                const updatedData = data.map((record) => ({
                    ...record,
                    books: record.books.map((book) => {
                        if (book.tinhtrang && book.ngaytra) {
                            const dueDate = new Date(book.ngayhentra || record.ngayhentra);
                            const returnDate = new Date(book.ngaytra);
                            dueDate.setHours(0, 0, 0, 0);
                            returnDate.setHours(0, 0, 0, 0);
                            const diffTime = returnDate.getTime() - dueDate.getTime();
                            const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            return {
                                ...book,
                                overdueDays: overdueDays > 0 ? overdueDays : 0,
                            };
                        }
                        return book;
                    }),
                }));
                setDataBooks(updatedData);
            } catch (error) {
                setDataBooks([]);
            }
        }
    };

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setMasinhvien(decoded.masinhvien);
            } catch (error) {
                console.error('Lỗi khi giải mã token:', error);
            }
        }
    }, [token]);

    useEffect(() => {
        fetchDataAndUpdate();
    }, [masinhvien, token]);

    const handleOpenModal = (books, maphieumuon) => {
        setSelectedBooks(books);
        setSelectedMaphieumuon(maphieumuon);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBooks([]);
        setSelectedMaphieumuon('');
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
                    <div className="container mt-4">
                        <StyledTableContainer component={Paper}>
                            <Table>
                                <StyledTableHead>
                                    <TableRow>
                                        <StyledTableCell>Mã Phiếu</StyledTableCell>
                                        <StyledTableCell>Ngày Mượn</StyledTableCell>
                                        <StyledTableCell>Ngày Hẹn Trả</StyledTableCell>
                                        <StyledTableCell>Quá Hạn</StyledTableCell>
                                        <StyledTableCell>Tình Trạng</StyledTableCell>
                                        <StyledTableCell>Hành Động</StyledTableCell>
                                    </TableRow>
                                </StyledTableHead>
                                <TableBody>
                                    {dataBooks.map((item, index) => {
                                        const hasOverdue = item.books.some(book =>
                                            book.tinhtrang
                                                ? book.overdueDays > 0
                                                : calculateOverdueDays(book.ngayhentra || item.ngayhentra, book.tinhtrang) > 0
                                        );
                                        const maxOverdueDays = Math.max(
                                            ...item.books.map(book =>
                                                book.tinhtrang
                                                    ? book.overdueDays
                                                    : calculateOverdueDays(book.ngayhentra || item.ngayhentra, book.tinhtrang)
                                            ),
                                            0
                                        );

                                        return (
                                            <Fade in timeout={400 + index * 100} key={index}>
                                                <StyledTableRow>
                                                    <StyledTableCell>{item?.maphieumuon || 'N/A'}</StyledTableCell>
                                                    <StyledTableCell>{formatDate(item?.ngaymuon)}</StyledTableCell>
                                                    <StyledTableCell>{formatDate(item?.ngayhentra)}</StyledTableCell>
                                                    <StyledTableCell>
                                                        {hasOverdue ? (
                                                            <Chip
                                                                label={`${maxOverdueDays} ngày`}
                                                                color="error"
                                                                size="small"
                                                            />
                                                        ) : (
                                                            'Không'
                                                        )}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {item.books.every(book => book.tinhtrang) ? (
                                                            <Chip
                                                                icon={<FontAwesomeIcon icon={faCheck} />}
                                                                label="Đã trả"
                                                                color="success"
                                                                size="small"
                                                            />
                                                        ) : (
                                                            <Chip
                                                                icon={
                                                                    <FontAwesomeIcon
                                                                        icon={faSpinner}
                                                                        className="fa-spin"
                                                                    />
                                                                }
                                                                label="Đang mượn"
                                                                color="warning"
                                                                size="small"
                                                            />
                                                        )}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {!item.books.every(book => book.tinhtrang) &&
                                                            !item.books.every(book => book.giahan) ? (
                                                                <MuiButton
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() =>
                                                                        handleExtendAllBooks(item?.maphieumuon)
                                                                    }
                                                                    sx={{
                                                                        borderRadius: 20,
                                                                        textTransform: 'none',
                                                                        background:
                                                                            'linear-gradient(45deg, #1976d2, #42a5f5)',
                                                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                                        padding: { xs: '4px 8px', sm: '6px 12px' },
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)',
                                                                            transition: 'all 0.2s',
                                                                        },
                                                                    }}
                                                                >
                                                                    Gia Hạn Tất Cả
                                                                </MuiButton>
                                                            ) : item.books.some(book => book.giahan) &&
                                                            !item.books.every(book => book.tinhtrang) ? (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                                    }}
                                                                >
                                                                    Đã gia hạn
                                                                </Typography>
                                                            ) : null}
                                                            <MuiButton
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleOpenModal(item.books, item.maphieumuon)
                                                                }
                                                                sx={{
                                                                    borderRadius: 20,
                                                                    textTransform: 'none',
                                                                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                                    padding: { xs: '4px 8px', sm: '6px 12px' },
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        transition: 'all 0.2s',
                                                                    },
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faBook} style={{ marginRight: 4 }} />
                                                                Chi tiết
                                                            </MuiButton>
                                                        </div>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            </Fade>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    </div>
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>

            <Modal open={openModal} onClose={handleCloseModal}>
                <ModalBox>
                    <Typography variant="h6" gutterBottom>
                        Chi tiết sách mượn (Phiếu: {selectedMaphieumuon})
                    </Typography>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <StyledTableCell>Mã Sách</StyledTableCell>
                                <StyledTableCell>Tên Sách</StyledTableCell>
                                <StyledTableCell>Vị Trí</StyledTableCell>
                                <StyledTableCell>Số Lượng</StyledTableCell>
                                <StyledTableCell>Quá Hạn</StyledTableCell>
                                <StyledTableCell>Ngày Trả</StyledTableCell>
                                <StyledTableCell>Ngày Hẹn Trả Mới</StyledTableCell>
                                <StyledTableCell>Tình Trạng</StyledTableCell>
                                <StyledTableCell>Hành Động</StyledTableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {selectedBooks.map((book, index) => {
                                const dueDate = book.ngayhentra || dataBooks.find(item => item.maphieumuon === selectedMaphieumuon)?.ngayhentra;
                                const overdueDays = calculateOverdueDays(dueDate, book.tinhtrang, book.overdueDays);
                                return (
                                    <TableRow key={index}>
                                        <StyledTableCell>{book.masach}</StyledTableCell>
                                        <StyledTableCell>{book.tensach}</StyledTableCell>
                                        <StyledTableCell>{book.mavitri}</StyledTableCell>
                                        <StyledTableCell>{book.soluong}</StyledTableCell>
                                        <StyledTableCell>
                                            {overdueDays > 0 ? (
                                                <Chip
                                                    label={`${overdueDays} ngày`}
                                                    color="error"
                                                    size="small"
                                                />
                                            ) : (
                                                'Không'
                                            )}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {book.ngaytra ? formatDate(book.ngaytra) : 'Chưa trả'}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {book.giahan && book.newngayhentra
                                                ? formatDate(book.newngayhentra)
                                                : 'N/A'}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {book.tinhtrang ? (
                                                <Chip
                                                    icon={<FontAwesomeIcon icon={faCheck} />}
                                                    label="Đã trả"
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<FontAwesomeIcon icon={faSpinner} className="fa-spin" />}
                                                    label="Đang mượn"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {!book.tinhtrang && !book.giahan ? (
                                                <MuiButton
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleExtendBorrowing(selectedMaphieumuon, book.masach)}
                                                    sx={{
                                                        borderRadius: 20,
                                                        textTransform: 'none',
                                                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                        padding: { xs: '4px 8px', sm: '6px 12px' },
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            transition: 'all 0.2s',
                                                        },
                                                    }}
                                                >
                                                    Gia Hạn
                                                </MuiButton>
                                            ) : book.giahan && !book.tinhtrang ? (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                                >
                                                    Đã gia hạn
                                                </Typography>
                                            ) : null}
                                        </StyledTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <MuiButton
                        variant="contained"
                        onClick={handleCloseModal}
                        sx={{ mt: 2, float: 'right' }}
                    >
                        Đóng
                    </MuiButton>
                </ModalBox>
            </Modal>

            <ToastContainer {...toastOptions} />
        </div>
    );
}

export default HistoryBook;