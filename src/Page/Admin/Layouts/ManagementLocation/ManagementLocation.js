import classNames from 'classnames/bind';
import styles from '../ManagementUser/ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState } from 'react';
import ModalEditLocation from '../../../../Modal/Location/ModalEditLocation';
import ModalDeleteLocation from '../../../../Modal/Location/ModaDeleteLocation';
import ModalAddLocation from '../../../../Modal/Location/ModalAddLocation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Box, Modal, Typography } from '@mui/material';

const cx = classNames.bind(styles);

function ManagementLocation() {
    const [dataLocation, setDataLocation] = useState([]);
    const [showModalAddLocation, setShowModalAddLocation] = useState(false);
    const [showModalEditLocation, setShowModalEditLocation] = useState(false);
    const [showModalDeleteLocation, setShowModalDeleteLocation] = useState(false);
    const [showModalQR, setShowModalQR] = useState(false);
    const [qrData, setQrData] = useState([]);
    const [valueSearch, setValueSearch] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedMavitri, setSelectedMavitri] = useState('');
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [bookDetails, setBookDetails] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingBook, setLoadingBook] = useState(false);
    const [bookError, setBookError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedCoso, setSelectedCoso] = useState('');
    const [selectedSoke, setSelectedSoke] = useState('');
    const [cosoOptions, setCosoOptions] = useState([]);
    const [sokeOptions, setSokeOptions] = useState([]);

    const handleModalAddLocation = () => {
        setShowModalAddLocation(!showModalAddLocation);
    };

    const handleModalEditLocation = (location) => {
        setShowModalEditLocation(!showModalEditLocation);
        setSelectedLocation(location);
    };

    const handleModalDeleteLocation = (mavitri) => {
        setShowModalDeleteLocation(!showModalDeleteLocation);
        setSelectedMavitri(mavitri);
    };

    const handleModalQR = async () => {
        try {
            const res = await request.get('/api/generateQRCodePerShelf');
            setQrData(res.data.qrData || []);
            setShowModalQR(true);
        } catch (error) {
            toast.error('Lỗi khi lấy mã QR: ' + error.message);
        }
    };

    const handleDeleteSuccess = () => {
        setShouldRefresh(!shouldRefresh);
    };

    const handleEditSuccess = () => {
        setShouldRefresh(!shouldRefresh);
    };

    const handleAddSuccess = () => {
        setShouldRefresh(!shouldRefresh);
    };

    const handleShowDetail = async (mavitri) => {
        try {
            setLoadingBook(true);
            setBookError(null);
            const res = await request.get(`/api/getBooksByLocation?mavitri=${mavitri}`);
            const books = res.data.data || [];
            if (books.length > 0) {
                // Fetch full book details using masach of the first book
                const bookRes = await request.get('/api/SearchBookByMaSach', {
                    params: { masach: books[0].masach },
                });
                setBookDetails(bookRes.data);
            } else {
                setBookDetails(null);
            }
            setShowDetailModal(true);
        } catch (error) {
            setBookError(error.response?.data?.message || 'Lỗi khi lấy chi tiết sách');
            setBookDetails(null);
            setShowDetailModal(true);
        } finally {
            setLoadingBook(false);
        }
    };

    const handleSaveAllQRCodes = () => {
        qrData.forEach((qr, index) => {
            const link = document.createElement('a');
            link.href = qr.qrCodeBase64;
            link.download = `QR_${qr.coso}_${qr.soke}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        toast.success('Đã tải xuống tất cả mã QR!');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    useEffect(() => {
        request
            .get('/api/getAllLocations')
            .then((res) => {
                const locations = res.data.data || [];
                setDataLocation(locations);
                const uniqueCoso = [...new Set(locations.map(item => String(item.coso)))].sort();
                const uniqueSoke = [...new Set(locations.map(item => String(item.soke)))].sort();
                setCosoOptions(uniqueCoso);
                setSokeOptions(uniqueSoke);
            })
            .catch((error) => console.error(error));
    }, [shouldRefresh]);

    const filteredLocations = dataLocation.filter((location) => {
        const matchesSearch = location.mavitri.toLowerCase().includes(valueSearch.toLowerCase());
        const matchesCoso = selectedCoso ? String(location.coso) === selectedCoso : true;
        const matchesSoke = selectedSoke ? String(location.soke) === selectedSoke : true;
        return matchesSearch && matchesCoso && matchesSoke;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-3 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Vị Trí</h4>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="row g-2 align-items-center">
                            <div className="col-4">
                                <select
                                    className="form-select"
                                    value={selectedCoso}
                                    onChange={(e) => setSelectedCoso(e.target.value)}
                                >
                                    <option value="">Tất cả cơ sở</option>
                                    {cosoOptions.map((coso) => (
                                        <option key={coso} value={coso}>
                                            {coso}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-4">
                                <select
                                    className="form-select"
                                    value={selectedSoke}
                                    onChange={(e) => setSelectedSoke(e.target.value)}
                                >
                                    <option value="">Tất cả số kệ</option>
                                    {sokeOptions.map((soke) => (
                                        <option key={soke} value={soke}>
                                            {soke}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-4">
                                <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        className="form-control"
                                        type="search"
                                        placeholder="Tìm kiếm mã vị trí"
                                        aria-label="Search"
                                        value={valueSearch}
                                        onChange={(e) => setValueSearch(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end d-flex justify-content-end gap-2">
                        <button
                            onClick={handleModalAddLocation}
                            className="btn btn-primary"
                        >
                            <i className="bi bi-plus-lg me-2"></i>Thêm Vị Trí
                        </button>
                        <button
                            onClick={handleModalQR}
                            className="btn btn-success"
                        >
                            <i className="bi bi-qr-code me-2"></i>QR
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Vị Trí</th>
                            <th scope="col">Cơ Sở</th>
                            <th scope="col">Số Kệ</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item._id}>
                                    <th scope="row">{item.mavitri}</th>
                                    <td>{item.coso}</td>
                                    <td>{item.soke}</td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                onClick={() => handleShowDetail(item.mavitri)}
                                                className="btn btn-info btn-sm"
                                            >
                                                <i className="bi bi-eye me-1"></i> Chi tiết
                                            </button>
                                            <button
                                                onClick={() => handleModalEditLocation(item)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="bi bi-pencil me-1"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => handleModalDeleteLocation(item.mavitri)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                <i className="bi bi-trash me-1"></i> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">Không có vị trí nào</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredLocations.length > 0 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center mt-3">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <li
                                    key={page}
                                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

            <Modal
                open={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                aria-labelledby="book-detail-modal"
                aria-describedby="book-detail-description"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{ maxWidth: 800, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'auto', maxHeight: '90vh' }}>
                    {loadingBook ? (
                        <Typography className="text-center text-muted py-5">
                            <i className="bi bi-hourglass-split me-2"></i>Đang tải...
                        </Typography>
                    ) : bookError ? (
                        <Typography className="text-danger text-center py-5">
                            <i className="bi bi-exclamation-triangle me-2"></i>{bookError}
                        </Typography>
                    ) : !bookDetails ? (
                        <Typography className="text-center text-muted py-5">
                            <i className="bi bi-book me-2"></i>Không tìm thấy sách.
                        </Typography>
                    ) : (
                        <div className="card shadow-lg border-0 rounded-3">
                            <div className="row g-0">
                                <div className="col-md-4 p-4">
                                    <img
                                        src={bookDetails.img}
                                        alt={bookDetails.tensach}
                                        className="img-fluid rounded shadow-sm"
                                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8 p-4">
                                    <h1 className="fw-bold mb-4 text-primary">
                                        <i className="bi bi-book me-2"></i>{bookDetails.tensach}
                                    </h1>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-upc-scan me-2"></i>Mã sách:</strong>{' '}
                                                    <span>{bookDetails.masach}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-person-fill me-2"></i>Tác giả:</strong>{' '}
                                                    <span>{bookDetails.tacgia}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-building me-2"></i>Nhà xuất bản:</strong>{' '}
                                                    <span>{bookDetails.nhaxuatban}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-tags-fill me-2"></i>Phiên bản:</strong>{' '}
                                                    <span>{bookDetails.phienban || 'N/A'}</span>
                                                </li>

                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-file-earmark-text me-2"></i>Số trang:</strong>{' '}
                                                    <span>{bookDetails.pages || 'N/A'}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-currency-dollar me-2"></i>Giá:</strong>{' '}
                                                    <span>{bookDetails.price ? bookDetails.price.toLocaleString() + ' VND' : 'N/A'}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-clock-history me-2"></i>Ngày cập nhật:</strong>{' '}
                                                    <span>{formatDate(bookDetails.ngaycapnhat)}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-bookmark-fill me-2"></i>Danh mục:</strong>{' '}
                                                    <span>{bookDetails.tendanhmuc || 'N/A'}</span>
                                                </li>
                                                <li className="mb-2">
                                                    <strong><i className="bi bi-calendar-event me-2"></i>Năm xuất bản:</strong>{' '}
                                                    <span>{bookDetails.namxb}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body border-top mt-4">
                                <h4 className="fw-semibold text-muted">
                                    <i className="bi bi-card-text me-2"></i>Mô tả sách
                                </h4>
                                <p className="text-muted">{bookDetails.mota || 'Không có mô tả'}</p>
                            </div>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowDetailModal(false)}
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

            {showModalQR && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Mã QR Theo Kệ</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModalQR(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {qrData.length > 0 ? (
                                    <div className="row">
                                        {qrData.map((qr, index) => (
                                            <div key={index} className="col-12 col-md-4 mb-4 text-center">
                                                <h6>{`Cơ sở: ${qr.coso} - Kệ: ${qr.soke}`}</h6>
                                                <img
                                                    src={qr.qrCodeBase64}
                                                    alt={`QR for ${qr.coso}_${qr.soke}`}
                                                    className="img-fluid"
                                                    style={{ maxWidth: '200px' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center">Không có mã QR nào để hiển thị.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveAllQRCodes}
                                    disabled={qrData.length === 0}
                                >
                                    Lưu Tất Cả
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModalQR(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ModalAddLocation
                showModalAddLocation={showModalAddLocation}
                setShowModalAddLocation={setShowModalAddLocation}
                onAddSuccess={handleAddSuccess}
            />
            <ModalEditLocation
                locationData={selectedLocation}
                showModalEditLocation={showModalEditLocation}
                setShowModalEditLocation={setShowModalEditLocation}
                onEditSuccess={handleEditSuccess}
            />
            <ModalDeleteLocation
                showModalDeleteLocation={showModalDeleteLocation}
                setShowModalDeleteLocation={setShowModalDeleteLocation}
                mavitri={selectedMavitri}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
}

export default ManagementLocation;