import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

function ModalEditReader({ showModalEditReader, setShowModalEditReader, readerData, onEditSuccess }) {
    const [hoten, setHoten] = useState('');
    const [address, setAddress] = useState('');
    const [ngaysinh, setNgaysinh] = useState('');
    const [sdt, setSdt] = useState('');
    const [email, setEmail] = useState('');
    const [typereader, setTypereader] = useState('Sinh viên');

    // Load dữ liệu ban đầu khi modal mở
    useEffect(() => {
        if (readerData) {
            setHoten(readerData.hoten || '');
            setAddress(readerData.address || '');
            setNgaysinh(readerData.ngaysinh ? readerData.ngaysinh.split('T')[0] : '');
            setSdt(readerData.sdt || '');
            setEmail(readerData.email || '');
            setTypereader(readerData.typereader || 'student');
            console.log('Initial typereader:', readerData.typereader); // Debug giá trị ban đầu
        }
    }, [readerData]);

    const handleClose = () => setShowModalEditReader(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleEditReader = async () => {
        try {
            const dataToSend = {
                masinhvien: readerData.masinhvien,
                hoten,
                address,
                ngaysinh,
                sdt,
                email,
                typereader,
            };

            const res = await request.put('/api/editReader', dataToSend);

            toast.success(res.data.message || 'Cập nhật bạn đọc thành công!', {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onEditSuccess(); // Gọi callback để cập nhật dữ liệu
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!', toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalEditReader} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Chỉnh Sửa Bạn Đọc
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="formHoten">
                                    <Form.Label>Họ Và Tên</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập họ và tên"
                                        value={hoten}
                                        onChange={(e) => setHoten(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formAddress">
                                    <Form.Label>Địa Chỉ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập địa chỉ"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formBrithday">
                                    <Form.Label>Ngày Sinh</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={ngaysinh}
                                        onChange={(e) => setNgaysinh(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formSdt">
                                    <Form.Label>Số Điện Thoại</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập số điện thoại"
                                        value={sdt}
                                        onChange={(e) => setSdt(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Nhập email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formTypereader">
                                    <Form.Label>Loại Độc Giả</Form.Label>
                                    <Form.Select
                                        value={typereader}
                                        onChange={(e) => {
                                            setTypereader(e.target.value);
                                        }}
                                        className="shadow-sm"
                                    >
                                        <option value="Sinh viên">Sinh viên</option>
                                        <option value="Giảng viên">Giảng viên</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={handleClose} className="px-4">
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleEditReader} className="px-4">
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default ModalEditReader;