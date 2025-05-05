import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect'; // Đảm bảo import đúng
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

function ModalEditLocation({ showModalEditLocation, setShowModalEditLocation, locationData, onEditSuccess }) {
    const [mavitri, setMavitri] = useState('');
    const [coso, setCoso] = useState('');
    const [soke, setSoke] = useState('');

    useEffect(() => {
        if (locationData) {
            setMavitri(locationData.mavitri || '');
            setCoso(locationData.coso || '');
            setSoke(locationData.soke || '');
        }
    }, [locationData]);

    const handleClose = () => setShowModalEditLocation(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleEditLocation = async () => {
        try {
            const dataToSend = { mavitri, coso, soke }; // Gửi cả mavitri trong body
            const url = '/api/updateLocation'; // Sử dụng endpoint cố định
            const res = await request.put(url, dataToSend);

            toast.success(res.data.message || 'Cập nhật vị trí thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onEditSuccess();
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!', toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalEditLocation} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Chỉnh Sửa Vị Trí
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
                                        value={mavitri}
                                        disabled
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
                    <Button variant="primary" onClick={handleEditLocation} className="px-4">
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalEditLocation;