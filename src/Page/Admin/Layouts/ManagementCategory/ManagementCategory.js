import classNames from 'classnames/bind';
import styles from '../ManagementUser/ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState } from 'react';
import ModalEditCategory from '../../../../Modal/Category/ModalEditCategory';
import ModalDeleteCategory from '../../../../Modal/Category/ModalDeleteCategory';
import ModalAddCategory from '../../../../Modal/Category/ModalAddCategory';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const cx = classNames.bind(styles);

function ManagementCategory() {
    const [dataCategory, setDataCategory] = useState([]);
    const [showModalAddCategory, setShowModalAddCategory] = useState(false);
    const [showModalEditCategory, setShowModalEditCategory] = useState(false);
    const [showModalDeleteCategory, setShowModalDeleteCategory] = useState(false);
    const [valueSearch, setValueSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMadanhmuc, setSelectedMadanhmuc] = useState('');
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [bookDetails, setBookDetails] = useState([]); // State để lưu danh sách sách chi tiết
    const [showDetailModal, setShowDetailModal] = useState(false); // State để hiển thị modal chi tiết

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Số lượng danh mục mỗi trang

    const handleModalAddCategory = () => {
        setShowModalAddCategory(!showModalAddCategory);
    };

    const handleModalEditCategory = (category) => {
        setShowModalEditCategory(!showModalEditCategory);
        setSelectedCategory(category);
    };

    const handleModalDeleteCategory = (madanhmuc) => {
        setShowModalDeleteCategory(!showModalDeleteCategory);
        setSelectedMadanhmuc(madanhmuc);
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

    // Hàm xử lý khi nhấn nút "Chi tiết"
    const handleShowDetail = async (madanhmuc) => {
        try {
            const res = await request.get('/api/getBooksByCategory', {
                params: { madanhmuc },
            });
            setBookDetails(res.data.books); // Lưu danh sách sách vào state
            setShowDetailModal(true); // Hiển thị modal chi tiết
        } catch (error) {
            if (error.response?.status === 404) {
                toast.info('Không có sách nào trong danh mục này!', { autoClose: 1000 });
            } else if (error.response?.status === 400) {
                toast.error('Vui lòng cung cấp mã danh mục!', { autoClose: 1000 });
            } else {
                toast.error('Lỗi khi lấy chi tiết sách!', { autoClose: 1000 });
            }
            setBookDetails([]);
            setShowDetailModal(true);
        }
    };

    // Chặn sự kiện Enter trong ô tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn hành vi mặc định của Enter
        }
    };

    // Fetch tất cả categories khi load trang hoặc sau khi thêm/sửa/xóa
    useEffect(() => {
        request
            .get('/api/getAllCategories')
            .then((res) => {
                setDataCategory(res.data.data);
                setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
            })
            .catch((error) => console.error('Error fetching categories:', error));
    }, [shouldRefresh]);

    // Xử lý tìm kiếm gần đúng theo tên danh mục qua API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (valueSearch === '') {
                    const res = await request.get('/api/getAllCategories');
                    setDataCategory(res.data.data);
                    setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
                } else {
                    const res = await request.get('/api/searchCategories', {
                        params: { tendanhmuc: valueSearch },
                    });
                    setDataCategory(res.data.data); // API trả về mảng categories trong data
                    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
                }
            } catch (error) {
                setDataCategory([]);
            }
        };

        fetchCategories();
    }, [valueSearch]);

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataCategory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataCategory.length / itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={cx('wrapper')}>
            {/*<ToastContainer />*/}
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-4 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Danh Mục Sách</h4>
                    </div>
                    <div className="col-12 col-md-5">
                        <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Tìm kiếm theo tên danh mục"
                                aria-label="Search"
                                value={valueSearch}
                                onChange={(e) => setValueSearch(e.target.value)}
                                onKeyDown={handleKeyDown} // Thêm sự kiện chặn Enter
                            />
                        </form>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button
                            onClick={handleModalAddCategory}
                            className="btn btn-primary w-100 w-md-auto"
                        >
                            <i className="bi bi-plus-lg me-2"></i>Thêm Danh Mục
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Danh Mục</th>
                            <th scope="col">Tên Danh Mục</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item._id}>
                                    <th scope="row">{item.madanhmuc}</th>
                                    <td>{item.tendanhmuc}</td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                onClick={() => handleShowDetail(item.madanhmuc)}
                                                className="btn btn-info btn-sm"
                                            >
                                                <i className="bi bi-eye me-1"></i> Chi tiết
                                            </button>
                                            <button
                                                onClick={() => handleModalEditCategory(item)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="bi bi-pencil me-1"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleModalDeleteCategory(item.madanhmuc)
                                                }
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
                                <td colSpan="3" className="text-center">
                                    Không có danh mục nào
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {dataCategory.length > 0 && (
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

            {/* Modal hiển thị chi tiết sách */}
            {showDetailModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi Tiết Sách Theo Danh Mục</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered">
                                        <thead>
                                        <tr>
                                            <th>Mã Sách</th>
                                            <th>Tên Sách</th>
                                            <th>Tác Giả</th>
                                            <th>Nhà Xuất Bản</th>
                                            <th>Năm XB</th>
                                            <th>Số Lượng</th>
                                            <th>Ngày Cập Nhật</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bookDetails.length > 0 ? (
                                            bookDetails.map((book) => (
                                                <tr key={book._id}>
                                                    <td>{book.masach}</td>
                                                    <td>{book.tensach}</td>
                                                    <td>{book.tacgia}</td>
                                                    <td>{book.nhaxuatban}</td>
                                                    <td>{book.namxb}</td>
                                                    <td>{book.Tongsoluong || book.soluong || 0}</td>
                                                    <td>{formatDate(book.ngaycapnhat)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    Không có sách nào trong danh mục này
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ModalAddCategory
                showModalAddCategory={showModalAddCategory}
                setShowModalAddCategory={setShowModalAddCategory}
                onAddSuccess={handleAddSuccess}
            />
            <ModalEditCategory
                categoryData={selectedCategory}
                showModalEditCategory={showModalEditCategory}
                setShowModalEditCategory={setShowModalEditCategory}
                onEditSuccess={handleEditSuccess}
            />
            <ModalDeleteCategory
                showModalDeleteCategory={showModalDeleteCategory}
                setShowModalDeleteCategory={setShowModalDeleteCategory}
                madanhmuc={selectedMadanhmuc}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
}

export default ManagementCategory;