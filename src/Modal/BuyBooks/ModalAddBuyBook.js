import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

function ModalAddBuyBook({ showModalAddBuyBook, setShowModalAddBuyBook, onAddSuccess }) {
    const [maphieumua, setMaphieumua] = useState('');
    const [masach, setMasach] = useState('');
    const [soluong, setSoluong] = useState('');
    const [dongia, setDongia] = useState('');
    const [mavitri, setMavitri] = useState('');
    const [locations, setLocations] = useState([]);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]); // Danh sách vị trí lọc
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocationQuery, setSearchLocationQuery] = useState(''); // Từ khóa tìm kiếm vị trí
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false); // Dropdown cho vị trí
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showModalAddBuyBook) {
            fetchLocations();
            fetchBooks();
        }
    }, [showModalAddBuyBook]);

    useEffect(() => {
        // Lọc sách dựa trên searchQuery
        if (searchQuery) {
            const filtered = books.filter((book) =>
                book.masach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.tensach.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        } else {
            setFilteredBooks(books);
        }
    }, [searchQuery, books]);

    useEffect(() => {
        // Lọc vị trí dựa trên searchLocationQuery
        if (searchLocationQuery) {
            const filtered = locations.filter((location) =>
                location.mavitri.toLowerCase().includes(searchLocationQuery.toLowerCase())
            );
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(locations);
        }
    }, [searchLocationQuery, locations]);

    const fetchLocations = async () => {
        try {
            const response = await request.get('/api/getAllLocations');
            setLocations(response.data.data);
            setFilteredLocations(response.data.data);
        } catch (error) {
            toast.error('Không thể tải danh sách vị trí!');
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await request.get('/api/GetBooks');
            setBooks(response.data);
            setFilteredBooks(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách sách!');
        }
    };

    const handleSearchBook = async (query) => {
        if (!query) {
            toast.error('Vui lòng nhập mã sách để tìm kiếm!');
            return;
        }
        setLoading(true);
        try {
            const response = await request.get('/api/SearchBookByMaSach', { params: { masach: query } });
            const book = response.data;
            setMasach(book.masach);
            setSearchQuery(`${book.tensach} (${book.masach})`);
            setShowDropdown(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không tìm thấy sách!');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchLocation = async (query) => {
        if (!query) {
            toast.error('Vui lòng nhập mã vị trí để tìm kiếm!');
            return;
        }
        setLoading(true);
        try {
            const response = await request.get('/api/getLocationByMaViTri', { params: { mavitri: query } });
            const location = response.data.data;
            setMavitri(location.mavitri);
            setSearchLocationQuery(location.mavitri);
            setShowLocationDropdown(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không tìm thấy vị trí!');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = (book) => {
        setMasach(book.masach);
        setSearchQuery(`${book.tensach} (${book.masach})`);
        setShowDropdown(false);
    };

    const handleSelectLocation = (location) => {
        setMavitri(location.mavitri);
        setSearchLocationQuery(location.mavitri);
        setShowLocationDropdown(false);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        setMasach('');
        setShowDropdown(true);
    };

    const handleLocationInputChange = (e) => {
        setSearchLocationQuery(e.target.value);
        setMavitri('');
        setShowLocationDropdown(true);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleLocationInputFocus = () => {
        setShowLocationDropdown(true);
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    const handleLocationInputBlur = () => {
        setTimeout(() => setShowLocationDropdown(false), 200);
    };

    const handleClose = () => {
        setShowModalAddBuyBook(false);
        setMaphieumua('');
        setMasach('');
        setSoluong('');
        setDongia('');
        setMavitri('');
        setSearchQuery('');
        setSearchLocationQuery('');
        setShowDropdown(false);
        setShowLocationDropdown(false);
    };

    const handleAddBuyBook = async () => {
        if (!maphieumua || !masach || !soluong || !dongia || !mavitri) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
            return;
        }
        if (isNaN(soluong) || Number(soluong) <= 0 || isNaN(dongia) || Number(dongia) <= 0) {
            toast.error('Số lượng và đơn giá phải là số dương!');
            return;
        }

        const newData = {
            maphieumua,
            masach,
            soluong: Number(soluong),
            dongia: Number(dongia),
            mavitri,
        };

        setLoading(true);
        try {
            const res = await request.post('/api/addBuyBook', newData);
            toast.success(res.data.message || 'Thêm sách cần mua thành công!');
            setShowModalAddBuyBook(false);
            onAddSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thêm sách thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={showModalAddBuyBook} onHide={handleClose} size="lg">
            <Modal.Header closeButton className="justify-content-center">
                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Thêm Sách Cần Mua
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <p>Đang xử lý...</p>
                ) : (
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="formMaphieumua">
                                    <Form.Label>Mã Phiếu Mua</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập mã phiếu mua"
                                        value={maphieumua}
                                        onChange={(e) => setMaphieumua(e.target.value)}
                                        className="shadow-sm"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} style={{ position: 'relative' }}>
                                <Form.Group controlId="formMasach">
                                    <Form.Label>Mã Sách</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập hoặc chọn sách"
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleSearchBook(searchQuery);
                                        }}
                                        className="shadow-sm"
                                        disabled={loading}
                                    />
                                    {showDropdown && filteredBooks.length > 0 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                zIndex: 1000,
                                                backgroundColor: 'white',
                                                border: '1px solid #ccc',
                                                maxHeight: '150px',
                                                overflowY: 'auto',
                                                width: '100%',
                                                left: 0,
                                                top: 'calc(100% + 5px)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            {filteredBooks.map((book) => (
                                                <div
                                                    key={-book.masach}
                                                    onMouseDown={() => handleSelectBook(book)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                                >
                                                    {book.tensach} ({book.masach})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formSoluong">
                                    <Form.Label>Số Lượng</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập số lượng"
                                        value={soluong}
                                        onChange={(e) => setSoluong(e.target.value)}
                                        className="shadow-sm"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formDongia">
                                    <Form.Label>Đơn Giá</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập đơn giá"
                                        value={dongia}
                                        onChange={(e) => setDongia(e.target.value)}
                                        className="shadow-sm"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} style={{ position: 'relative' }}>
                                <Form.Group controlId="formMavitri">
                                    <Form.Label>Mã Vị Trí</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập hoặc chọn vị trí"
                                        value={searchLocationQuery}
                                        onChange={handleLocationInputChange}
                                        onFocus={handleLocationInputFocus}
                                        onBlur={handleLocationInputBlur}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleSearchLocation(searchLocationQuery);
                                        }}
                                        className="shadow-sm"
                                        disabled={loading}
                                    />
                                    {showLocationDropdown && filteredLocations.length > 0 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                zIndex: 1000,
                                                backgroundColor: 'white',
                                                border: '1px solid #ccc',
                                                maxHeight: '150px',
                                                overflowY: 'auto',
                                                width: '100%',
                                                left: 0,
                                                top: 'calc(100% + 5px)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            {filteredLocations.map((location) => (
                                                <div
                                                    key={location._id}
                                                    onMouseDown={() => handleSelectLocation(location)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                                >
                                                    {location.mavitri}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                <Button variant="secondary" onClick={handleClose} className="px-4" disabled={loading}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleAddBuyBook} className="px-4" disabled={loading}>
                    Thêm Mới
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalAddBuyBook;