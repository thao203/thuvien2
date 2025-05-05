import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

function ModalAddCategory({ showModalAddCategory, setShowModalAddCategory, onAddSuccess }) {
    const [madanhmuc, setMadanhmuc] = useState('');
    const [tendanhmuc, setTendanhmuc] = useState('');

    const handleClose = () => {
        setShowModalAddCategory(false);
        setMadanhmuc('');
        setTendanhmuc('');
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

    const handleAddCategory = async () => {
        try {
            // Kiểm tra bắt buộc nhập đủ thông tin
            if (!madanhmuc || !tendanhmuc) {
                toast.error('Vui lòng nhập đầy đủ mã danh mục và tên danh mục!', toastOptions);
                return;
            }

            // Kiểm tra mã danh mục không chứa dấu cách
            if (madanhmuc.includes(' ')) {
                toast.error('Mã danh mục không được chứa dấu cách!', toastOptions);
                return;
            }

            const res = await request.post('/api/addCategory', {
                madanhmuc,
                tendanhmuc,
            });

            toast.success(res.data.message || 'Thêm danh mục thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onAddSuccess(); // Gọi callback để refresh danh sách
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm danh mục!', toastOptions);
            console.error('Error:', error);
        }
    };

    return (
        <>
            <Modal show={showModalAddCategory} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Thêm Danh Mục Sách
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="formMadanhmuc">
                                    <Form.Label>Mã Danh Mục</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập mã danh mục"
                                        value={madanhmuc}
                                        onChange={(e) => setMadanhmuc(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formTendanhmuc">
                                    <Form.Label>Tên Danh Mục</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên danh mục"
                                        value={tendanhmuc}
                                        onChange={(e) => setTendanhmuc(e.target.value)}
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
                    <Button variant="primary" onClick={handleAddCategory} className="px-4">
                        Thêm Mới
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default ModalAddCategory;