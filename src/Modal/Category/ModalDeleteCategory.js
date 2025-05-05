import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalDeleteCategory({ showModalDeleteCategory, setShowModalDeleteCategory, madanhmuc, onDeleteSuccess }) {
    const handleClose = () => setShowModalDeleteCategory(false);

    const toastOptions = {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleDeleteCategory = async () => {
        try {
            const res = await request.delete('/api/deleteCategory', {
                data: { madanhmuc },
            });
            toast.success(res.data.message ,toastOptions);
            handleClose();
            onDeleteSuccess();
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error(error.response.data.message,toastOptions);
            } else if (error.response?.status === 404) {
                toast.error('Danh mục không tồn tại!',toastOptions);
            } else {
                toast.error(error.response?.data?.message,toastOptions);
            }
        }
    };

    return (
        <>
            <Modal show={showModalDeleteCategory} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Danh Mục</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn muốn xóa Danh Mục Có Mã: {madanhmuc}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleDeleteCategory}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteCategory;