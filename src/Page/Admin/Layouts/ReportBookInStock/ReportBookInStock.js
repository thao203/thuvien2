import classNames from 'classnames/bind';
import styles from '../ManagementUser/ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const cx = classNames.bind(styles);

function ReportBookInStock() {
    const [booksInStock, setBooksInStock] = useState([]);
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        request.get('/api/GetBooksInStock')
            .then((res) => {
                setBooksInStock(res.data);
                // setCurrentPage(1);
            })
            .catch((error) => {
                toast.error('Không thể tải danh sách sách tồn kho!', { autoClose: 1000 });
            });
    }, [shouldRefresh]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = booksInStock.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(booksInStock.length / itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xử lý xuất file Excel
    const handleExportExcel = async () => {
        try {
            const response = await request.get('/api/exportBooksInStock', {
                responseType: 'blob', // Để nhận file dưới dạng blob
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Books_In_Stock.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Xuất file Excel thành công!', { autoClose: 1000 });
        } catch (error) {
            toast.error('Lỗi khi xuất file Excel!', { autoClose: 1000 });
        }
    };
    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-9 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Báo Cáo Sách Tồn Kho</h4>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button
                            onClick={handleExportExcel}
                            className="btn btn-success w-100 w-md-auto"
                        >
                            <i className="bi bi-file-earmark-excel me-2"></i>Xuất Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Sách</th>
                            <th scope="col">Tên Sách</th>
                            <th scope="col">Mã Vị Trí</th>
                            <th scope="col">Số Lượng Tổng</th>
                            <th scope="col">Số Lượng Còn Lại</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((book, index) =>
                                book.vitri.map((location, locIndex) => (
                                    <tr key={`${index}-${locIndex}`}>
                                        <td>{book.masach}</td>
                                        <td>{book.tensach}</td>
                                        <td>{location.mavitri}</td>
                                        <td>{location.soluong}</td>
                                        <td>{location.soluong_con}</td>
                                    </tr>
                                ))
                            )
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Không có sách nào trong kho</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {booksInStock.length > 0 && (
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
        </div>
    );
}

export default ReportBookInStock;