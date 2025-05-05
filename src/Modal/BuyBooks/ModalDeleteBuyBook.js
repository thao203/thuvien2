import { useState } from 'react';
import request from '../../config/Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';

function ModalDeleteBuyBook({ showModalDeleteBuyBook, setShowModalDeleteBuyBook, maphieumua }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        if (!maphieumua) {
            toast.error('Thiếu mã phiếu mua!');
            return;
        }

        setLoading(true);
        request
            .delete(`/api/deleteBuyBook?maphieumua=${encodeURIComponent(maphieumua)}`)
            .then((res) => {
                toast.success(res.data.message || 'Xóa phiếu mua thành công!');
                setShowModalDeleteBuyBook(false);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Lỗi khi xóa:', error);
                const errorMessage = error.response?.data?.message || 'Xóa thất bại!';
                toast.error(errorMessage);
                setLoading(false);
            });
    };

    if (!showModalDeleteBuyBook) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Xóa Phiếu Mua</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModalDeleteBuyBook(false)}
                            disabled={loading}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p>
                            Bạn có chắc chắn muốn xóa phiếu mua với mã{' '}
                            <strong>{maphieumua}</strong> không?
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowModalDeleteBuyBook(false)}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalDeleteBuyBook;