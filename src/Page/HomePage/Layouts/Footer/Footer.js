import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import {
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Home as HomeIcon,
    History as HistoryIcon,
    AccountCircle as AccountIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Twitter as TwitterIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx('footer')}>
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5>Thông Tin Liên Hệ</h5>
                        <p>
                            <EmailIcon fontSize="small" /> Địa chỉ: 218 Lĩnh Nam, Q. Hoàng Mai, TP. Hà Nội
                        </p>
                        <p>
                            <EmailIcon fontSize="small" />
                            <a href="mailto:library@uneti.edu.vn">thuvien@uneti.edu.vn</a>
                        </p>
                        <p>
                            <PhoneIcon fontSize="small" />
                            <a href="tel:0988-123-456">0988-123-456</a>
                        </p>
                    </div>
                    <div className="col-md-4">
                        <h5>Liên Kết Nhanh</h5>
                        <ul className={cx('link-list')}>
                            <li>
                                <Tooltip title="Trang Chủ">
                                    <IconButton component={Link} to="/homepage" color="inherit">
                                        <HomeIcon />
                                    </IconButton>
                                </Tooltip>
                                Trang Chủ
                            </li>
                            <li>
                                <Tooltip title="Lịch Sử Mượn">
                                    <IconButton component={Link} to="/history" color="inherit">
                                        <HistoryIcon />
                                    </IconButton>
                                </Tooltip>
                                Lịch Sử Mượn
                            </li>
                            <li>
                                <Tooltip title="Thông Tin Tài Khoản">
                                    <IconButton component={Link} to="/info" color="inherit">
                                        <AccountIcon />
                                    </IconButton>
                                </Tooltip>
                                Thông Tin Tài Khoản
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h5>Theo Dõi Chúng Tôi</h5>
                        <p>
                            <Tooltip title="Facebook">
                                <IconButton href="https://facebook.com" target="_blank" color="inherit">
                                    <FacebookIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Instagram">
                                <IconButton href="https://instagram.com" target="_blank" color="inherit">
                                    <InstagramIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Twitter">
                                <IconButton href="https://twitter.com" target="_blank" color="inherit">
                                    <TwitterIcon />
                                </IconButton>
                            </Tooltip>
                        </p>
                    </div>
                </div>
                <div className={cx('copyright')}>
                    <p>© 2025 Trung Tâm Thư Viện UNETI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;