import classNames from 'classnames/bind';
import styles from '../../Page/HomePage/Layouts/Main/DetaiBook/detailbook.module.scss';
import { useEffect, useState } from 'react';
import request from '../../../src/config/Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Box, Modal, Typography } from '@mui/material';

const cx = classNames.bind(styles);

const DetailBookModal = ({ open, onClose, masach }) => {
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Hàm giới hạn văn bản mô tả
    const truncateDescription = (text, maxLength = 200) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    // Gọi API để lấy thông tin sách
    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await request.get('/api/SearchBookByMaSach', {
                    params: { masach },
                });
                setBook(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi kết nối');
            } finally {
                setLoading(false);
            }
        };

        if (open && masach) {
            setBook(null); // Reset book để tránh hiển thị dữ liệu cũ
            fetchBook();
        }
    }, [masach, open]);

    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="book-detail-modal"
            aria-describedby="book-detail-description"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box
                sx={{
                    width: '900px',
                    maxHeight: '700px',
                    overflowY: 'auto',
                    bgcolor: 'white',
                    borderRadius: '4px',
                    boxShadow: 12,
                    p: 2,
                }}
            >
                {loading ? (
                    <Typography className="text-center text-muted py-5">
                        <i className="bi bi-hourglass-split me-2"></i>Đang tải...
                    </Typography>
                ) : error ? (
                    <Typography className="text-danger text-center py-5">
                        <i className="bi bi-exclamation-triangle me-2"></i>{error}
                    </Typography>
                ) : !book ? (
                    <Typography className="text-center text-muted py-5">
                        <i className="bi bi-book me-2"></i>Không tìm thấy sách.
                    </Typography>
                ) : (
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="row g-0">
                            <div className="col-md-4 p-4">
                                <img
                                    src={book.img}
                                    alt={book.tensach}
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                                />
                            </div>
                            <div className="col-md-8 p-4">
                                <h1 className="fw-bold mb-4 text-primary" style={{ fontSize: '1.5rem' }}>
                                    <i className="bi bi-book me-2"></i>{book.tensach}
                                </h1>
                                <div className="row">
                                    <div className="col-md-6">
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong><i className="bi bi-upc-scan me-2"></i>Mã sách:</strong>{' '}
                                                <span>{book.masach}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-person-fill me-2"></i>Tác giả:</strong>{' '}
                                                <span>{book.tacgia}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-building me-2"></i>Nhà xuất bản:</strong>{' '}
                                                <span>{book.nhaxuatban}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-tags-fill me-2"></i>Phiên bản:</strong>{' '}
                                                <span>{book.phienban}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-bookmark-fill me-2"></i>Danh mục:</strong>{' '}
                                                <span>{book.tendanhmuc}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-calendar-event me-2"></i>Năm xuất bản:</strong>{' '}
                                                <span>{book.namxb}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong><i className="bi bi-box-seam me-2"></i>Tổng số sách:</strong>{' '}
                                                <span className="badge bg-success">{book.Tongsoluong}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-cart-check me-2"></i>Tổng số sách đã mượn:</strong>{' '}
                                                <span className="badge bg-warning text-dark">
                                                    {book.vitri.reduce(
                                                        (total, v) => total + (v.soluongmuon || 0),
                                                        0
                                                    )}
                                                </span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-file-earmark-text me-2"></i>Số trang:</strong>{' '}
                                                <span>{book.pages}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-currency-dollar me-2"></i>Giá:</strong>{' '}
                                                <span>{book.price.toLocaleString()} VND</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong><i className="bi bi-clock-history me-2"></i>Ngày cập nhật:</strong>{' '}
                                                <span>{formatDate(book.ngaycapnhat)}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h5 className="fw-semibold">
                                        <i className="bi bi-geo-alt-fill me-2"></i>Vị trí lưu trữ:
                                    </h5>
                                    <ul className="list-group list-group-flush">
                                        {book.vitri.map((v, index) => (
                                            <li
                                                key={index}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                <span>{v.mavitri} | {v.coso}</span>
                                                <div>
                                                    <span className="badge bg-primary me-2">
                                                        Số lượng còn: {v.soluong_con}
                                                    </span>
                                                    <span className="badge bg-warning text-dark">
                                                        Số lượng mượn: {v.soluongmuon}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="card-body border-top mt-4">
                            <h4 className="fw-semibold text-muted">
                                <i className="bi bi-card-text me-2"></i>Mô tả sách
                            </h4>
                            <p className="text-muted">{truncateDescription(book.mota)}</p>
                        </div>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={{
                                    borderColor: '#3498DB',
                                    color: '#3498DB',
                                    '&:hover': {
                                        borderColor: '#2C3E50',
                                        color: '#2C3E50',
                                    },
                                    textTransform: 'none',
                                }}
                            >
                                Đóng
                            </Button>
                        </Box>
                    </div>
                )}
            </Box>
        </Modal>
    );
};

export default DetailBookModal;