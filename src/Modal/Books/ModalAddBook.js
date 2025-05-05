import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ModalAddBook({ showModalAddBook, setShowModalAddBook, onSuccess }) {
    const handleClose = () => setShowModalAddBook(false);

    const [masach, setMasach] = useState('');
    const [img, setImg] = useState('');
    const [tensach, setTensach] = useState('');
    const [tacgia, setTacgia] = useState('');
    const [nhaxuatban, setNhaxuatban] = useState('');
    const [namxb, setNamxb] = useState('');
    const [phienban, setPhienban] = useState('');
    const [madanhmuc, setMadanhmuc] = useState('');
    const [mota, setMota] = useState('');
    const [vitri, setVitri] = useState([{ mavitri: '', soluong: '' }]);
    const [pages, setPages] = useState('');
    const [price, setPrice] = useState('');

    // State for category search functionality
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // State for locations
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [locationSearchQueries, setLocationSearchQueries] = useState(['']);
    const [showLocationDropdowns, setShowLocationDropdowns] = useState([false]);
    const [loadingLocations, setLoadingLocations] = useState(false);

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
        if (showModalAddBook) {
            fetchAllCategories();
            fetchAllLocations();
        }
    }, [showModalAddBook]);

    // Filter categories based on search query
    useEffect(() => {
        if (categorySearchQuery && categories.length > 0) {
            const filtered = categories.filter((category) =>
                category &&
                category.madanhmuc &&
                category.madanhmuc.toLowerCase().includes(categorySearchQuery.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [categorySearchQuery, categories]);

    // Filter locations based on search queries
    useEffect(() => {
        if (locations.length > 0) {
            const filtered = locationSearchQueries.map((query, index) =>
                query
                    ? locations.filter((location) =>
                        location &&
                        location.mavitri &&
                        location.mavitri.toLowerCase().includes(query.toLowerCase())
                    )
                    : locations
            );
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(locationSearchQueries.map(() => []));
        }
    }, [locationSearchQueries, locations]);

    const fetchAllCategories = async () => {
        try {
            const response = await request.get('/api/getAllCategories');
            const data = response.data.data || [];
            setCategories(data);
            setFilteredCategories(data);
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục!', toastOptions);
            setCategories([]);
            setFilteredCategories([]);
        }
    };

    const fetchAllLocations = async () => {
        try {
            const response = await request.get('/api/getAllLocations');
            const data = response.data.data || [];
            setLocations(data);
            setFilteredLocations([data]);
        } catch (error) {
            toast.error('Không thể tải danh sách vị trí!', toastOptions);
            setLocations([]);
            setFilteredLocations([[]]);
        }
    };

    const handleSearchCategory = async (query) => {
        if (!query) {
            toast.error('Vui lòng nhập mã danh mục để tìm kiếm!', toastOptions);
            return;
        }

        setLoadingCategories(true);
        try {
            const response = await request.get('/api/searchCategories', {
                params: { tendanhmuc: query },
            });
            const matchedCategories = response.data.data || [];
            if (matchedCategories.length > 0) {
                const category = matchedCategories[0];
                setMadanhmuc(category.madanhmuc);
                setCategorySearchQuery(category.madanhmuc);
                setShowCategoryDropdown(false);
                toast.success(`Đã chọn danh mục: ${category.madanhmuc}`, toastOptions);
            } else {
                toast.error('Không tìm thấy danh mục phù hợp!', toastOptions);
            }
        } catch (error) {
            console.error('Error searching categories:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi tìm kiếm danh mục!', toastOptions);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSelectCategory = (category) => {
        setMadanhmuc(category.madanhmuc);
        setCategorySearchQuery(category.madanhmuc);
        setShowCategoryDropdown(false);
    };

    const handleCategoryInputChange = (e) => {
        setCategorySearchQuery(e.target.value);
        setMadanhmuc('');
        setShowCategoryDropdown(true);
    };

    const handleCategoryInputFocus = () => {
        setShowCategoryDropdown(true);
    };

    const handleCategoryInputBlur = () => {
        setTimeout(() => setShowCategoryDropdown(false), 200);
    };

    const handleSearchLocation = async (query, index) => {
        if (!query) {
            toast.error('Vui lòng nhập mã vị trí để tìm kiếm!', toastOptions);
            return;
        }

        setLoadingLocations(true);
        try {
            const response = await request.get('/api/getLocationByMaViTri', {
                params: { mavitri: query },
            });
            const location = response.data.data;
            const newVitri = [...vitri];
            newVitri[index].mavitri = location.mavitri;
            setVitri(newVitri);

            const newQueries = [...locationSearchQueries];
            newQueries[index] = location.mavitri;
            setLocationSearchQueries(newQueries);

            const newDropdowns = [...showLocationDropdowns];
            newDropdowns[index] = false;
            setShowLocationDropdowns(newDropdowns);

            toast.success(`Đã chọn vị trí: ${location.mavitri}`, toastOptions);
        } catch (error) {
            console.error('Error searching location:', error);
            toast.error(error.response?.data?.message || 'Không tìm thấy vị trí!', toastOptions);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleSelectLocation = (location, index) => {
        const newVitri = [...vitri];
        newVitri[index].mavitri = location.mavitri;
        setVitri(newVitri);

        const newQueries = [...locationSearchQueries];
        newQueries[index] = location.mavitri;
        setLocationSearchQueries(newQueries);

        const newDropdowns = [...showLocationDropdowns];
        newDropdowns[index] = false;
        setShowLocationDropdowns(newDropdowns);
    };

    const handleLocationInputChange = (e, index) => {
        const newQueries = [...locationSearchQueries];
        newQueries[index] = e.target.value;
        setLocationSearchQueries(newQueries);

        const newVitri = [...vitri];
        newVitri[index].mavitri = '';
        setVitri(newVitri);

        const newDropdowns = [...showLocationDropdowns];
        newDropdowns[index] = true;
        setShowLocationDropdowns(newDropdowns);
    };

    const handleLocationInputFocus = (index) => {
        const newDropdowns = [...showLocationDropdowns];
        newDropdowns[index] = true;
        setShowLocationDropdowns(newDropdowns);
    };

    const handleLocationInputBlur = (index) => {
        const newDropdowns = [...showLocationDropdowns];
        setTimeout(() => {
            newDropdowns[index] = false;
            setShowLocationDropdowns(newDropdowns);
        }, 200);
    };

    const handleAddLocation = () => {
        setVitri([...vitri, { mavitri: '', soluong: '' }]);
        setLocationSearchQueries([...locationSearchQueries, '']);
        setShowLocationDropdowns([...showLocationDropdowns, false]);
        setFilteredLocations([...filteredLocations, locations]);
    };

    const handleLocationChange = (index, field, value) => {
        const newVitri = [...vitri];
        newVitri[index][field] = value;
        setVitri(newVitri);
    };

    const handleAddBook = async () => {
        try {
            if (
                !masach ||
                !tensach ||
                !tacgia ||
                !nhaxuatban ||
                !namxb ||
                !phienban ||
                !madanhmuc ||
                !mota ||
                !pages ||
                !price ||
                vitri.some((loc) => !loc.mavitri || !loc.soluong)
            ) {
                toast.error('Vui lòng nhập đầy đủ thông tin!', toastOptions);
                return;
            }

            const bookData = {
                masach,
                img,
                tensach,
                tacgia,
                nhaxuatban,
                namxb: Number(namxb),
                phienban,
                madanhmuc,
                mota,
                vitri: vitri.map((loc) => ({
                    mavitri: loc.mavitri,
                    soluong: Number(loc.soluong),
                })),
                pages: Number(pages),
                price: Number(price),
            };

            const res = await request.post('/api/addbook', bookData);

            toast.success(res.data.message || 'Thêm sách thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    if (onSuccess) onSuccess(); // Gọi onSuccess để làm mới dữ liệu
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi thêm sách!', toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalAddBook} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Thêm Sách
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="g-3">
                            {/* Left Column */}
                            <Col md={6}>
                                <Form.Group controlId="formMasach">
                                    <Form.Label>Mã Sách</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập mã sách"
                                        value={masach}
                                        onChange={(e) => setMasach(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formImg">
                                    <Form.Label>Ảnh Sách</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập URL ảnh sách"
                                        value={img}
                                        onChange={(e) => setImg(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formTensach">
                                    <Form.Label>Tên Sách</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên sách"
                                        value={tensach}
                                        onChange={(e) => setTensach(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formTacgia">
                                    <Form.Label>Tác Giả</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên tác giả"
                                        value={tacgia}
                                        onChange={(e) => setTacgia(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formNhaxuatban">
                                    <Form.Label>Nhà Xuất Bản</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập nhà xuất bản"
                                        value={nhaxuatban}
                                        onChange={(e) => setNhaxuatban(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formNamxb">
                                    <Form.Label>Năm Xuất Bản</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập năm xuất bản"
                                        value={namxb}
                                        onChange={(e) => setNamxb(e.target.value)}
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        step="1"
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>

                            {/* Right Column */}
                            <Col md={6}>
                                <Form.Group controlId="formPhienban">
                                    <Form.Label>Phiên Bản</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập phiên bản"
                                        value={phienban}
                                        onChange={(e) => setPhienban(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formMadanhmuc" style={{ position: 'relative' }}>
                                    <Form.Label>Danh Mục</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập hoặc chọn mã danh mục"
                                        value={categorySearchQuery}
                                        onChange={handleCategoryInputChange}
                                        onFocus={handleCategoryInputFocus}
                                        onBlur={handleCategoryInputBlur}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleSearchCategory(categorySearchQuery);
                                        }}
                                        className="shadow-sm"
                                        disabled={loadingCategories}
                                    />
                                    {showCategoryDropdown && filteredCategories.length > 0 && (
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
                                            {filteredCategories.map((category) => (
                                                <div
                                                    key={category.madanhmuc}
                                                    onMouseDown={() => handleSelectCategory(category)}
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
                                                    {category.madanhmuc}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group controlId="formMota">
                                    <Form.Label>Mô Tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Nhập mô tả sách"
                                        value={mota}
                                        onChange={(e) => setMota(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPages">
                                    <Form.Label>Số Trang</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập số trang"
                                        value={pages}
                                        onChange={(e) => setPages(e.target.value)}
                                        min="0"
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPrice">
                                    <Form.Label>Giá Sách</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập giá sách"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        min="0"
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Location list */}
                        <Row className="g-3 mt-3">
                            <Col md={12}>
                                <Form.Label>Vị Trí</Form.Label>
                                {vitri.map((loc, index) => (
                                    <Row key={index} className="mb-2" style={{ position: 'relative' }}>
                                        <Col md={6}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nhập hoặc chọn vị trí"
                                                value={locationSearchQueries[index]}
                                                onChange={(e) => handleLocationInputChange(e, index)}
                                                onFocus={() => handleLocationInputFocus(index)}
                                                onBlur={() => handleLocationInputBlur(index)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleSearchLocation(locationSearchQueries[index], index);
                                                }}
                                                className="shadow-sm"
                                                disabled={loadingLocations}
                                            />
                                            {showLocationDropdowns[index] && filteredLocations[index]?.length > 0 && (
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
                                                    {filteredLocations[index].map((location) => (
                                                        <div
                                                            key={location.mavitri}
                                                            onMouseDown={() => handleSelectLocation(location, index)}
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
                                                            {location.mavitri} - {location.coso} - {location.soke}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <Form.Control
                                                type="number"
                                                placeholder="Nhập số lượng"
                                                value={loc.soluong}
                                                onChange={(e) =>
                                                    handleLocationChange(index, 'soluong', e.target.value)
                                                }
                                                min="0"
                                                className="shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Button variant="outline-primary" onClick={handleAddLocation} className="mt-2">
                                    Thêm Vị Trí
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={handleClose} className="px-4">
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddBook} className="px-4">
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default ModalAddBook;
