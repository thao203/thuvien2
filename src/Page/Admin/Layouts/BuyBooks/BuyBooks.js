import classNames from 'classnames/bind';
import styles from '../ManagementBooks/ManagementBooks.module.scss';
import { useEffect, useState } from 'react';
import ModalAddBuyBook from '../../../../Modal/BuyBooks/ModalAddBuyBook';
import ModalEditBuyBook from '../../../../Modal/BuyBooks/ModalEditBuyBook';
import ModalDeleteBuyBook from '../../../../Modal/BuyBooks/ModalDeleteBuyBook';
import request from '../../../../config/Connect';
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

function BuyBook() {
    const [showModalAddBuyBook, setShowModalAddBuyBook] = useState(false);
    const [showModalEditBuyBook, setShowModalEditBuyBook] = useState(false);
    const [showModalDeleteBuyBook, setShowModalDeleteBuyBook] = useState(false);
    const [maphieumua, setMaphieumua] = useState('');
    const [dataBuyBooks, setDataBuyBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchBuyBooks = async () => {
        setLoading(true);
        try {
            const res = await request.get('/api/getAllBuyBooks');
            setDataBuyBooks(res.data.buyBooks || []);
            setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
        } catch (error) {
            console.error('Lỗi khi lấy danh sách:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi lấy danh sách sách cần mua!', toastOptions);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuyBooks();
    }, [showModalAddBuyBook, showModalEditBuyBook, showModalDeleteBuyBook]);

    // Xuất file Excel
    const handleExport = async () => {
        try {
            const res = await request.get('/api/exportBuyBook', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Danh_sach_sach_can_mua.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Xuất file Excel thành công!', toastOptions);
        } catch (error) {
            console.error('Lỗi khi xuất file:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi xuất file Excel!', toastOptions);
        }
    };

    // Xóa toàn bộ danh sách
    const handleDeleteAll = () => {
        const toastId = toast.warn(
            <div>
                <p>Bạn có chắc chắn muốn xóa toàn bộ danh sách sách cần mua không?</p>
                <div className="mt-2 d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                            try {
                                const res = await request.delete('/api/deleteAllBuyBooks');
                                toast.success(res.data.message, toastOptions);
                                setDataBuyBooks([]);
                                setCurrentPage(1); // Reset về trang đầu sau khi xóa
                                toast.dismiss(toastId);
                            } catch (error) {
                                console.error('Lỗi khi xóa toàn bộ:', error);
                                toast.error(error.response?.data?.message || 'Lỗi khi xóa toàn bộ danh sách!', toastOptions);
                                toast.dismiss(toastId);
                            }
                        }}
                    >
                        Xóa
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toast.dismiss(toastId)}
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            {
                ...toastOptions,
                autoClose: false,
                closeButton: false,
                closeOnClick: false,
                toastId: 'delete-all-confirm',
            }
        );
    };

    // Gợi ý sách cần mua
    const handleSuggestBooks = async () => {
        setLoading(true);
        try {
            const res = await request.get('/api/suggestBooksToBuy');
            toast.success(res.data.message);
            fetchBuyBooks();
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowAdd = () => setShowModalAddBuyBook(true);
    const handleShowEdit = (maphieumua) => {
        setMaphieumua(maphieumua);
        setShowModalEditBuyBook(true);
    };
    const handleShowDelete = (maphieumua) => {
        setMaphieumua(maphieumua);
        setShowModalDeleteBuyBook(true);
    };

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataBuyBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataBuyBooks.length / itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />

            {/* Header */}
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-4 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Mua Sách</h4>
                    </div>
                    <div className="col-12 col-md-8 text-center text-md-end">
                        <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                            <button onClick={handleShowAdd} className="btn btn-primary" disabled={loading}>
                                <i className="bi bi-plus-lg me-2"></i>Thêm Phiếu Mua
                            </button>
                            <button onClick={handleExport} className="btn btn-success" disabled={loading}>
                                <i className="bi bi-file-earmark-excel me-2"></i>Xuất Excel
                            </button>
                            <button onClick={handleSuggestBooks} className="btn btn-info" disabled={loading}>
                                <i className="bi bi-lightbulb me-2"></i>Gợi Ý Sách
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                className="btn btn-danger"
                                disabled={loading || dataBuyBooks.length === 0}
                            >
                                <i className="bi bi-trash me-2"></i>Xóa Tất Cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
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
                                <th scope="col">Mã Phiếu Mua</th>
                                <th scope="col">Mã Sách</th>
                                <th scope="col">Số Lượng</th>
                                <th scope="col">Đơn Giá</th>
                                <th scope="col">Thành Tiền</th>
                                <th scope="col">Cơ Sở</th>
                                <th scope="col">Hành Động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item._id}>
                                        <th scope="row">{item.maphieumua}</th>
                                        <td>{item.masach}</td>
                                        <td>{item.soluong}</td>
                                        <td>{item.dongia?.toLocaleString() || 0} VNĐ</td>
                                        <td>{item.thantien?.toLocaleString() || (item.soluong * item.dongia)?.toLocaleString() || 0} VNĐ</td>
                                        <td>{item.coso}</td>
                                        <td>
                                            <div className={cx('action-buttons')}>
                                                <button
                                                    onClick={() => handleShowEdit(item.maphieumua)}
                                                    className="btn btn-warning btn-sm me-2"
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-pencil me-1"></i> Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleShowDelete(item.maphieumua)}
                                                    className="btn btn-danger btn-sm"
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash me-1"></i> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Không tìm thấy phiếu mua nào
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && dataBuyBooks.length > 0 && (
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
            <ModalAddBuyBook
                showModalAddBuyBook={showModalAddBuyBook}
                setShowModalAddBuyBook={setShowModalAddBuyBook}
                onAddSuccess={fetchBuyBooks}
            />
            <ModalEditBuyBook
                showModalEditBuyBook={showModalEditBuyBook}
                setShowModalEditBuyBook={setShowModalEditBuyBook}
                maphieumua={maphieumua}
            />
            <ModalDeleteBuyBook
                showModalDeleteBuyBook={showModalDeleteBuyBook}
                setShowModalDeleteBuyBook={setShowModalDeleteBuyBook}
                maphieumua={maphieumua}
            />
        </div>
    );
}

export default BuyBook;