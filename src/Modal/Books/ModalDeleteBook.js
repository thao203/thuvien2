import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../config/Connect';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalDeleteBook({ showModalDeleteBook, setShowModalDeleteBook, masach, onSuccess }) {
    const handleClose = () => setShowModalDeleteBook(false);

    const toastOptions = {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: handleClose,
    };

    const handleDeleteBook = async () => {
        try {
            const res = await request.delete('/api/DeleteBook', {
                data: { masach: masach },
            });

            toast.success(res.data.message, {
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    if (onSuccess) onSuccess(); // Gọi onSuccess để làm mới dữ liệu
                },
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa sách';
            toast.error(errorMessage, toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalDeleteBook} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Sách</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa sách có mã sách: {masach}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleDeleteBook}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteBook;