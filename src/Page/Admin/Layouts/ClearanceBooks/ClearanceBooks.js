import classNames from 'classnames/bind';
import styles from '../ManagementUser/ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState, useCallback } from 'react';
import ModalAddClearanceBooks from '../../../../Modal/ClearanceBooks/ModalAddClearanceBooks';
import ModalEditClearanceBooks from '../../../../Modal/ClearanceBooks/ModalEditClearanceBooks';
import ModalDeleteClearanceBooks from '../../../../Modal/ClearanceBooks/ModalDeleteClearanceBooks';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const cx = classNames.bind(styles);

const toastOptions = {
    position: 'top-right',
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

function ClearanceBooks() {
    const [dataClearanceBooks, setDataClearanceBooks] = useState([]);
    const [showModalAddClearanceBooks, setShowModalAddClearanceBooks] = useState(false);
    const [showModalEditClearanceBooks, setShowModalEditClearanceBooks] = useState(false);
    const [showModalDeleteClearanceBooks, setShowModalDeleteClearanceBooks] = useState(false);
    const [selectedClearanceBook, setSelectedClearanceBook] = useState(null);
    const [selectedMasachthanhly, setSelectedMasachthanhly] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Thêm state cho tháng
    const [year, setYear] = useState(new Date().getFullYear()); // Thêm state cho năm

    const fetchClearanceBooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await request.get('/api/getAllClearanceBooks', {
                params: { month, year }
            });
            setDataClearanceBooks(res.data.clearanceBooks || []);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchClearanceBooks();
    }, [fetchClearanceBooks, shouldRefresh]);

    const handleExportClearanceBooks = async () => {
        setLoading(true);
        try {
            const res = await request.get('/api/exportClearanceBooks', {
                responseType: 'blob',
                params: { month, year }
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `danhsach_thanhly_${month}_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Xuất file Excel thành công!', toastOptions);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xuất file Excel!', toastOptions);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (masachthanhly) => {
        setLoading(true);
        try {
            const res = await request.post('/api/changeClearanceBookStatus', {
                masachthanhly,
                trangthai: true,
            });
            toast.success(res.data.message, toastOptions);
            setShouldRefresh(prev => !prev);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái!', toastOptions);
        } finally {
            setLoading(false);
        }
    };

    const handleShowAdd = () => setShowModalAddClearanceBooks(true);
    const handleShowEdit = (clearanceBook) => {
        setSelectedClearanceBook(clearanceBook);
        setShowModalEditClearanceBooks(true);
    };
    const handleShowDelete = (masachthanhly) => {
        setSelectedMasachthanhly(masachthanhly);
        setShowModalDeleteClearanceBooks(true);
    };

    const handleSuccess = () => {
        setShouldRefresh(prev => !prev);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataClearanceBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataClearanceBooks.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-6 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Sách Thanh Lý</h4>
                    </div>
                    <div className="col-12 col-md-6 text-center text-md-end">
                        <div className="d-flex justify-content-end gap-2 align-items-center">
                            {/* Nút chọn tháng */}
                            <select
                                className="form-select shadow-sm"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                style={{ width: 'auto', borderRadius: '8px' }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                            {/* Nút chọn năm */}
                            <select
                                className="form-select shadow-sm"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                style={{ width: 'auto', borderRadius: '8px' }}
                            >
                                {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={new Date().getFullYear() - i}>
                                        {new Date().getFullYear() - i}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleShowAdd}
                                className="btn btn-primary px-4 flex-fill flex-md-grow-0"
                                disabled={loading}
                            >
                                <i className="bi bi-plus-lg me-2"></i>Thêm
                            </button>
                            <button
                                onClick={handleExportClearanceBooks}
                                className="btn btn-success px-4 flex-fill flex-md-grow-0"
                                disabled={loading}
                            >
                                <i className="bi bi-file-earmark-excel me-2"></i>Xuất Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered align-middle">
                            <thead className="table-dark">
                            <tr>
                                <th scope="col">Mã Thanh Lý</th>
                                <th scope="col">Mã Sách</th>
                                <th scope="col">Số Lượng</th>
                                <th scope="col">Cơ Sở</th>
                                <th scope="col">Mã Vị Trí</th>
                                <th scope="col">Lý Do</th>
                                <th scope="col">Ngày Cập Nhập</th>
                                <th scope="col">Trạng Thái</th>
                                <th scope="col">Hành Động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item._id}>
                                        <th scope="row">{item.masachthanhly}</th>
                                        <td>{item.masach}</td>
                                        <td>{item.soluong}</td>
                                        <td>{item.coso}</td>
                                        <td>{item.mavitri}</td>
                                        <td>{item.lydo}</td>
                                        <td>{formatDate(item.ngaycapnhat)}</td>
                                        <td>{item.trangthai ? 'Đã Thanh Lý' : 'Đang Thanh Lý'}</td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                <button
                                                    onClick={() => handleShowEdit(item)}
                                                    className="btn btn-warning btn-sm"
                                                    disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-pencil me-1"></i> Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleShowDelete(item.masachthanhly)}
                                                    className="btn btn-danger btn-sm"
                                                    // disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-trash me-1"></i> Xóa
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(item.masachthanhly)}
                                                    className="btn btn-info btn-sm"
                                                    disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-check-circle me-1"></i> Thanh Lý
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        Không tìm thấy sách thanh lý nào
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && dataClearanceBooks.length > 0 && (
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

            <ModalAddClearanceBooks
                showModalAddClearanceBooks={showModalAddClearanceBooks}
                setShowModalAddClearanceBooks={setShowModalAddClearanceBooks}
                onAddSuccess={handleSuccess}
            />
            <ModalEditClearanceBooks
                clearanceBookData={selectedClearanceBook}
                showModalEditClearanceBooks={showModalEditClearanceBooks}
                setShowModalEditClearanceBooks={setShowModalEditClearanceBooks}
                onEditSuccess={handleSuccess}
            />
            <ModalDeleteClearanceBooks
                showModalDeleteClearanceBooks={showModalDeleteClearanceBooks}
                setShowModalDeleteClearanceBooks={setShowModalDeleteClearanceBooks}
                masachthanhly={selectedMasachthanhly}
                onDeleteSuccess={handleSuccess}
            />
        </div>
    );
}

export default ClearanceBooks;
