import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

function ModalEditCategory({ showModalEditCategory, setShowModalEditCategory, categoryData, onEditSuccess }) {
    const [madanhmuc, setMadanhmuc] = useState('');
    const [tendanhmuc, setTendanhmuc] = useState('');

    // Load dữ liệu ban đầu khi modal mở
    useEffect(() => {
        if (categoryData) {
            setMadanhmuc(categoryData.madanhmuc || '');
            setTendanhmuc(categoryData.tendanhmuc || '');
            console.log('Initial category data:', categoryData); // Debug giá trị ban đầu
        }
    }, [categoryData]);

    const handleClose = () => setShowModalEditCategory(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleEditCategory = async () => {
        try {
            const dataToSend = {
                madanhmuc: categoryData.madanhmuc, // Giữ nguyên madanhmuc từ dữ liệu gốc
                tendanhmuc,
            };
            console.log('Data to send:', dataToSend);

            const res = await request.put('/api/updateCategory', dataToSend);

            toast.success(res.data.message || 'Cập nhật danh mục thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onEditSuccess(); // Gọi callback để cập nhật dữ liệu
                },
            });
        } catch (error) {
            console.error('Error:', error.response?.data);
        }
    };

    return (
        <>
            <Modal show={showModalEditCategory} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Chỉnh Sửa Danh Mục
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
                                        value={madanhmuc}
                                        disabled // Không cho chỉnh sửa madanhmuc
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
                    <Button variant="primary" onClick={handleEditCategory} className="px-4">
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default ModalEditCategory;