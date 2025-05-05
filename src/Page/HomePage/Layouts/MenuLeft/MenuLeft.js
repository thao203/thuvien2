import classNames from 'classnames/bind';
import styles from './MenuLeft.module.scss';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    IconButton,
    Collapse,
    Divider,
} from '@mui/material';
import {
    Home as HomeIcon,
    Book as BookIcon,
    History as HistoryIcon,
    AccountCircle as AccountIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Info as InfoIcon,
    ContactMail as ContactIcon,
} from '@mui/icons-material';
import { LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
const cx = classNames.bind(styles);

function MenuLeft() {
    const location = useLocation();
    const [open, setOpen] = useState(window.innerWidth > 768); // Mặc định thu gọn trên mobile

    const menuItems = [
        { path: '/homepage', name: 'Trang Chủ', icon: <HomeIcon /> },
        { path: '/books', name: 'Danh Sách Sách', icon: <BookIcon /> },
        { path: '/categories', name: 'Danh Mục Sách', icon: <LibraryBooksIcon /> },
        { path: '/history', name: 'Lịch Sử Mượn', icon: <HistoryIcon /> },
        { path: '/info', name: 'Thông Tin Tài Khoản', icon: <AccountIcon /> },
    ];

    const subMenuItems = [
        { path: '/about', name: 'Giới Thiệu', icon: <InfoIcon /> },
        { path: '/guide', name: 'Hướng Dẫn', icon: <HelpIcon /> },
        { path: '/contact', name: 'Liên Hệ', icon: <ContactIcon /> },
    ];

    const handleToggle = () => {
        setOpen(!open);
    };

    return (
        <div className={cx('menu-left', { collapsed: !open })}>
            <div className={cx('toggle-button')}>
                <IconButton onClick={handleToggle}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </div>

            <List component="nav" className={cx('menu-list')}>
                {/* Menu chính */}
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <Tooltip title={open ? '' : item.name} placement="right">
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    className={cx('menu-item', {
                                        active: location.pathname === item.path,
                                    })}
                                >
                                    <ListItemIcon className={cx('menu-icon')}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                        <ListItemText primary={item.name} className={cx('menu-text')} />
                                    </Collapse>
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                        {index < menuItems.length - 1 && <Divider />}
                    </div>
                ))}

                {/* Menu phụ */}
                {subMenuItems.map((item, index) => (
                    <div key={`sub-${index}`}>
                        <Tooltip title={open ? '' : item.name} placement="right">
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    className={cx('menu-item', {
                                        active: location.pathname === item.path,
                                    })}
                                >
                                    <ListItemIcon className={cx('menu-icon')}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                        <ListItemText primary={item.name} className={cx('menu-text')} />
                                    </Collapse>
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                        {index < subMenuItems.length - 1 && <Divider />}
                    </div>
                ))}
            </List>
        </div>
    );
}

export default MenuLeft;