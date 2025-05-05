import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Grid, Button, Typography, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import request from '../../../../config/Connect';
import Slider from 'react-slick';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    NewReleases,
    Info,
    ContactMail,
    Help,
    Star,
    FormatQuote,
} from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';

// Styled Components
const CategoryCard = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-radius: 12px;
    background: ${({ bgColor }) => bgColor};
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer; /* Thêm con trỏ để biểu thị có thể nhấp */
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
`;

const BookCard = styled(motion.div)`
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
`;

const GuideCard = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
`;

const SectionTitle = styled(Typography)`
    background: ${({ bgColor }) => bgColor || 'rgba(0, 191, 255, 0.8)'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 24px;
`;

// Slider Settings for Books
const bookSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
        { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
};

// Slider Settings for Banner
const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
};

// Component: Banner Slider
const BannerSlider = () => (
    <Slider {...bannerSliderSettings}>
        {['/banner_1.jpg', '/banner_2.jpg', '/banner_3.jpg','/banner_4.jpg'].map((image, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }}
                />
            </motion.div>
        ))}
    </Slider>
);

// Component: Category Section
const CategorySection = ({ onCategoryClick }) => {
    const categories = [
        { icon: <NewReleases sx={{ fontSize: 40, color: 'white' }} />, title: 'Sách mới', bgColor: '#E91E63', section: 'featured' },
        { icon: <Star sx={{ fontSize: 40, color: 'white' }} />, title: 'Sách đề xuất', bgColor: '#FF9800', section: 'recommended' },
        { icon: <FormatQuote sx={{ fontSize: 40, color: 'white' }} />, title: 'Danh ngôn', bgColor: '#FF5722', section: 'quote' },
        { icon: <Help sx={{ fontSize: 40, color: 'white' }} />, title: 'Hướng dẫn', bgColor: '#FFC107', section: 'guide' },
    ];

    return (
        <Grid container spacing={3} justifyContent="center" sx={{ py: 4, bgcolor: '#f8f8f8', borderRadius: '12px' }}>
            {categories.map((item, index) => (
                <Grid item key={index} xs={12} sm={6} md={3} lg={2}>
                    <CategoryCard
                        bgColor={item.bgColor}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => onCategoryClick(item.section)} // Gọi hàm xử lý nhấp chuột
                    >
                        {item.icon}
                        <Typography variant="body1" fontWeight="bold" color="white" mt={1}>
                            {item.title}
                        </Typography>
                    </CategoryCard>
                </Grid>
            ))}
        </Grid>
    );
};

// Component: Book Card
const BookCardItem = ({ book, onViewDetail }) => (
    <BookCard
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
    >
        <Box sx={{ height: 250, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={book.img}
                alt={book.tensach}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
        </Box>
        <Box p={2}>
            <Typography variant="h6" fontWeight="bold" noWrap>
                {book.tensach}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Mã Sách: {book.masach}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ mt: 2, width: '100%' }}
                onClick={() => onViewDetail(book.masach)}
            >
                Xem Chi Tiết
            </Button>
        </Box>
    </BookCard>
);

// Component: Featured Books Section
const FeaturedBooksSection = ({ books, loading, onViewDetail, sectionRef }) => (
    <Container ref={sectionRef} sx={{ my: 5, bgcolor: 'rgba(135, 206, 235, 0.2)', p: 3, borderRadius: '12px' }}>
        <SectionTitle variant="h4">Sách Mới</SectionTitle>
        {loading ? (
            <Slider {...bookSliderSettings}>
                {[...Array(4)].map((_, index) => (
                    <Box key={index} px={2}>
                        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
                        <Skeleton variant="text" width="60%" />
                    </Box>
                ))}
            </Slider>
        ) : (
            <Slider {...bookSliderSettings}>
                {books.map((book) => (
                    <Box key={book._id} px={2}>
                        <BookCardItem book={book} onViewDetail={onViewDetail} />
                    </Box>
                ))}
            </Slider>
        )}
    </Container>
);

// Component: Recommended Books Section
const RecommendedBooksSection = ({ books, loading, onViewDetail, sectionRef }) => (
    <Container ref={sectionRef} sx={{ my: 5, bgcolor: 'rgba(173, 216, 230, 0.2)', p: 3, borderRadius: '12px' }}>
        <SectionTitle variant="h4" bgColor="rgba(70, 130, 180, 0.8)">
            Sách Đề Xuất
        </SectionTitle>
        {loading ? (
            <Slider {...bookSliderSettings}>
                {[...Array(4)].map((_, index) => (
                    <Box key={index} px={2}>
                        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
                        <Skeleton variant="text" width="60%" />
                    </Box>
                ))}
            </Slider>
        ) : (
            <Slider {...bookSliderSettings}>
                {books.map((book) => (
                    <Box key={book._id} px={2}>
                        <BookCardItem book={book} onViewDetail={onViewDetail} />
                    </Box>
                ))}
            </Slider>
        )}
    </Container>
);

// Component: QuoteBookSection
const QuoteBookSection = ({ sectionRef }) => {
    const quotes = [
        { quote: "Cuộc sống giống như một cuốn sách. Có những chương buồn, nhưng cũng có những chương đầy niềm vui.", author: "Khuyết danh" },
        { quote: "Đọc sách không chỉ là để biết, mà còn để hiểu và cảm nhận.", author: "Nguyễn Nhật Ánh" },
        { quote: "Một cuốn sách hay là một người bạn tốt, luôn sẵn sàng chia sẻ và lắng nghe.", author: "Victor Hugo" },
        { quote: "Sách là ngọn đèn sáng bất diệt của trí tuệ con người.", author: "John Milton" },
        { quote: "Hãy đọc sách để mở rộng tâm hồn và khám phá thế giới.", author: "Oprah Winfrey" },
    ];

    const [currentPage, setCurrentPage] = useState(0);
    const dragX = useMotionValue(0);
    const rotateY = useTransform(dragX, [-200, 0, 200], [180, 0, -180]);
    const shadowOpacity = useTransform(dragX, [-200, 0, 200], [0.4, 0, 0.4]);
    const intervalRef = useRef(null);

    useEffect(() => {
        const flipPage = () => {
            setCurrentPage((prevPage) => (prevPage + 1) % quotes.length);
        };

        intervalRef.current = setInterval(flipPage, 5000);

        return () => clearInterval(intervalRef.current);
    }, [quotes.length]);

    const handleDragEnd = () => {
        const dragValue = dragX.get();
        if (dragValue < -50) {
            setCurrentPage((prevPage) => (prevPage + 1) % quotes.length);
        } else if (dragValue > 50) {
            setCurrentPage((prevPage) => (prevPage - 1 + quotes.length) % quotes.length);
        }
        dragX.set(0);
    };

    return (
        <Container ref={sectionRef} sx={{ my: 5, bgcolor: 'rgba(200, 200, 200, 0.1)', p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '800px',
                        height: { xs: '400px', sm: '500px', md: '600px' },
                        position: 'relative',
                        perspective: '1500px',
                        background: 'linear-gradient(135deg, #3c2f2f, #2a1d13)',
                        borderRadius: '12px',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6)',
                        border: '8px solid #2a1d13',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '50%',
                            height: '100%',
                            background: '#fff8e1',
                            boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.1)',
                            transform: 'rotateY(-5deg)',
                            transformOrigin: 'right',
                            padding: { xs: 2, sm: 4 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    color: '#4A2F1A',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                }}
                            >
                                "{quotes[currentPage > 0 ? (currentPage - 1) % quotes.length : quotes.length - 1].quote}"
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    fontWeight: 'bold',
                                    color: '#8B4513',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                - {quotes[currentPage > 0 ? (currentPage - 1) % quotes.length : quotes.length - 1].author}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '50%',
                            height: '100%',
                            background: '#fff8e1',
                            boxShadow: 'inset 5px 0 10px rgba(0, 0, 0, 0.1)',
                            transform: 'rotateY(5deg)',
                            transformOrigin: 'left',
                            padding: { xs: 2, sm: 4 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    color: '#4A2F1A',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                }}
                            >
                                "{quotes[currentPage].quote}"
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    fontWeight: 'bold',
                                    color: '#8B4513',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                - {quotes[currentPage].author}
                            </Typography>
                        </Box>
                    </Box>
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '50%',
                            height: '100%',
                            background: '#fff8e1',
                            boxShadow: 'inset 5px 0 10px rgba(0, 0, 0, 0.1), -3px 0 10px rgba(0, 0, 0, 0.2)',
                            transformOrigin: 'left',
                            rotateY,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: { xs: 2, sm: 4 },
                            zIndex: 10,
                            backfaceVisibility: 'hidden',
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    color: '#4A2F1A',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                }}
                            >
                                "{quotes[currentPage].quote}"
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    fontWeight: 'bold',
                                    color: '#8B4513',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                - {quotes[currentPage].author}
                            </Typography>
                        </Box>
                    </motion.div>
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '50%',
                            height: '100%',
                            background: '#fff8e1',
                            boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.1), 3px 0 10px rgba(0, 0, 0, 0.2)',
                            transformOrigin: 'left',
                            rotateY: useTransform(rotateY, (value) => value + 180),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: { xs: 2, sm: 4 },
                            zIndex: 9,
                            backfaceVisibility: 'hidden',
                        }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    color: '#4A2F1A',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                }}
                            >
                                "{quotes[(currentPage + 1) % quotes.length].quote}"
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    fontWeight: 'bold',
                                    color: '#8B4513',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                - {quotes[(currentPage + 1) % quotes.length].author}
                            </Typography>
                        </Box>
                    </motion.div>
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '50%',
                            height: '100%',
                            background: 'rgba(0, 0, 0, 0)',
                            boxShadow: `3px 0 20px rgba(0, 0, 0, ${shadowOpacity})`,
                            zIndex: 8,
                        }}
                    />
                </Box>
            </Box>
        </Container>
    );
};

// Component: Guide Section
const GuideSection = ({ sectionRef }) => {
    const guides = [
        { icon: <Info sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Giới Thiệu', desc: 'Thông tin chi tiết về hệ thống', link: '/about' },
        { icon: <ContactMail sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Liên Hệ', desc: 'Thông tin liên hệ hỗ trợ', link: '/contact' },
        { icon: <Help sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Hướng Dẫn', desc: 'Hướng dẫn sử dụng chi tiết', link: '/guide' },
    ];

    return (
        <Container ref={sectionRef} sx={{ my: 5, bgcolor: 'rgba(176, 224, 230, 0.2)', p: 3, borderRadius: '12px' }}>
            <SectionTitle variant="h4" bgColor="rgba(25, 25, 112, 0.8)">
                Hướng Dẫn
            </SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {guides.map((guide, index) => (
                    <GuideCard
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        {guide.icon}
                        <Typography variant="h6" fontWeight="bold" mt={2}>
                            {guide.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                            {guide.desc}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            component={Link}
                            to={guide.link}
                            sx={{ mt: 2 }}
                        >
                            Xem Thêm
                        </Button>
                    </GuideCard>
                ))}
            </Box>
        </Container>
    );
};

// Main HomePage Component
const HomePage = () => {
    const navigate = useNavigate();
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tạo refs cho từng section
    const featuredRef = useRef(null);
    const recommendedRef = useRef(null);
    const quoteRef = useRef(null);
    const guideRef = useRef(null);

    // Hàm xử lý nhấp chuột để cuộn đến section
    const handleCategoryClick = (section) => {
        const refMap = {
            featured: featuredRef,
            recommended: recommendedRef,
            quote: quoteRef,
            guide: guideRef,
        };

        const targetRef = refMap[section];
        if (targetRef.current) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredResponse, recommendedResponse] = await Promise.all([
                    request.get('/api/GetLatestUpdatedBooks'),
                    request.get('/api/GetMostBorrowedBooks'),
                ]);

                // Với axios, data đã nằm trực tiếp trong response.data
                const featuredData = featuredResponse.data;
                const recommendedData = recommendedResponse.data;

                setFeaturedBooks(featuredData);
                setRecommendedBooks(recommendedData);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewDetail = (masach) => navigate(`/detailbook/${masach}`);

    return (
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 0 } }}>
            <BannerSlider />
            <CategorySection onCategoryClick={handleCategoryClick} />
            <FeaturedBooksSection
                books={featuredBooks}
                loading={loading}
                onViewDetail={handleViewDetail}
                sectionRef={featuredRef}
            />
            <RecommendedBooksSection
                books={recommendedBooks}
                loading={loading}
                onViewDetail={handleViewDetail}
                sectionRef={recommendedRef}
            />
            <QuoteBookSection sectionRef={quoteRef} />
            <GuideSection sectionRef={guideRef} />
        </Container>
    );
};

export default HomePage;