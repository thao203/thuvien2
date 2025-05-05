import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

function ModalAddClearanceBooks({ showModalAddClearanceBooks, setShowModalAddClearanceBooks, onAddSuccess }) {
    const [masachthanhly, setMasachthanhly] = useState('');
    const [masach, setMasach] = useState('');
    const [soluong, setSoluong] = useState('');
    const [mavitri, setMavitri] = useState('');
    const [lydo, setLydo] = useState('');

    // State for location search
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // State for book list
    const [books, setBooks] = useState([]);
    const [showBooksDropdown, setShowBooksDropdown] = useState(false);

    const handleClose = () => {
        setShowModalAddClearanceBooks(false);
        resetForm();
    };

    const resetForm = () => {
        setMasachthanhly('');
        setMasach('');
        setSoluong('');
        setMavitri('');
        setLydo('');
        setLocationSearchQuery('');
        setBooks([]);
        setShowBooksDropdown(false);
        setShowLocationDropdown(false);
    };

    const toastOptions = {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    useEffect(() => {
        if (showModalAddClearanceBooks) {
            fetchAllLocations();
        }
    }, [showModalAddClearanceBooks]);

    // Fetch all locations
    const fetchAllLocations = async () => {
        setLoadingLocations(true);
        try {
            const response = await request.get('/api/getAllLocations');
            const data = response.data.data || [];
            setLocations(data);
            setFilteredLocations(data);
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch vá»‹ trÃ­!', toastOptions);
            setLocations([]);
            setFilteredLocations([]);
        } finally {
            setLoadingLocations(false);
        }
    };

    // Filter locations based on search query
    useEffect(() => {
        if (locationSearchQuery && locations.length > 0) {
            const filtered = locations.filter((location) =>
                location.mavitri.toLowerCase().includes(locationSearchQuery.toLowerCase())
            );
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(locations);
        }
    }, [locationSearchQuery, locations]);

    // Fetch books by location
    const fetchBooksByLocation = async (mavitri) => {
        try {
            const response = await request.get('/api/getBooksByLocation', {
                params: { mavitri },
            });
            const data = response.data.data || [];
            setBooks(data);
            setShowBooksDropdown(true);
            if (data.length === 0) {
                toast.info('KhÃ´ng cÃ³ sÃ¡ch nÃ o táº¡i vá»‹ trÃ­ nÃ y!', toastOptions);
            }
        } catch (error) {
            console.error('Error fetching books by location:', error);
            toast.error(error.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch sÃ¡ch!', toastOptions);
            setBooks([]);
            setShowBooksDropdown(false);
        }
    };

    const handleSelectLocation = (location) => {
        setMavitri(location.mavitri);
        setLocationSearchQuery(location.mavitri);
        setShowLocationDropdown(false);
        fetchBooksByLocation(location.mavitri);
    };

    const handleLocationInputChange = (e) => {
        setLocationSearchQuery(e.target.value);
        setMavitri('');
        setShowLocationDropdown(true);
        setBooks([]);
        setShowBooksDropdown(false);
        setMasach(''); // Reset masach when location changes
    };

    const handleLocationInputFocus = () => {
        setShowLocationDropdown(true);
    };

    const handleLocationInputBlur = () => {
        setTimeout(() => setShowLocationDropdown(false), 200);
    };

    const handleSelectBook = (book) => {
        setMasach(book.masach);
        setShowBooksDropdown(false);
    };

    const isFormValid = () => {
        return masachthanhly && masach && soluong && mavitri && lydo && Number(soluong) > 0;
    };

    const handleAddClearanceBook = async () => {
        if (!isFormValid()) {
            toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c!', toastOptions);
            return;
        }

        try {
            const payload = {
                masachthanhly,
                masach,
                soluong: Number(soluong),
                mavitri,
                lydo,
            };

            const res = await request.post('/api/addClearanceBook', payload);

            toast.success(res.data.message || 'ThÃªm sÃ¡ch thanh lÃ½ thÃ nh cÃ´ng!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onAddSuccess();
                },
            });
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi thÃªm sÃ¡ch thanh lÃ½!';
            toast.error(errorMessage, toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalAddClearanceBooks} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ThÃªm SÃ¡ch Thanh LÃ½
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group controlId="formMasachthanhly">
                                    <Form.Label>MÃ£ SÃ¡ch Thanh LÃ½</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nháº­p mÃ£ sÃ¡ch thanh lÃ½"
                                        value={masachthanhly}
                                        onChange={(e) => setMasachthanhly(e.target.value)}
                                        className="shadow-sm"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} style={{ position: 'relative' }}>
                                <Form.Group controlId="formMasach">
                                    <Form.Label>MÃ£ SÃ¡ch</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Chá»n mÃ£ sÃ¡ch tá»« vá»‹ trÃ­"
                                        value={masach}
                                        onChange={(e) => setMasach(e.target.value)}
                                        onFocus={() => books.length > 0 && setShowBooksDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowBooksDropdown(false), 200)}
                                        className="shadow-sm"
                                        required
                                    />
                                    {showBooksDropdown && books.length > 0 && (
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
                                            {books.map((book) => (
                                                <div
                                                    key={book.masach}
                                                    onMouseDown={() => handleSelectBook(book)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#f0f0f0')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor = 'white')
                                                    }
                                                >
                                                    {book.masach} - {book.tensach}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formSoluong">
                                    <Form.Label>Sá»‘ LÆ°á»£ng</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nháº­p sá»‘ lÆ°á»£ng"
                                        value={soluong}
                                        onChange={(e) => setSoluong(e.target.value)}
                                        min="1"
                                        className="shadow-sm"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} style={{ position: 'relative' }}>
                                <Form.Group controlId="formMavitri">
                                    <Form.Label>MÃ£ Vá»‹ TrÃ­</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nháº­p hoáº·c chá»n mÃ£ vá»‹ trÃ­"
                                        value={locationSearchQuery}
                                        onChange={handleLocationInputChange}
                                        onFocus={handleLocationInputFocus}
                                        onBlur={handleLocationInputBlur}
                                        className="shadow-sm"
                                        disabled={loadingLocations}
                                        required
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
                                                    key={location.mavitri}
                                                    onMouseDown={() => handleSelectLocation(location)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#f0f0f0')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor = 'white')
                                                    }
                                                >
                                                    {location.mavitri} - {location.coso}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formLydo">
                                    <Form.Label>LÃ½ Do</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nháº­p lÃ½ do thanh lÃ½"
                                        value={lydo}
                                        onChange={(e) => setLydo(e.target.value)}
                                        className="shadow-sm"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={handleClose} className="px-4">
                        ÄÃ³ng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddClearanceBook}
                        className="px-4"
                        disabled={!isFormValid()}
                    >
                        ThÃªm Má»›i
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalAddClearanceBooks;
