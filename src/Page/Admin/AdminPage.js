import classNames from 'classnames/bind';
import styles from './AdminPage.module.scss';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook, faUsers, faExchangeAlt, faChartBar, faBars, faTimes, faHome,
    faUserFriends, faLayerGroup, faMapMarkerAlt, faShoppingCart, faAngleDown, faAngleUp,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import ManagementBooks from './Layouts/ManagementBooks/ManagementBooks';
import ManagementUser from './Layouts/ManagementUser/ManagementUser';
import HandleBook from './Layouts/HandleBook/HandleBook';
import BaoCaoThongKe from './Layouts/Report/Report';
import ManagementReader from './Layouts/ManagementReader/ManagementReader';
import ManagementCategory from './Layouts/ManagementCategory/ManagementCategory';
import ManagementLocation from './Layouts/ManagementLocation/ManagementLocation';
import BuyBook from './Layouts/BuyBooks/BuyBooks';
import ReportBookInStock from './Layouts/ReportBookInStock/ReportBookInStock';
import 'bootstrap/dist/css/bootstrap.min.css';
import request from '../../config/Connect';
import ClearanceBooks from './Layouts/ClearanceBooks/ClearanceBooks';

const cx = classNames.bind(styles);
const handleLogout = () => {
    request.get('/api/logout').then((res) => console.log(res));
};

function AdminPage() {
    const [checkPage, setCheckPage] = useState('1');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        document.title = "Trang quản trị";
    }, []);

    const toggleSubmenu = (menu) => {
        setOpenSubmenu(openSubmenu === menu ? null : menu);
    };

    return (
        <div className={cx('wrapper')}>
            {/* Thanh tiêu đề */}
            <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: '#2c3e50' }}>
                <div className="container-fluid">
                    <button
                        className="btn btn-outline-light me-2"
                        onClick={toggleSidebar}
                    >
                        <FontAwesomeIcon icon={isSidebarCollapsed ? faBars : faTimes} />
                    </button>
                    <Link to="/homepage" className="navbar-brand text-white fw-bold">
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        TRANG CHỦ
                    </Link>
                    <div className="mx-auto">
                        <h4 className="text-white mb-0 fw-light">HỆ THỐNG QUẢN LÝ THƯ VIỆN</h4>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
                            Xin Chào: Admin
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li onClick={handleLogout}>
                                <a className="dropdown-item" href="/">
                                    Đăng Xuất
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Bố cục chính */}
            <div className="d-flex">
                {/* Thanh bên */}
                <div className={cx('sidebar', 'shadow-sm', { collapsed: isSidebarCollapsed })}>
                    <ul className="nav flex-column">
                        <li
                            className={cx('nav-item', { active: checkPage === '1' })}
                            onClick={() => setCheckPage('1')}
                        >
                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                            {!isSidebarCollapsed && 'Quản Lý Người Dùng'}
                        </li>
                        <li
                            className={cx('nav-item', { active: checkPage === '2' })}
                            onClick={() => setCheckPage('2')}
                        >
                            <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                            {!isSidebarCollapsed && 'Quản Lý Độc Giả'}
                        </li>
                        <li
                            className={cx('nav-item', { active: ['3', '4', '5'].includes(checkPage) })}
                            onClick={() => toggleSubmenu('inventory')}
                        >
                            <FontAwesomeIcon icon={faBook} className="me-2" />
                            {!isSidebarCollapsed && (
                                <>
                                    Quản Lý Kho Sách
                                    <FontAwesomeIcon
                                        icon={openSubmenu === 'inventory' ? faAngleUp : faAngleDown}
                                        className="ms-2 float-end"
                                    />
                                </>
                            )}
                        </li>
                        {openSubmenu === 'inventory' && !isSidebarCollapsed && (
                            <ul className="nav flex-column ms-3">
                                <li
                                    className={cx('nav-item', { active: checkPage === '3' })}
                                    onClick={() => setCheckPage('3')}
                                >
                                    <FontAwesomeIcon icon={faBook} className="me-2" />
                                    Quản Lý Sách
                                </li>
                                <li
                                    className={cx('nav-item', { active: checkPage === '4' })}
                                    onClick={() => setCheckPage('4')}
                                >
                                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                                    Quản Lý Danh Mục
                                </li>
                                <li
                                    className={cx('nav-item', { active: checkPage === '5' })}
                                    onClick={() => setCheckPage('5')}
                                >
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                    Quản Lý Vị Trí
                                </li>
                            </ul>
                        )}
                        <li
                            className={cx('nav-item', { active: checkPage === '6' })}
                            onClick={() => setCheckPage('6')}
                        >
                            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                            {!isSidebarCollapsed && 'Quản Lý Mượn Trả'}
                        </li>
                        <li
                            className={cx('nav-item', { active: ['7', '8', '9', '10'].includes(checkPage) })} // Thêm '10'
                            onClick={() => toggleSubmenu('report')}
                        >
                            <FontAwesomeIcon icon={faChartBar} className="me-2" />
                            {!isSidebarCollapsed && (
                                <>
                                    Báo Cáo Thống Kê
                                    <FontAwesomeIcon
                                        icon={openSubmenu === 'report' ? faAngleUp : faAngleDown}
                                        className="ms-2 float-end"
                                    />
                                </>
                            )}
                        </li>
                        {openSubmenu === 'report' && !isSidebarCollapsed && (
                            <ul className="nav flex-column ms-3">
                                <li
                                    className={cx('nav-item', { active: checkPage === '7' })}
                                    onClick={() => setCheckPage('7')}
                                >
                                    <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                                    Báo Cáo Mượn Trả
                                </li>
                                <li
                                    className={cx('nav-item', { active: checkPage === '8' })}
                                    onClick={() => setCheckPage('8')}
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                    Sách Dự Kiến Mua
                                </li>
                                <li
                                    className={cx('nav-item', { active: checkPage === '9' })}
                                    onClick={() => setCheckPage('9')}
                                >
                                    <FontAwesomeIcon icon={faBook} className="me-2" />
                                    Báo Cáo Tồn Kho
                                </li>
                                <li
                                    className={cx('nav-item', { active: checkPage === '10' })} // Thêm option mới
                                    onClick={() => setCheckPage('10')}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                    Sách Thanh Lý
                                </li>
                            </ul>
                        )}
                    </ul>
                </div>

                {/* Nội dung chính */}
                <div className={cx('content', 'flex-grow-1 p-4')}>
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            {checkPage === '1' && <ManagementUser />}
                            {checkPage === '2' && <ManagementReader />}
                            {checkPage === '3' && <ManagementBooks />}
                            {checkPage === '4' && <ManagementCategory />}
                            {checkPage === '5' && <ManagementLocation />}
                            {checkPage === '6' && <HandleBook />}
                            {checkPage === '7' && <BaoCaoThongKe />}
                            {checkPage === '8' && <BuyBook />}
                            {checkPage === '9' && <ReportBookInStock />}
                            {checkPage === '10' && <ClearanceBooks />} {/* Thêm component mới */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;