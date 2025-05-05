import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalDeleteClearanceBooks({ showModalDeleteClearanceBooks, setShowModalDeleteClearanceBooks, masachthanhly, onDeleteSuccess }) {
    const handleClose = () => setShowModalDeleteClearanceBooks(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: handleClose,
    };

    const handleDeleteClearanceBook = async () => {
        try {
            const res = await request.delete('/api/deleteClearanceBook', {
                params: { masachthanhly },
            });
            toast.success(res.data.message ,toastOptions);
            handleClose();
            onDeleteSuccess();
        } catch (error) {
            console.error('Error deleting clearance book:', error.response);
            if (error.response?.status === 400) {
                toast.error(error.response.data.message ,toastOptions);
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy sách thanh lý!',toastOptions);
            } else {
                toast.error(error.response?.data?.message ,toastOptions);
            }
        }
    };

    return (
        <>
            <Modal show={showModalDeleteClearanceBooks} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Sách Thanh Lý</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn muốn xóa sách thanh lý có mã: {masachthanhly}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleDeleteClearanceBook}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteClearanceBooks;