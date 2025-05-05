import classNames from 'classnames/bind';
import styles from '../ManagementUser/ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState } from 'react';
import ModalEditReader from '../../../../Modal/Reader/ModalEditReader';
import ModalDeleteReader from '../../../../Modal/Reader/ModalDeleteReader';
import ModalAddReader from '../../../../Modal/Reader/ModalAddReader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const cx = classNames.bind(styles);

function ManagementReader() {
    const [dataReader, setDataReader] = useState([]);
    const [showModalAddReader, setShowModalAddReader] = useState(false);
    const [showModalEditReader, setShowModalEditReader] = useState(false);
    const [showModalDeleteReader, setShowModalDeleteReader] = useState(false);
    const [valueSearch, setValueSearch] = useState('');
    const [selectedReader, setSelectedReader] = useState(null);
    const [selectedMasinhvien, setSelectedMasinhvien] = useState('');
    const [shouldRefresh, setShouldRefresh] = useState(false);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Số lượng bạn đọc mỗi trang

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleModalAddReader = () => {
        setShowModalAddReader(!showModalAddReader);
    };

    const handleModalEditReader = (reader) => {
        setShowModalEditReader(!showModalEditReader);
        setSelectedReader(reader);
    };

    const handleModalDeleteReader = (masinhvien) => {
        setShowModalDeleteReader(!showModalDeleteReader);
        setSelectedMasinhvien(masinhvien);
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

    // Chặn sự kiện Enter trong ô tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn hành vi mặc định của Enter
        }
    };

    useEffect(() => {
        request.get('/api/getAllReaders')
            .then((res) => {
                setDataReader(res.data.data);
                //setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
            })
            .catch((error) => console.error('Error fetching readers:', error));
    }, [shouldRefresh]);

    // Xử lý tìm kiếm gần đúng theo mã sinh viên qua API
    useEffect(() => {
        const fetchReaders = async () => {
            try {
                if (valueSearch === '') {
                    const res = await request.get('/api/getAllReaders');
                    setDataReader(res.data.data);
                    setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
                } else {
                    const res = await request.get('/api/getReaderByMaSinhVien', {
                        params: { masinhvien: valueSearch },
                    });
                    setDataReader(res.data.reader); // API trả về mảng reader
                    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
                }
            } catch (error) {
                if (error.response?.status === 400) {
                    toast.error('Thiếu mã sinh viên!', { autoClose: 1000 });
                    setDataReader([]);
                } else if (error.response?.status === 404) {
                    toast.info('Không tìm thấy bạn đọc nào!', { autoClose: 1000 });
                    setDataReader([]);
                } else {
                    console.error('Lỗi tìm kiếm:', error);
                    toast.error('Lỗi khi tìm kiếm bạn đọc!', { autoClose: 1000 });
                    setDataReader([]);
                }
            }
        };

        fetchReaders();
    }, [valueSearch]);

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataReader.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataReader.length / itemsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className="container my-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-4 text-center text-md-start">
                        <h4 className="mb-0 fw-bold">Quản Lý Bạn Đọc</h4>
                    </div>
                    <div className="col-12 col-md-5">
                        <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Tìm kiếm theo mã sinh viên"
                                aria-label="Search"
                                value={valueSearch}
                                onChange={(e) => setValueSearch(e.target.value)}
                                onKeyDown={handleKeyDown} // Thêm sự kiện chặn Enter
                            />
                        </form>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button
                            onClick={handleModalAddReader}
                            className="btn btn-primary w-100 w-md-auto"
                        >
                            <i className="bi bi-plus-lg me-2"></i>Thêm Bạn Đọc
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Sinh Viên</th>
                            <th scope="col">Họ Tên</th>
                            <th scope="col">Địa Chỉ</th>
                            <th scope="col">Ngày Sinh</th>
                            <th scope="col">Số Điện Thoại</th>
                            <th scope="col">Email</th>
                            <th scope="col">Loại Độc Giả</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item._id}>
                                    <th scope="row">{item.masinhvien}</th>
                                    <td>{item.hoten}</td>
                                    <td>{item.address}</td>
                                    <td>{formatDate(item.ngaysinh)}</td>
                                    <td>{item.sdt}</td>
                                    <td>{item.email}</td>
                                    <td>{item.typereader === 'Sinh viên' ? 'Sinh Viên' : 'Giảng viên'}</td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                onClick={() => handleModalEditReader(item)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="bi bi-pencil me-1"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => handleModalDeleteReader(item.masinhvien)}
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
                                <td colSpan="8" className="text-center">Không có bạn đọc nào</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {dataReader.length > 0 && (
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

            <ModalAddReader
                showModalAddReader={showModalAddReader}
                setShowModalAddReader={setShowModalAddReader}
                onAddSuccess={handleAddSuccess}
            />
            <ModalEditReader
                readerData={selectedReader}
                showModalEditReader={showModalEditReader}
                setShowModalEditReader={setShowModalEditReader}
                onEditSuccess={handleEditSuccess}
            />
            <ModalDeleteReader
                showModalDeleteReader={showModalDeleteReader}
                setShowModalDeleteReader={setShowModalDeleteReader}
                masinhvien={selectedMasinhvien}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
}

export default ManagementReader;