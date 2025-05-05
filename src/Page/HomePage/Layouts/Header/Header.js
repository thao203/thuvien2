import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import request from '../../../../config/Connect';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Logo from '../../../../asset/img/logo.jpg';

const cx = classNames.bind(styles);

function Header({ setSearchValue, setSortOption }) {
    const [show, setShow] = useState(false);
    const [checkAdmin, setCheckAdmin] = useState(false);

    const handleShow = () => {
        setShow(!show);
    };

    const getToken = () => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCheckAdmin(decoded.isAdmin === true);
            } catch (error) {
                console.error('Token không hợp lệ:', error);
                setCheckAdmin(false);
            }
        }
    }, []);

    const handleLogout = () => {
        request.get('/api/logout').then((res) => console.log(res));
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    return (
        <div className={cx('wrapper')}>
            <div className="d-flex align-items-center mb-2">
                <Link to="/homepage">
                    <img style={{ width: '50px' }} src={Logo} alt="Logo UNETI" />
                </Link>
                <div className={cx('title')}>
                    <h6>TRUNG TÂM THƯ VIỆN</h6>
                    <span>THƯ VIỆN ĐIỆN TỬ</span>
                </div>

                <div className="d-flex align-items-center ms-auto" style={{ gap: '25px' }}>
                    {(window.location.pathname === '/books' || window.location.pathname === '/categories') && (
                        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                            <form className="d-flex">
                                <input
                                    className="form-control me-2"
                                    type="search"
                                    placeholder="Tìm Kiếm"
                                    aria-label="Search"
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </form>
                            {window.location.pathname === '/books' && (
                                <select
                                    className="form-select"
                                    style={{ width: '150px' }}
                                    onChange={handleSortChange}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Sắp xếp theo
                                    </option>
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="az">A-Z</option>
                                    <option value="za">Z-A</option>
                                    <option value="mostBorrowed">Được mượn nhiều nhất</option>
                                </select>
                            )}
                        </div>
                    )}

                    <ul className="navbar-nav d-flex flex-row align-items-center mb-0" style={{ gap: '15px' }}>
                        {/* Icon giỏ hàng */}
                        <li className="nav-item">
                            <Link to="/cart" className="nav-link p-0">
                                <ShoppingCartIcon style={{ fontSize: '30px', verticalAlign: 'middle' }} />
                            </Link>
                        </li>
                        {/* Icon avatar */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle p-0"
                                href="#/"
                                id="navbarDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <AccountCircleIcon style={{ fontSize: '30px', verticalAlign: 'middle' }} />
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li>
                                    <Link to="/info" className="dropdown-item">
                                        Thông Tin Tài Khoản
                                    </Link>
                                </li>
                                {checkAdmin && (
                                    <li>
                                        <Link to="/admin" className="dropdown-item">
                                            Trang Quản Trị Admin
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link className="dropdown-item" to="/changepass">
                                        Đổi mật khẩu
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li onClick={handleLogout}>
                                    <a className="dropdown-item" href="/">
                                        Đăng Xuất
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Header;