import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import ModalAddHandleBook from '../../../../Modal/ExtenBooks/ModalAddHandleBook';
import useDebounce from '../../../../customHook/useDebounce';
import styles from './HandleBooks.module.scss';
import request from '../../../../config/Connect';
import 'react-datepicker/dist/react-datepicker.css';

const cx = classNames.bind(styles);

function HandleBook() {
    const [borrowedRecords, setBorrowedRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilterForm, setShowFilterForm] = useState(false);
    const debounce = useDebounce(searchValue, 500);

    // State cho bộ lọc
    const [filterBorrowStartDate, setFilterBorrowStartDate] = useState(null);
    const [filterBorrowEndDate, setFilterBorrowEndDate] = useState(null);
    const [filterDueStartDate, setFilterDueStartDate] = useState(null);
    const [filterDueEndDate, setFilterDueEndDate] = useState(null);
    const [filterOverdue, setFilterOverdue] = useState(null);
    const [filterConfirmed, setFilterConfirmed] = useState(null);

    // Hàm format ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return 'N/A';
        }
    };

    // Hàm chuẩn hóa ngày
    const normalizeDate = (date) => {
        if (!date) return null;
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return null;
        }
    };

    // Hàm tính số ngày quá hạn
    const calculateOverdueDays = (dueDate, isReturned = false, savedOverdueDays = 0) => {
        if (isReturned && savedOverdueDays !== undefined) {
            return savedOverdueDays;
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

    // Hàm tính tiền phạt
    const calculateFine = (books, record) => {
        const totalOverdueDays = books.reduce((total, book) => {
            const dueDate = book.newngayhentra || book.ngayhentra || record.ngayhentra;
            const overdueDays = calculateOverdueDays(dueDate, book.tinhtrang, book.overdueDays);
            return total + overdueDays;
        }, 0);
        return totalOverdueDays * 2000;
    };

    // Hàm áp dụng bộ lọc hiện tại
    const applyCurrentFilters = (records) => {
        let filtered = [...records];

        if (filterBorrowStartDate) {
            filtered = filtered.filter((record) => {
                const borrowDate = new Date(record.ngaymuon);
                const startDate = new Date(filterBorrowStartDate);
                return borrowDate >= startDate;
            });
        }
        if (filterBorrowEndDate) {
            filtered = filtered.filter((record) => {
                const borrowDate = new Date(record.ngaymuon);
                const endDate = new Date(filterBorrowEndDate);
                return borrowDate <= endDate;
            });
        }

        if (filterDueStartDate) {
            filtered = filtered.filter((record) => {
                const dueDate = new Date(record.ngayhentra);
                const startDate = new Date(filterDueStartDate);
                return dueDate >= startDate;
            });
        }
        if (filterDueEndDate) {
            filtered = filtered.filter((record) => {
                const dueDate = new Date(record.ngayhentra);
                const endDate = new Date(filterDueEndDate);
                return dueDate <= endDate;
            });
        }

        if (filterOverdue?.value === 'overdue') {
            filtered = filtered.filter((record) =>
                record.books.some(
                    (book) =>
                        calculateOverdueDays(
                            book.newngayhentra || book.ngayhentra || record.ngayhentra,
                            book.tinhtrang,
                            book.overdueDays
                        ) > 0
                )
            );
        } else if (filterOverdue?.value === 'notOverdue') {
            filtered = filtered.filter((record) =>
                record.books.every(
                    (book) =>
                        calculateOverdueDays(
                            book.newngayhentra || book.ngayhentra || record.ngayhentra,
                            book.tinhtrang,
                            book.overdueDays
                        ) === 0
                )
            );
        }

        if (filterConfirmed?.value === 'confirmed') {
            filtered = filtered.filter((record) => record.books.every((book) => book.confirm || book.tinhtrang));
        } else if (filterConfirmed?.value === 'notConfirmed') {
            filtered = filtered.filter((record) => record.books.some((book) => !book.confirm && !book.tinhtrang));
        }

        if (debounce.trim()) {
            filtered = filtered.filter(
                (record) =>
                    record.maphieumuon.toLowerCase().includes(debounce.toLowerCase()) ||
                    record.masinhvien.toLowerCase().includes(debounce.toLowerCase())
            );
        }

        return filtered;
    };

    // Lấy danh sách phiếu mượn
    const fetchBorrowedBooks = async () => {
        setIsLoading(true);
        try {
            const response = await request.get('/api/GetBorrowedBooks');
            const data = Array.isArray(response.data) ? response.data : [];
            const updatedData = data.map((record) => {
                const updatedBooks = record.books.map((book) => ({
                    ...book,
                    isExtended: book.giahan || false,
                    originalDueDate: book.ngayhentra || record.ngayhentra,
                    overdueDays:
                        book.tinhtrang && book.ngaytra
                            ? (() => {
                                const dueDate = new Date(book.newngayhentra || book.ngayhentra || record.ngayhentra);
                                const returnDate = new Date(book.ngaytra);
                                dueDate.setHours(0, 0, 0, 0);
                                returnDate.setHours(0, 0, 0, 0);
                                const diffTime = returnDate.getTime() - dueDate.getTime();
                                const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                return overdueDays > 0 ? overdueDays : 0;
                            })()
                            : 0,
                }));
                return {
                    ...record,
                    books: updatedBooks,
                    isExtended: updatedBooks.every((book) => book.tinhtrang || book.isExtended),
                };
            });
            setBorrowedRecords(updatedData);
            setFilteredRecords(applyCurrentFilters(updatedData));
            return updatedData; // Trả về dữ liệu để sử dụng trong các hàm khác
        } catch (err) {
            setBorrowedRecords([]);
            setFilteredRecords([]);
            toast.error('Lỗi khi tải danh sách phiếu mượn!');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Hủy các phiếu mượn chưa xác nhận
    const cancelUnconfirmedBorrows = async () => {
        try {
            const response = await request.post('/api/cancelUnconfirmedBorrows');
            if (response.data.success) {
                await fetchBorrowedBooks();
            }
        } catch (err) {
            // Xử lý lỗi im lặng
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn hành vi mặc định của Enter
        }
    };

    // Tìm kiếm phiếu mượn
    const fetchSearchResults = async () => {
        try {
            if (!debounce.trim()) {
                setFilteredRecords(applyCurrentFilters(borrowedRecords));
                setCurrentPage(1);
                return;
            }

            const response = await request.post('/api/SearchBorrowRecords', {
                timphieu: debounce.trim(),
            });

            const searchData = Array.isArray(response.data.data) ? response.data.data : [];
            setFilteredRecords(applyCurrentFilters(searchData));
            setCurrentPage(1);
        } catch (err) {
            setFilteredRecords([]);
        }
    };

    // Khởi tạo
    useEffect(() => {
        const initialize = async () => {
            await cancelUnconfirmedBorrows();
            await fetchBorrowedBooks();
        };
        initialize();
    }, []);

    // Tìm kiếm khi debounce thay đổi
    useEffect(() => {
        fetchSearchResults();
    }, [debounce]);

    // Điều chỉnh currentPage khi filteredRecords thay đổi
    useEffect(() => {
        const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredRecords, itemsPerPage, currentPage]);

    // Xử lý lọc phiếu mượn
    const handleFilterSubmit = (e) => {
        e.preventDefault();

        if (
            filterBorrowStartDate &&
            filterBorrowEndDate &&
            new Date(filterBorrowStartDate) > new Date(filterBorrowEndDate)
        ) {
            toast.error('Ngày mượn bắt đầu không được lớn hơn ngày kết thúc!');
            return;
        }
        if (
            filterDueStartDate &&
            filterDueEndDate &&
            new Date(filterDueStartDate) > new Date(filterDueEndDate)
        ) {
            toast.error('Ngày hẹn trả bắt đầu không được lớn hơn ngày kết thúc!');
            return;
        }

        setFilteredRecords(applyCurrentFilters(borrowedRecords));
        setShowFilterForm(false);
    };

    // Xóa bộ lọc
    const handleFilterReset = () => {
        setFilterBorrowStartDate(null);
        setFilterBorrowEndDate(null);
        setFilterDueStartDate(null);
        setFilterDueEndDate(null);
        setFilterOverdue(null);
        setFilterConfirmed(null);
        setFilteredRecords(borrowedRecords);
        setCurrentPage(1);
        setShowFilterForm(false);
    };

    // Xác nhận mượn tất cả sách trong phiếu mượn
    const handleConfirmBorrow = async (maphieumuon) => {
        setIsLoading(true);
        try {
            const response = await request.post('/api/confirmBorrowRequest', { maphieumuon });
            if (response.status === 200) {
                await fetchBorrowedBooks();
                toast.success('Xác nhận tất cả sách thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xác nhận yêu cầu mượn!');
        } finally {
            setIsLoading(false);
        }
    };

    // Trả một sách
    const handleReturnBook = async (maphieumuon, masach) => {
        setIsLoading(true);
        const ngaytra = normalizeDate(new Date());
        try {
            const response = await request.post('/api/ReturnBook', {
                maphieumuon,
                masach,
                ngaytra,
            });
            if (response.status === 200) {
                const updatedData = await fetchBorrowedBooks();
                if (selectedRecord && selectedRecord.maphieumuon === maphieumuon) {
                    const updatedRecord = updatedData.find((record) => record.maphieumuon === maphieumuon);
                    if (updatedRecord) {
                        setSelectedRecord({ ...updatedRecord });
                    }
                }
                toast.success('Trả sách thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi trả sách!');
        } finally {
            setIsLoading(false);
        }
    };

    // Trả tất cả sách
    const handleReturnAllBooks = async (maphieumuon) => {
        setIsLoading(true);
        const ngaytra = normalizeDate(new Date());
        try {
            const response = await request.post('/api/ReturnAllBooks', {
                maphieumuon,
                ngaytra,
            });
            if (response.status === 200) {
                const updatedData = await fetchBorrowedBooks();
                if (selectedRecord && selectedRecord.maphieumuon === maphieumuon) {
                    const updatedRecord = updatedData.find((record) => record.maphieumuon === maphieumuon);
                    if (updatedRecord) {
                        setSelectedRecord({ ...updatedRecord });
                    }
                }
                toast.success('Trả tất cả sách thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi trả sách!');
        } finally {
            setIsLoading(false);
        }
    };

    // Gia hạn tất cả sách chưa gia hạn và chưa trả
    const handleExtendAllBorrowing = async (maphieumuon) => {
        setIsLoading(true);
        try {
            const response = await request.post('/api/AdminExtendAllBooks', { maphieumuon });
            if (response.status === 200) {
                const updatedBooks = response.data.updatedBooks || [];
                if (updatedBooks.length === 0) {
                    toast.error('Không có sách nào được gia hạn! Có thể tất cả sách chưa trả đã gia hạn.');
                } else {
                    const updatedData = await fetchBorrowedBooks();
                    if (selectedRecord && selectedRecord.maphieumuon === maphieumuon) {
                        const updatedRecord = updatedData.find((record) => record.maphieumuon === maphieumuon);
                        if (updatedRecord) {
                            setSelectedRecord({ ...updatedRecord });
                        }
                    }
                    toast.success('Gia hạn tất cả sách chưa gia hạn thành công!');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi gia hạn!');
        } finally {
            setIsLoading(false);
        }
    };

    // Gia hạn một sách
    const handleExtendBorrowing = async (maphieumuon, masach) => {
        setIsLoading(true);
        try {
            const response = await request.post('/api/AdminExtendBook', { maphieumuon, masach });
            console.log('API response (AdminExtendBook):', response.data); // Debug API response
            if (response.status === 200) {
                const { data } = response.data;
                if (data && data.masach && data.newngayhentra) {
                    // Lấy dữ liệu mới từ API để đảm bảo đồng bộ
                    const updatedData = await fetchBorrowedBooks();
                    if (selectedRecord && selectedRecord.maphieumuon === maphieumuon) {
                        const updatedRecord = updatedData.find((record) => record.maphieumuon === maphieumuon);
                        if (updatedRecord) {
                            setSelectedRecord({ ...updatedRecord });
                            console.log('Updated selectedRecord:', updatedRecord); // Debug
                        } else {
                            console.warn('Updated record not found for maphieumuon:', maphieumuon);
                        }
                    }
                    toast.success('Gia hạn thời gian mượn thành công!'); // Thông báo màu xanh
                } else {
                    toast.error('Dữ liệu sách gia hạn không hợp lệ! Vui lòng kiểm tra lại.');
                }
            } else {
                toast.error(response.data.message || 'Lỗi khi gia hạn sách!');
            }
        } catch (err) {
            console.error('Error in handleExtendBorrowing:', err);
            toast.error(err.response?.data?.message || 'Lỗi khi gia hạn sách!');
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị modal chi tiết
    const handleShowDetails = (record) => {
        setSelectedRecord({ ...record }); // Tạo bản sao để tránh mutation
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRecord(null);
    };

    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Trạng thái phiếu mượn
    const getRecordStatus = (books) => {
        const allReturned = books.every((book) => book.tinhtrang);
        if (allReturned) {
            return (
                <span className="text-success">
                    <FontAwesomeIcon icon={faCheck} className="me-1" /> Đã trả
                </span>
            );
        }
        return (
            <span className="text-danger">
                <FontAwesomeIcon icon={faTimes} className="me-1" /> Chưa trả
            </span>
        );
    };

    // Trạng thái quá hạn
    const getOverdueStatus = (books, record) => {
        const hasOverdue = books.some((book) =>
            book.tinhtrang
                ? book.overdueDays > 0
                : calculateOverdueDays(
                book.newngayhentra || book.ngayhentra || record.ngayhentra,
                book.tinhtrang,
                book.overdueDays
            ) > 0
        );
        return hasOverdue ? 'Có' : 'Không';
    };

    // Tùy chọn bộ lọc
    const overdueOptions = [
        { value: 'overdue', label: 'Quá hạn' },
        { value: 'notOverdue', label: 'Không quá hạn' },
    ];

    const confirmedOptions = [
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'notConfirmed', label: 'Chưa xác nhận' },
    ];

    return (
        <div className={cx('wrapper')}>
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-4 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Sách Mượn</h4>
                    </div>
                    <div className="col-md-3">
                        <form className="d-flex">
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Tìm kiếm..."
                                aria-label="Search"
                                value={searchValue}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button onClick={() => setShowAddModal(true)} className="btn btn-primary me-2">
                            <i className="bi bi-plus-lg me-2" />
                            Thêm
                        </button>
                        <button
                            onClick={() => setShowFilterForm(!showFilterForm)}
                            className="btn btn-secondary"
                        >
                            <i className="bi bi-filter me-2" />
                            Lọc
                        </button>
                    </div>
                </div>
            </div>

            {showFilterForm && (
                <div className={cx('filter-form')}>
                    <div className="card p-4">
                        <h5>Lọc Phiếu Mượn</h5>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Ngày Mượn</label>
                                    <div className="d-flex gap-2">
                                        <DatePicker
                                            selected={filterBorrowStartDate}
                                            onChange={(date) => setFilterBorrowStartDate(normalizeDate(date))}
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Từ ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                        <DatePicker
                                            selected={filterBorrowEndDate}
                                            onChange={(date) => setFilterBorrowEndDate(normalizeDate(date))}
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Đến ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Ngày Hẹn Trả</label>
                                    <div className="d-flex gap-2">
                                        <DatePicker
                                            selected={filterDueStartDate}
                                            onChange={(date) => setFilterDueStartDate(normalizeDate(date))}
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Từ ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                        <DatePicker
                                            selected={filterDueEndDate}
                                            onChange={(date) => setFilterDueEndDate(normalizeDate(date))}
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date()}
                                            placeholderText="Đến ngày"
                                            className="form-control"
                                            isClearable
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Quá Hạn</label>
                                    <Select
                                        options={overdueOptions}
                                        value={filterOverdue}
                                        onChange={setFilterOverdue}
                                        placeholder="Lựa chọn..."
                                        isClearable
                                        isSearchable
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Xác Nhận</label>
                                    <Select
                                        options={confirmedOptions}
                                        value={filterConfirmed}
                                        onChange={setFilterConfirmed}
                                        placeholder="Lựa chọn..."
                                        isClearable
                                        isSearchable
                                        classNamePrefix="react-select"
                                    />
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
                            <th scope="col">Mã Phiếu</th>
                            <th scope="col">Mã Sinh Viên</th>
                            <th scope="col">Ngày Mượn</th>
                            <th scope="col">Ngày Hẹn Trả</th>
                            <th scope="col">Quá Hạn</th>
                            <th scope="col">Trạng Thái</th>
                            <th scope="col">Xác Nhận</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((record) => (
                                <tr key={record.maphieumuon}>
                                    <td>{record.maphieumuon}</td>
                                    <td>{record.masinhvien}</td>
                                    <td>{formatDate(record.ngaymuon)}</td>
                                    <td>{formatDate(record.ngayhentra)}</td>
                                    <td
                                        className={
                                            getOverdueStatus(record.books, record) === 'Có'
                                                ? 'text-danger fw-bold'
                                                : ''
                                        }
                                    >
                                        {getOverdueStatus(record.books, record)}
                                    </td>
                                    <td>{getRecordStatus(record.books)}</td>
                                    <td>
                                        {record.books.some((book) => !book.confirm && !book.tinhtrang) && (
                                            <button
                                                className="btn btn-success btn-sm w-100"
                                                onClick={() => handleConfirmBorrow(record.maphieumuon)}
                                                disabled={isLoading}
                                            >
                                                Xác nhận
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {record.books.some((book) => book.confirm && !book.tinhtrang) ? (
                                            <div className="d-flex gap-2 flex-wrap">
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleReturnAllBooks(record.maphieumuon)}
                                                    disabled={isLoading}
                                                >
                                                    Trả Tất Cả
                                                </button>
                                                {record.books.every((book) => book.tinhtrang || book.isExtended) ? (
                                                    <span className="text-info">Đã Gia Hạn</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => handleExtendAllBorrowing(record.maphieumuon)}
                                                        disabled={isLoading}
                                                    >
                                                        Gia Hạn Tất Cả
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleShowDetails(record)}
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faInfoCircle} /> Chi Tiết
                                                </button>
                                            </div>
                                        ) : record.books.some((book) => book.tinhtrang) ? (
                                            <span>
                                                    {formatDate(
                                                        record.books.find((book) => book.tinhtrang)?.ngaytra ||
                                                        record.ngaytra
                                                    )}
                                                <button
                                                    className="btn btn-primary btn-sm ms-2"
                                                    onClick={() => handleShowDetails(record)}
                                                    disabled={isLoading}
                                                >
                                                        <FontAwesomeIcon icon={faInfoCircle} /> Chi Tiết
                                                    </button>
                                                </span>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleShowDetails(record)}
                                                disabled={isLoading}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} /> Chi Tiết
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    Không có dữ liệu phiếu mượn
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredRecords.length > 0 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center mt-3">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
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
                                        disabled={isLoading}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                >
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                key={selectedRecord?.maphieumuon || 'modal'} // Buộc re-render khi maphieumuon thay đổi
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Phiếu Mượn: {selectedRecord?.maphieumuon}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <div>
                            <p>
                                <strong>Mã Sinh Viên:</strong> {selectedRecord.masinhvien}
                            </p>
                            <p>
                                <strong>Ngày Mượn:</strong> {formatDate(selectedRecord.ngaymuon)}
                            </p>
                            <p>
                                <strong>Ngày Hẹn Trả:</strong> {formatDate(selectedRecord.ngayhentra)}
                            </p>
                            <p>
                                <strong>Tiền Phạt:</strong>{' '}
                                <span
                                    className={
                                        calculateFine(selectedRecord.books, selectedRecord) > 0
                                            ? 'text-danger fw-bold'
                                            : ''
                                    }
                                >
                                    {calculateFine(selectedRecord.books, selectedRecord).toLocaleString('vi-VN')}{' '}
                                    VND
                                </span>
                            </p>
                            <h5>Danh Sách Sách:</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead>
                                    <tr>
                                        <th>Mã Sách</th>
                                        <th>Tên Sách</th>
                                        <th>Số Lượng</th>
                                        <th>Ngày Hẹn Trả</th>
                                        <th>Quá Hạn</th>
                                        <th>Trạng Thái</th>
                                        <th>Hành Động</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedRecord.books.map((book) => {
                                        const dueDate = book.isExtended
                                            ? book.newngayhentra
                                            : book.originalDueDate || selectedRecord.ngayhentra;
                                        const overdueDays = calculateOverdueDays(
                                            dueDate,
                                            book.tinhtrang,
                                            book.overdueDays
                                        );
                                        return (
                                            <tr key={book.masach}>
                                                <td>{book.masach}</td>
                                                <td>{book.tensach}</td>
                                                <td>{book.soluong || 1}</td>
                                                <td>{formatDate(dueDate)}</td>
                                                <td
                                                    className={overdueDays > 0 ? 'text-danger fw-bold' : ''}
                                                >
                                                    {overdueDays > 0 ? `${overdueDays} ngày` : 'Không'}
                                                </td>
                                                <td>
                                                    {book.tinhtrang ? (
                                                        <span className="text-success">
                                                                <FontAwesomeIcon
                                                                    icon={faCheck}
                                                                    className="me-1"
                                                                />{' '}
                                                            Đã trả
                                                            </span>
                                                    ) : (
                                                        <span className="text-danger">
                                                                <FontAwesomeIcon
                                                                    icon={faTimes}
                                                                    className="me-1"
                                                                />{' '}
                                                            Chưa trả
                                                            </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {book.confirm && !book.tinhtrang ? (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() =>
                                                                    handleReturnBook(
                                                                        selectedRecord.maphieumuon,
                                                                        book.masach
                                                                    )
                                                                }
                                                                disabled={isLoading}
                                                            >
                                                                Trả Sách
                                                            </button>
                                                            {book.isExtended ? (
                                                                <span className="text-info">
                                                                        Đã Gia Hạn
                                                                    </span>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-info btn-sm"
                                                                    onClick={() =>
                                                                        handleExtendBorrowing(
                                                                            selectedRecord.maphieumuon,
                                                                            book.masach
                                                                        )
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    Gia Hạn
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : book.tinhtrang ? (
                                                        <span>{formatDate(book.ngaytra)}</span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <ModalAddHandleBook
                visible={showAddModal}
                onCancel={() => setShowAddModal(false)}
                onSuccess={fetchBorrowedBooks}
            />
        </div>
    );
}

export default HandleBook;