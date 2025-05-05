import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

function ModalAddLocation({ showModalAddLocation, setShowModalAddLocation, onAddSuccess }) {
    const [mavitri, setMavitri] = useState('');
    const [coso, setCoso] = useState('');
    const [soke, setSoke] = useState('');

    const handleClose = () => {
        setShowModalAddLocation(false);
        setMavitri('');
        setCoso('');
        setSoke('');
    };

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleAddLocation = async () => {
        try {
            // Kiểm tra bắt buộc nhập đủ thông tin
            if (!mavitri || !coso || !soke) {
                toast.error('Vui lòng nhập đầy đủ mã vị trí, cơ sở và số kệ!', toastOptions);
                return;
            }

            // Kiểm tra mã vị trí không chứa dấu cách
            if (mavitri.includes(' ')) {
                toast.error('Mã vị trí không được chứa dấu cách!', toastOptions);
                return;
            }

            const res = await request.post('/api/addLocation', {
                mavitri,
                coso,
                soke,
            });

            toast.success(res.data.message || 'Thêm vị trí thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onAddSuccess(); // Gọi callback để refresh danh sách
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vị trí!', toastOptions);
            console.error('Error:', error);
        }
    };

    return (
        <>
            <Modal show={showModalAddLocation} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Thêm Vị Trí
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group controlId="formMavitri">
                                    <Form.Label>Mã Vị Trí</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập mã vị trí"
                                        value={mavitri}
                                        onChange={(e) => setMavitri(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formCoso">
                                    <Form.Label>Cơ Sở</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập cơ sở"
                                        value={coso}
                                        onChange={(e) => setCoso(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formSoke">
                                    <Form.Label>Số Kệ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập số kệ"
                                        value={soke}
                                        onChange={(e) => setSoke(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={handleClose} className="px-4">
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddLocation} className="px-4">
                        Thêm Mới
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default ModalAddLocation;