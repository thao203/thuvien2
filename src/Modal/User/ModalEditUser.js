import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import request from '../../config/Connect';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

function ModalEditUser({ showModalEditUser, setShowModalEditUser, idUser, isAdmin: initialIsAdmin, onEditSuccess }) {
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin || false);

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleClose = () => setShowModalEditUser(false);

    const handleEditUser = async () => {
        try {
            const res = await request.put('/api/updateUser', {
                masinhvien: idUser,
                isAdmin: isAdmin,
            });
            toast.success(res.data.message,{
                ...toastOptions,
                onClose: () => {
                    handleClose();
                    onEditSuccess();
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message,toastOptions);
        }
    };

    return (
        <>
            <Modal show={showModalEditUser} onHide={handleClose}>
                <Modal.Header closeButton className="justify-content-center">
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Chỉnh Sửa Người Dùng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group controlId="formIsAdmin">
                            <Form.Label>Quyền Quản Trị</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Quản trị viên"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                                className="shadow-sm"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={handleClose} className="px-4">
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleEditUser} className="px-4">
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}

export default ModalEditUser;