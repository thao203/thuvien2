import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalRequestBook({ show, setShow, masach, tensach, vitri }) {
    const handleClose = () => setShow(false);
    const [quantity, setQuantity] = useState(1);
    const [ngaymuon, setNgaymuon] = useState('');
    const [mavitri, setMavitri] = useState('');
    const [locations, setLocations] = useState([]);


    // Set default borrow date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setNgaymuon(today);
    }, []);

    // Update locations and default mavitri when modal opens
    useEffect(() => {
        if (show && vitri && Array.isArray(vitri)) {
            setLocations(vitri);
            setMavitri(vitri[0]?.mavitri || '');
        } else if (show) {
            toast.error('Không có thông tin vị trí sách!');
            setLocations([]);
            setMavitri('');
        }
    }, [show, vitri]);

    const toastOptions = {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: handleClose,
    };

    const handleRequestBook = async () => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        if (!token) {
            toast.error('Không có token, vui lòng đăng nhập lại!', toastOptions);
            return;
        }
        try {
            const books = [{
                masach,
                mavitri,
                soluong: parseInt(quantity),
            }];
            const res = await request.post(
                '/api/requestborrowbook',
                {
                    books,
                    ngaymuon,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.data.message === 'Yêu cầu mượn sách thành công !!!') {
                toast.success('Yêu cầu mượn sách thành công!', toastOptions);
            } else {
                toast.error(res.data.message, toastOptions);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi mượn sách!';
            toast.error(errorMessage, toastOptions);
        }
    };

    return (
        <>
            <ToastContainer />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Yêu Cầu Mượn Sách</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-floating mb-3">
                        <input value={masach || ''} className="form-control" disabled />
                        <label>Mã Sách</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input value={tensach || ''} className="form-control" disabled />
                        <label>Tên Sách</label>
                    </div>
                    <div className="form-floating mb-3">
                        <select
                            className="form-control"
                            value={mavitri}
                            onChange={(e) => setMavitri(e.target.value)}
                        >
                            {locations.length > 0 ? (
                                locations.map((loc) => (
                                    <option key={loc.mavitri} value={loc.mavitri}>
                                        {loc.mavitri} (Số lượng có thể mượn: {loc.soluong - loc.soluongmuon})
                                    </option>
                                ))
                            ) : (
                                <option value="">Không có vị trí nào</option>
                            )}
                        </select>
                        <label>Mã Vị Trí</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="date"
                            className="form-control"
                            value={ngaymuon}
                            onChange={(e) => setNgaymuon(e.target.value)}
                            min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        />
                        <label>Ngày Mượn</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                        />
                        <label>Số Lượng</label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleRequestBook}>
                        Gửi Yêu Cầu
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalRequestBook;