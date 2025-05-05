import classNames from 'classnames/bind';
import styles from './Contact.module.scss';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Grid, Typography, Card, CardContent, CardMedia, Box, Divider, Button } from '@mui/material';
import { styled } from '@mui/system';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'; // Thêm useLoadScript
import 'bootstrap-icons/font/bootstrap-icons.css';

import Header from '../../HomePage/Layouts/Header/Header';
import MenuLeft from '../../HomePage/Layouts/MenuLeft/MenuLeft';
import Footer from '../../HomePage/Layouts/Footer/Footer';

const cx = classNames.bind(styles);

// Styled components với MUI
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    },
}));

const StyledCardMedia = styled(CardMedia)({
    height: 200,
    objectFit: 'cover',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
});

const TitleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
}));

// Cấu hình bản đồ
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '8px',
    marginTop: '16px',
};

// Tọa độ cho các cơ sở
const locations = {
    hanoi1: { lat: 21.0005, lng: 105.8606 }, // 454 Minh Khai, Hai Bà Trưng, Hà Nội
    hanoi2: { lat: 20.9875, lng: 105.8385 }, // 218 Lĩnh Nam, Hoàng Mai, Hà Nội
    namdinh: { lat: 20.4333, lng: 106.1667 }, // 353 Trần Hưng Đạo, Nam Định
};

function Contact() {
    const [showMap, setShowMap] = useState({ hanoi1: false, hanoi2: false, namdinh: false });

    // Tải Google Maps API
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyCvO8HGZOTpaJwi7e-BegcOx_XTlJxbrq4', // Thay bằng khóa API của bạn
    });

    useEffect(() => {
        document.title = 'Liên hệ';
    }, []);

    const toggleMap = (location) => {
        setShowMap((prev) => ({ ...prev, [location]: !prev[location] }));
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    // Thành phần bản đồ
    const MapComponent = ({ center }) => {
        if (!isLoaded) return <div>Đang tải bản đồ...</div>;
        if (loadError) return <div>Lỗi khi tải bản đồ</div>;

        return (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={{ disableDefaultUI: false }}
            >
                <Marker position={center} />
            </GoogleMap>
        );
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <Header />
            </header>

            <div className={cx('main-container')}>
                <aside className={cx('menu-left')}>
                    <MenuLeft />
                </aside>

                <main className={cx('content')}>
                    <Container maxWidth="lg" sx={{ py: 6 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                            <TitleTypography variant="h3">Liên hệ với chúng tôi</TitleTypography>
                        </motion.div>

                        <Grid container spacing={4} justifyContent="center">
                            {/* Cơ sở Hà Nội - Minh Khai */}
                            <Grid item xs={12} md={4}>
                                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                    <StyledCard>
                                        <StyledCardMedia
                                            component="img"
                                            image="uneti_MK.jpg"
                                            alt="Hà Nội - Minh Khai"
                                        />
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                Cơ sở Minh Khai, Hà Nội
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                <strong>Địa chỉ:</strong> 454 Minh Khai, Q. Hai Bà Trưng, TP. Hà Nội
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    startIcon={<i className="bi bi-geo-alt-fill" />}
                                                    onClick={() => toggleMap('hanoi1')}
                                                >
                                                    {showMap.hanoi1 ? 'Ẩn bản đồ' : 'Xem bản đồ'}
                                                </Button>
                                            </Box>
                                            {showMap.hanoi1 && <MapComponent center={locations.hanoi1} />}
                                        </CardContent>
                                    </StyledCard>
                                </motion.div>
                            </Grid>

                            {/* Cơ sở Hà Nội - Lĩnh Nam */}
                            <Grid item xs={12} md={4}>
                                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                    <StyledCard>
                                        <StyledCardMedia
                                            component="img"
                                            image="uneti_LN.jpg"
                                            alt="Hà Nội - Lĩnh Nam"
                                        />
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                Cơ sở Lĩnh Nam, Hà Nội
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                <strong>Địa chỉ:</strong> 218 Lĩnh Nam, Q. Hoàng Mai, TP. Hà Nội
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    startIcon={<i className="bi bi-geo-alt-fill" />}
                                                    onClick={() => toggleMap('hanoi2')}
                                                >
                                                    {showMap.hanoi2 ? 'Ẩn bản đồ' : 'Xem bản đồ'}
                                                </Button>
                                            </Box>
                                            {showMap.hanoi2 && <MapComponent center={locations.hanoi2} />}
                                        </CardContent>
                                    </StyledCard>
                                </motion.div>
                            </Grid>

                            {/* Cơ sở Nam Định */}
                            <Grid item xs={12} md={4}>
                                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                    <StyledCard>
                                        <StyledCardMedia
                                            component="img"
                                            image="/uneti_ND.jpg"
                                            alt="Nam Định Campus"
                                        />
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                Cơ sở Nam Định
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                <strong>Địa chỉ:</strong> 353 Trần Hưng Đạo, TP. Nam Định, Nam Định
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    startIcon={<i className="bi bi-geo-alt-fill" />}
                                                    onClick={() => toggleMap('namdinh')}
                                                >
                                                    {showMap.namdinh ? 'Ẩn bản đồ' : 'Xem bản đồ'}
                                                </Button>
                                            </Box>
                                            {showMap.namdinh && <MapComponent center={locations.namdinh} />}
                                        </CardContent>
                                    </StyledCard>
                                </motion.div>
                            </Grid>
                        </Grid>

                        {/* Thông tin bổ sung */}
                        <Box sx={{ mt: 6, textAlign: 'center' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    Liên hệ qua email: <strong>thuvien@uneti.edu.vn</strong>
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                    Hotline: <strong>0988-123-456</strong>
                                </Typography>
                            </motion.div>
                        </Box>
                    </Container>
                </main>
            </div>

            <footer className={cx('footer')}>
                <Footer />
            </footer>
        </div>
    );
}

export default Contact;