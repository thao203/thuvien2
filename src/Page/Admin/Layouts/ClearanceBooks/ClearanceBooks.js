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
    const [month, setMonth] = useState(new Date().getMonth() + 1); // ThÃªm state cho thÃ¡ng
    const [year, setYear] = useState(new Date().getFullYear()); // ThÃªm state cho nÄƒm

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
            toast.success('Xuáº¥t file Excel thÃ nh cÃ´ng!', toastOptions);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lá»—i khi xuáº¥t file Excel!', toastOptions);
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
            toast.error(error.response?.data?.message || 'Lá»—i khi thay Ä‘á»•i tráº¡ng thÃ¡i!', toastOptions);
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
                        <h4 className="mb-0 fw-bold">Quáº£n LÃ½ SÃ¡ch Thanh LÃ½</h4>
                    </div>
                    <div className="col-12 col-md-6 text-center text-md-end">
                        <div className="d-flex justify-content-end gap-2 align-items-center">
                            {/* NÃºt chá»n thÃ¡ng */}
                            <select
                                className="form-select shadow-sm"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                style={{ width: 'auto', borderRadius: '8px' }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        ThÃ¡ng {i + 1}
                                    </option>
                                ))}
                            </select>
                            {/* NÃºt chá»n nÄƒm */}
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
                                <i className="bi bi-plus-lg me-2"></i>ThÃªm
                            </button>
                            <button
                                onClick={handleExportClearanceBooks}
                                className="btn btn-success px-4 flex-fill flex-md-grow-0"
                                disabled={loading}
                            >
                                <i className="bi bi-file-earmark-excel me-2"></i>Xuáº¥t Excel
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
                                <th scope="col">MÃ£ Thanh LÃ½</th>
                                <th scope="col">MÃ£ SÃ¡ch</th>
                                <th scope="col">Sá»‘ LÆ°á»£ng</th>
                                <th scope="col">CÆ¡ Sá»Ÿ</th>
                                <th scope="col">MÃ£ Vá»‹ TrÃ­</th>
                                <th scope="col">LÃ½ Do</th>
                                <th scope="col">NgÃ y Cáº­p Nháº­p</th>
                                <th scope="col">Tráº¡ng ThÃ¡i</th>
                                <th scope="col">HÃ nh Äá»™ng</th>
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
                                        <td>{item.trangthai ? 'ÄÃ£ Thanh LÃ½' : 'Äang Thanh LÃ½'}</td>
                                        <td>
                                            <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                <button
                                                    onClick={() => handleShowEdit(item)}
                                                    className="btn btn-warning btn-sm"
                                                    disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-pencil me-1"></i> Sá»­a
                                                </button>
                                                <button
                                                    onClick={() => handleShowDelete(item.masachthanhly)}
                                                    className="btn btn-danger btn-sm"
                                                    // disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-trash me-1"></i> XÃ³a
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(item.masachthanhly)}
                                                    className="btn btn-info btn-sm"
                                                    disabled={loading || item.trangthai}
                                                >
                                                    <i className="bi bi-check-circle me-1"></i> Thanh LÃ½
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        KhÃ´ng tÃ¬m tháº¥y sÃ¡ch thanh lÃ½ nÃ o
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
                                    TrÆ°á»›c
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
