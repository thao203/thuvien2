import classNames from 'classnames/bind';
import styles from '../Contact/Contact.module.scss';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Typography, Box, Divider, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { styled } from '@mui/system';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Header from '../../HomePage/Layouts/Header/Header';
import MenuLeft from '../../HomePage/Layouts/MenuLeft/MenuLeft';
import Footer from '../../HomePage/Layouts/Footer/Footer';

const cx = classNames.bind(styles);

// Styled components với MUI
const GradientTitle = styled(Typography)(({ theme }) => ({
    fontFamily: 'Arial, sans-serif', // Font chữ cơ bản, đơn giản
    fontWeight: 700, // Giảm độ đậm từ 800 xuống 700
    fontSize: '2rem', // Giảm kích thước từ 3rem xuống 2rem
    background: 'linear-gradient(45deg, #1976d2, #42a5f5)', // Giữ gradient
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontFamily: 'Arial, sans-serif', // Đồng bộ font
    fontWeight: 700,
    fontSize: '1.8rem',
    color: '#1976d2',
    marginBottom: theme.spacing(2),
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: '50px',
        height: '4px',
        background: '#1976d2',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
    },
}));

const SupportText = styled(Typography)(({ theme }) => ({
    fontFamily: 'Arial, sans-serif', // Đồng bộ font
    color: '#666',
    lineHeight: 1.7,
    fontSize: '1.1rem',
    marginBottom: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '12px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: '#f5f7fa',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: '#e3f2fd',
        transform: 'translateX(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
}));

const GradientButton = styled(Button)({
    fontFamily: 'Arial, sans-serif', // Đồng bộ font
    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
    color: 'white',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '25px',
    '&:hover': {
        background: 'linear-gradient(45deg, #115293, #1976d2)',
    },
});

function SupportPage() {
    useEffect(() => {
        document.title = 'Hỗ trợ - Thư viện Điện tử UNETI';
    }, []);

    const listItemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <div className={cx('wrapper')}>
            {/* Header */}
            <header className={cx('header')}>
                <Header />
            </header>

            {/* Main Container */}
            <div className={cx('main-container')}>
                {/* Menu Left */}
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>

                {/* Main Content */}
                <main className={cx('content')}>
                    <Container maxWidth="md" sx={{ py: 6 }}>
                        {/* Lời chào */}
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 6 }}>
                                <GradientTitle variant="h4">
                                    Chào mừng đến Thư viện Điện tử UNETI!
                                </GradientTitle>
                                <SupportText variant="body1">
                                    Khám phá kho tàng tri thức với hàng ngàn tài liệu độc đáo! Chúng tôi ở đây để giúp bạn tận hưởng hành trình học tập và nghiên cứu một cách trọn vẹn nhất. Hãy cùng bắt đầu nào!
                                </SupportText>
                            </Box>
                        </motion.div>

                        <Divider sx={{ mb: 4 }} />

                        {/* Hướng dẫn sử dụng */}
                        <SectionTitle variant="h5">Hướng dẫn sử dụng Thư viện Điện tử</SectionTitle>
                        <List sx={{ pl: 2 }}>
                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-person-plus-fill" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="1. Tạo tài khoản để bắt đầu"
                                        secondary="Dùng mã sinh viên hoặc mã giảng viên để tạo tài khoản. Chưa có? Đừng lo, chỉ cần liên hệ phòng quản lý là xong!"
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-book-fill" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="2. Khám phá danh mục sách"
                                        secondary="Đăng nhập và vào 'Danh mục sách' để tha hồ lựa chọn từ kho sách phong phú của chúng tôi."
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-send-fill" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="3. Gửi yêu cầu mượn sách"
                                        secondary="Chọn sách, nhấn 'Gửi yêu cầu', điền số lượng và vị trí nhận. Ngày mượn sẽ tự động là hôm nay!"
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-info-circle-fill" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="4. Quy định về mượn sách"
                                        secondary={
                                            <Box component="span">
                                                - Giảng viên: 45 ngày, tối đa 9 cuốn.<br />
                                                - Sinh viên: 30 ngày, tối đa 6 cuốn.
                                            </Box>
                                        }
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-geo-alt-fill" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="5. Nhận sách tại thư viện"
                                        secondary="Đến thư viện trong 5 ngày để nhận sách và xác nhận với thủ thư, nếu không yêu cầu sẽ bị hủy."
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-clock-history" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="6. Theo dõi lịch sử mượn sách"
                                        secondary="Xem lại mọi cuốn sách bạn đã mượn tại 'Lịch sử mượn' – tất cả đều trong tầm tay!"
                                    />
                                </StyledListItem>
                            </motion.div>

                            <motion.div variants={listItemVariants} initial="hidden" animate="visible">
                                <StyledListItem>
                                    <ListItemIcon>
                                        <i className="bi bi-arrow-repeat" style={{ color: '#1976d2', fontSize: '24px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="7. Gia hạn thời gian mượn"
                                        secondary={
                                            <>
                                                Cần thêm thời gian? Nhấn 'Gia hạn' tại 'Lịch sử mượn' – mỗi sách được 1 lần duy nhất.<br />
                                                - Giảng viên: 15 ngày.<br />
                                                - Sinh viên: 10 ngày.
                                            </>
                                        }
                                    />
                                </StyledListItem>
                            </motion.div>
                        </List>

                        <Divider sx={{ my: 4 }} />

                        {/* Liên hệ hỗ trợ */}
                        <Box sx={{ textAlign: 'center' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            >
                                <SectionTitle variant="h5">Cần hỗ trợ thêm?</SectionTitle>
                                <SupportText variant="body1">
                                    Đừng ngần ngại liên hệ nếu bạn cần giúp đỡ – chúng tôi luôn sẵn sàng!
                                </SupportText>
                                <SupportText variant="body1">
                                    <strong>Email:</strong> thuvien@uneti.edu.vn
                                </SupportText>
                                <GradientButton variant="contained" sx={{ mt: 2 }}>
                                    Hotline: 0988-123-456
                                </GradientButton>
                            </motion.div>
                        </Box>
                    </Container>
                </main>
            </div>

            {/* Footer */}
            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
}

export default SupportPage;