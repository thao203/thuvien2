import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ModalExtendBook({ show, setShow, masinhvien }) {
    const handleClose = () => setShow(false);

    const [date, setDate] = useState('');

    const handleExtendsBook = async () => {
        const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/;

        if (!dateRegex.test(date)) {
            toast.error('Vui lòng nhập đúng ngày tháng năm!');
            return;
        }
        const res = await request.post('/api/ExtendBorrowing', {
            date,
            masinhvien,
        });
        window.location.reload();
    };

    return (
        <>
            <ToastContainer />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Gia Hạn Sách</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {' '}
                    <div className="form-floating mb-3">
                        <input
                            onChange={(e) => setDate(e.target.value)}
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                        />
                        <label htmlFor="floatingInput">Gia Hạn Đến Ngày</label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleExtendsBook}>
                        Gửi Yêu Cầu
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalExtendBook;
