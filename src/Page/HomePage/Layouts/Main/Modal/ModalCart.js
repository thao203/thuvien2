// <DOCUMENT filename="ModalCart.js">
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalCart({ show, setShow, masach, tensach, vitri, img, onAddToCart }) {
    const handleClose = () => setShow(false);
    const [quantity, setQuantity] = useState(1);

    // Đặt ngày mượn mặc định là hôm nay
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setNgaymuon(today);
    }, []);


    const [ngaymuon, setNgaymuon] = useState('');
    const [mavitri, setMavitri] = useState('');
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        if (show && vitri && Array.isArray(vitri)) {
            setLocations(vitri);
            setMavitri(vitri[0]?.mavitri || ''); // Chọn vị trí đầu tiên mặc định
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

    const handleAddToCart = () => {
        const selectedLocation = locations.find((loc) => loc.mavitri === mavitri);
        const availableQuantity = selectedLocation ? selectedLocation.soluong - selectedLocation.soluongmuon : 0;

        if (quantity <= 0 || quantity > availableQuantity) {
            toast.error(`Số lượng không hợp lệ! Chỉ còn ${availableQuantity} sách có thể mượn.`, toastOptions);
            return;
        }

        const cartItem = {
            masach,
            tensach,
            quantity: parseInt(quantity),
            mavitri,
            ngaymuon,
            img,
        };

        if (onAddToCart) {
            onAddToCart(cartItem);
            toast.success('Thêm sách vào giỏ hàng thành công!', toastOptions);
        } else {
            toast.error('Lỗi: Không thể thêm vào giỏ hàng!', toastOptions);
        }
    };

    return (
        <>
            <ToastContainer />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Sách Vào Giỏ Hàng</Modal.Title>
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
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setNgaymuon(e.target.value)}
                        />
                        <label>Ngày Mượn</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                        <label>Số Lượng</label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddToCart} disabled={!mavitri}>
                        Thêm Vào Giỏ Hàng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalCart;
// </DOCUMENT>