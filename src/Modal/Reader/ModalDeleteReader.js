import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalDeleteReader({ showModalDeleteReader, setShowModalDeleteReader, masinhvien, onDeleteSuccess }) {
    const handleClose = () => setShowModalDeleteReader(false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleDeleteReader = async () => {
        try {
            const res = await request.delete('/api/deleteReader', {
                data: { masinhvien },
            });
            toast.success(res.data.message || 'Xóa bạn đọc thành công!',toastOptions);
            handleClose();
            onDeleteSuccess();
        } catch (error) {
            console.error('Error deleting reader:', error.response);
            if (error.response?.status === 400) {
                toast.error('Thiếu mã sinh viên!',toastOptions);
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy bạn đọc!',toastOptions);
            } else {
                toast.error(error.response?.data?.message || 'Lỗi khi xóa bạn đọc!',toastOptions);
            }
        }
    };

    return (
        <>
            <Modal show={showModalDeleteReader} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Bạn Đọc</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn muốn xóa Bạn Đọc Có Mã Sinh Viên: {masinhvien}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleDeleteReader}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteReader;