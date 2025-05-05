import classNames from 'classnames/bind';
import styles from './ManagementUser.module.scss';
import request from '../../../../config/Connect';
import { useEffect, useState } from 'react';
import ModalEditUser from '../../../../Modal/User/ModalEditUser';
import ModalDeleteUser from '../../../../Modal/User/ModalDeleteUser';
import ModalAddUser from '../../../../Modal/User/ModalAddUser';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const cx = classNames.bind(styles);

function ManagementUser() {
    const [dataUser, setDataUser] = useState([]);
    const [showModalAddUser, setShowModalAddUser] = useState(false);
    const [showModalEditUser, setShowModalEditUser] = useState(false);
    const [showModalDeleteUser, setShowModalDeleteUser] = useState(false);
    const [valueSearch, setValueSearch] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [selectedMasinhvien, setSelectedMasinhvien] = useState('');
    const [shouldRefresh, setShouldRefresh] = useState(false);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Số lượng người dùng mỗi trang

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleModalAddUser = () => {
        setShowModalAddUser(!showModalAddUser);
    };

    const handleModalEditUser = (id) => {
        setShowModalEditUser(!showModalEditUser);
        setSelectedId(id);
    };

    const handleModalDeleteUser = (masinhvien) => {
        setShowModalDeleteUser(!showModalDeleteUser);
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
        request.get('/api/getAllUsers')
            .then((res) => {
                setDataUser(res.data);
                // setCurrentPage(1);
            })
            .catch((error) => console.error(error));
    }, [shouldRefresh]);

    // Xử lý tìm kiếm theo mã sinh viên
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (valueSearch === '') {
                    const res = await request.get('/api/getAllUsers');
                    setDataUser(res.data);
                    setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
                } else {
                    const res = await request.get('/api/getUserByMaSinhVien', {
                        params: { masinhvien: valueSearch },
                    });
                    setDataUser(res.data);
                    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setDataUser([]);
                } else {
                    console.error('Lỗi tìm kiếm:', error);
                }
            }
        };

        fetchUsers();
    }, [valueSearch]);

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataUser.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataUser.length / itemsPerPage);

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
                        <h4 className="mb-0 fw-bold">Quản Lý Người Dùng</h4>
                    </div>
                    <div className="col-12 col-md-5">
                        <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Tìm kiếm theo mã tài khoản"
                                aria-label="Search"
                                value={valueSearch}
                                onChange={(e) => setValueSearch(e.target.value)}
                                onKeyDown={handleKeyDown} // Thêm sự kiện chặn Enter
                            />
                        </form>
                    </div>
                    <div className="col-12 col-md-3 text-center text-md-end">
                        <button
                            onClick={handleModalAddUser}
                            className="btn btn-primary w-100 w-md-auto"
                        >
                            <i className="bi bi-plus-lg me-2"></i>Thêm Người Dùng
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã Tài Khoản</th>
                            <th scope="col">Quyền</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item._id}>
                                    <th scope="row">{item.masinhvien}</th>
                                    <td>{item.isAdmin ? 'Admin' : 'User'}</td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                onClick={() => handleModalEditUser(item.masinhvien)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                <i className="bi bi-pencil me-1"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => handleModalDeleteUser(item.masinhvien)}
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
                                <td colSpan="3" className="text-center">Không có người dùng nào</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {dataUser.length > 0 && (
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

            <ModalAddUser
                showModalAddUser={showModalAddUser}
                setShowModalAddUser={setShowModalAddUser}
                onAddSuccess={handleAddSuccess}
            />
            <ModalEditUser
                idUser={selectedId}
                showModalEditUser={showModalEditUser}
                setShowModalEditUser={setShowModalEditUser}
                onEditSuccess={handleEditSuccess}
            />
            <ModalDeleteUser
                showModalDeleteUser={showModalDeleteUser}
                setShowModalDeleteUser={setShowModalDeleteUser}
                masinhvien={selectedMasinhvien}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
}

export default ManagementUser;