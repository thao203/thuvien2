import classNames from 'classnames/bind';
import styles from './ManagementBooks.module.scss';
import { useEffect, useState, useCallback, useMemo } from 'react';
import ModalAddBook from '../../../../Modal/Books/ModalAddBook';
import ModalEditBook from '../../../../Modal/Books/ModalEditBook';
import ModalDeleteBook from '../../../../Modal/Books/ModalDeleteBook';
import DetailBookModal from '../../../../Modal/Books/ModalDetailBook';
import request from '../../../../config/Connect';
import useDebounce from '../../../../customHook/useDebounce';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalDetailBook from '../../../../Modal/Books/ModalDetailBook';

const cx = classNames.bind(styles);

function ManagementBooks() {
    const [showModalAddBook, setShowModalAddBook] = useState(false);
    const [showModalEditBook, setShowModalEditBook] = useState(false);
    const [showModalDeleteBook, setShowModalDeleteBook] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFilterForm, setShowFilterForm] = useState(false);
    const [idBook, setIdBook] = useState('');
    const [masachBook, setMasachBook] = useState('');
    const [selectedMasach, setSelectedMasach] = useState('');
    const [dataBooks, setDataBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const debounce = useDebounce(searchValue, 500);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // State cho form lọc
    const [filterCategory, setFilterCategory] = useState(null);
    const [filterPublisher, setFilterPublisher] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // State để lưu hành động tạm thời
    const [pendingAction, setPendingAction] = useState({ type: '', value: '' });

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    // Lấy danh sách sách chỉ khi component mount hoặc refreshTrigger thay đổi
    useEffect(() => {
        request
            .get('/api/GetBooks')
            .then((res) => {
                setDataBooks(res.data);
                setFilteredBooks(res.data);
                setCurrentPage(1);
                console.log('Danh sách sách:', res.data);
            })
            .catch((error) => console.error('Lỗi khi lấy sách:', error));
    }, [refreshTrigger]);

    // Tìm kiếm sách
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                if (searchValue.trim() === '') {
                    setFilteredBooks(dataBooks);
                    setCurrentPage(1);
                    return;
                }

                const res = await request.get('/api/SearchProduct', {
                    params: { tensach: debounce },
                });

                setFilteredBooks(res.data);
                setCurrentPage(1);
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 404) {
                    setFilteredBooks([]);
                } else {
                    setFilteredBooks([]);
                }
            }
        };

        fetchSearchResults();
    }, [debounce, dataBooks]);

    // Đồng bộ mở modal khi pendingAction thay đổi
    useEffect(() => {
        if (pendingAction.type === 'edit' && pendingAction.value && idBook === pendingAction.value) {
            setShowModalEditBook(true);
        } else if (
            pendingAction.type === 'delete' &&
            pendingAction.value &&
            masachBook === pendingAction.value
        ) {
            setShowModalDeleteBook(true);
        } else if (
            pendingAction.type === 'detail' &&
            pendingAction.value &&
            selectedMasach === pendingAction.value
        ) {
            setShowDetailModal(true);
        }
    }, [pendingAction, idBook, masachBook, selectedMasach]);

    // Trích xuất danh sách danh mục và nhà xuất bản
    const categories = useMemo(
        () =>
            [...new Set(dataBooks.map((book) => book.tendanhmuc).filter(Boolean))].map((category) => ({
                value: category,
                label: category,
            })),
        [dataBooks]
    );
    const publishers = useMemo(
        () =>
            [...new Set(dataBooks.map((book) => book.nhaxuatban).filter(Boolean))].map((publisher) => ({
                value: publisher,
                label: publisher,
            })),
        [dataBooks]
    );

    // Hàm xử lý lọc sách
    const handleFilterSubmit = useCallback((e) => {
        e.preventDefault();
        if (filterStartDate && filterEndDate && new Date(filterStartDate) > new Date(filterEndDate)) {
            alert('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return;
        }

        let filtered = [...dataBooks];

        if (filterCategory?.value) {
            filtered = filtered.filter((book) => book.tendanhmuc === filterCategory.value);
        }

        if (filterPublisher?.value) {
            filtered = filtered.filter((book) => book.nhaxuatban === filterPublisher.value);
        }

        if (filterStartDate) {
            filtered = filtered.filter((book) => {
                const bookDate = new Date(book.ngaycapnhat);
                const startDate = new Date(filterStartDate);
                return bookDate >= startDate;
            });
        }
        if (filterEndDate) {
            filtered = filtered.filter((book) => {
                const bookDate = new Date(book.ngaycapnhat);
                const endDate = new Date(filterEndDate);
                return bookDate <= endDate;
            });
        }

        setFilteredBooks(filtered);
        setCurrentPage(1);
        setShowFilterForm(false);
    }, [dataBooks, filterCategory, filterPublisher, filterStartDate, filterEndDate]);

    // Reset bộ lọc
    const handleFilterReset = useCallback(() => {
        setFilterCategory(null);
        setFilterPublisher(null);
        setFilterStartDate('');
        setFilterEndDate('');
        setFilteredBooks(dataBooks);
        setCurrentPage(1);
        setShowFilterForm(false);
    }, [dataBooks]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = useMemo(
        () => filteredBooks.slice(indexOfFirstItem, indexOfLastItem),
        [filteredBooks, indexOfFirstItem, indexOfLastItem]
    );
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const handleShow = useCallback(() => {
        setShowModalAddBook((prev) => !prev);
    }, []);

    // Hàm xử lý hành động sửa
    const handleShow1 = useCallback((masach) => {
        setIdBook(masach);
        setPendingAction({ type: 'edit', value: masach });
    }, []);

    // Hàm xử lý hành động xóa
    const handleShow2 = useCallback((masach) => {
        setMasachBook(masach);
        setPendingAction({ type: 'delete', value: masach });
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn hành vi mặc định của Enter
        }
    };

    // Hàm xử lý hành động xem chi tiết
    const handleShowDetail = useCallback((masach) => {
        setSelectedMasach(masach);
        setPendingAction({ type: 'detail', value: masach });
    }, []);

    const handleCloseDetail = useCallback(() => {
        setShowDetailModal(false);
        setSelectedMasach('');
        setPendingAction({ type: '', value: '' });
    }, []);

    // Hàm để kích hoạt làm mới dữ liệu sau khi thêm/sửa/xóa
    const handleDataChange = useCallback(() => {
        setRefreshTrigger((prev) => !prev);
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-4 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Sách</h4>
                    </div>
                    <div className="col-md-3">
                        <form className="d-flex">
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Tìm tên sách"
                                aria-label="Search"
                                value={searchValue}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button onClick={handleShow} className="btn btn-primary ebxme-2">
                            <i className="bi bi-plus-lg me-2"></i>Thêm Sách
                        </button>
                        <button
                            onClick={() => setShowFilterForm((prev) => !prev)}
                            className="btn btn-secondary"
                        >
                            <i className="bi bi-filter me-2"></i>Lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Form lọc */}
            {showFilterForm && (
                <div className={cx('filter-form')}>
                    <div className="card p-4">
                        <h5>Lọc Sách</h5>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="row g-3">
                                {/* Danh mục */}
                                <div className="col-md-4">
                                    <label className="form-label">Danh Mục</label>
                                    <Select
                                        options={categories}
                                        value={filterCategory}
                                        onChange={setFilterCategory}
                                        placeholder="Chọn danh mục..."
                                        isClearable
                                        isSearchable
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Nhà xuất bản */}
                                <div className="col-md-4">
                                    <label className="form-label">Nhà Xuất Bản</label>
                                    <Select
                                        options={publishers}
                                        value={filterPublisher}
                                        onChange={setFilterPublisher}
                                        placeholder="Chọn nhà xuất bản..."
                                        isClearable
                                        isSearchable
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Ngày cập nhật */}
                                <div className="col-md-4">
                                    <label className="form-label">Ngày Cập Nhật</label>
                                    <div className="d-flex gap-2">
                                        <DatePicker
                                            selected={filterStartDate ? new Date(filterStartDate) : null}
                                            onChange={(date) =>
                                                setFilterStartDate(date ? date.toISOString().split('T')[0] : '')
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Từ ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                        <DatePicker
                                            selected={filterEndDate ? new Date(filterEndDate) : null}
                                            onChange={(date) =>
                                                setFilterEndDate(date ? date.toISOString().split('T')[0] : '')
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Đến ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 d-flex gap-2">
                                <button type="submit" className="btn btn-primary">
                                    Áp dụng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleFilterReset}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Sách</th>
                            <th scope="col">Tên Sách</th>
                            <th scope="col">Nhà Xuất Bản</th>
                            <th scope="col">Danh Mục</th>
                            <th scope="col">Vị Trí</th>
                            <th scope="col">Tổng Số Lượng</th>
                            <th scope="col">Ngày Cập Nhật</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.masach}>
                                    <th scope="row">{item.masach}</th>
                                    <td>{item.tensach}</td>
                                    <td>{item.nhaxuatban}</td>
                                    <td>{item.tendanhmuc}</td>
                                    <td>{item.vitri?.map((e) => `${e.mavitri}, `) || 'N/A'}</td>
                                    <td>{item.Tongsoluong || item.currentQuantity || 0}</td>
                                    <td>{formatDate(item.ngaycapnhat)}</td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                onClick={() => handleShowDetail(item.masach)}
                                                className="btn btn-info btn-sm"
                                            >
                                                <i className="bi bi-eye me-1"></i> Xem
                                            </button>
                                            <button
                                                onClick={() => handleShow1(item.masach)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="bi bi-pencil me-1"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => handleShow2(item.masach)}
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
                                <td colSpan="8" className="text-center">
                                    Không tìm thấy sách nào
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredBooks.length > 0 && (
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

            <ModalAddBook
                showModalAddBook={showModalAddBook}
                setShowModalAddBook={setShowModalAddBook}
                onSuccess={handleDataChange}
            />
            <ModalEditBook
                showModalEditBook={showModalEditBook}
                setShowModalEditBook={setShowModalEditBook}
                idBook={idBook}
                onSuccess={handleDataChange}
            />
            <ModalDeleteBook
                showModalDeleteBook={showModalDeleteBook}
                setShowModalDeleteBook={setShowModalDeleteBook}
                masach={masachBook}
                onSuccess={handleDataChange}
            />
            <ModalDetailBook
                open={showDetailModal}
                onClose={handleCloseDetail}
                masach={selectedMasach}
            />
        </div>
    );
}

export default ManagementBooks;