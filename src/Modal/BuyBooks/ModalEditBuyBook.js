import { useEffect, useState } from 'react';
import request from '../../config/Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';

function ModalEditBuyBook({ showModalEditBuyBook, setShowModalEditBuyBook, maphieumua }) {
    const [formData, setFormData] = useState({
        maphieumua: '',
        masach: '',
        soluong: '',
        dongia: '',
        mavitri: '',
    });
    const [locations, setLocations] = useState([]); // Danh sách mã vị trí
    const [loading, setLoading] = useState(false);

    // Lấy danh sách mã vị trí
    useEffect(() => {
        if (showModalEditBuyBook) {
            fetchLocations();
        }
    }, [showModalEditBuyBook]);

    const fetchLocations = async () => {
        try {
            const response = await request.get('/api/getAllLocations');
            setLocations(response.data.data); // Lấy mảng locations từ response.data.data
        } catch (error) {
            console.error('Lỗi khi lấy danh sách mã vị trí:', error);
            toast.error('Không thể tải danh sách mã vị trí!');
        }
    };

    // Lấy dữ liệu ban đầu khi modal mở
    useEffect(() => {
        if (showModalEditBuyBook && maphieumua) {
            setLoading(true);
            request
                .get('/api/getAllBuyBooks')
                .then((res) => {
                    const buyBooks = res.data.buyBooks || [];
                    const book = buyBooks.find((item) => item.maphieumua === maphieumua);
                    if (book) {
                        setFormData({
                            maphieumua: book.maphieumua,
                            masach: book.masach,
                            soluong: book.soluong,
                            dongia: book.dongia,
                            mavitri: book.mavitri,
                        });
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                    toast.error('Lỗi khi tải dữ liệu phiếu mua!');
                    setLoading(false);
                });
        }
    }, [showModalEditBuyBook, maphieumua]);

    // Xử lý cập nhật dữ liệu
    const handleSubmit = () => {
        // Kiểm tra số lượng và đơn giá nếu có giá trị
        if (formData.soluong && (isNaN(formData.soluong) || Number(formData.soluong) <= 0)) {
            toast.error('Số lượng phải là số dương!');
            return;
        }
        if (formData.dongia && (isNaN(formData.dongia) || Number(formData.dongia) <= 0)) {
            toast.error('Đơn giá phải là số dương!');
            return;
        }

        const updatedData = {
            maphieumua: formData.maphieumua,
            masach: formData.masach || undefined,
            soluong: formData.soluong ? Number(formData.soluong) : undefined,
            dongia: formData.dongia ? Number(formData.dongia) : undefined,
            mavitri: formData.mavitri || undefined,
        };

        setLoading(true);
        request
            .put('/api/editBuyBook', updatedData)
            .then((res) => {
                toast.success(res.data.message || 'Cập nhật phiếu mua thành công!');
                setShowModalEditBuyBook(false);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật:', error);
                const errorMessage = error.response?.data?.message || 'Cập nhật thất bại!';
                toast.error(errorMessage);
                setLoading(false);
            });
    };

    if (!showModalEditBuyBook) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sửa Phiếu Mua</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModalEditBuyBook(false)}
                            disabled={loading}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <p>Đang tải dữ liệu...</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Mã Phiếu Mua</label>
                                    <input
                                        className="form-control"
                                        value={formData.maphieumua}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mã Sách</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.masach}
                                        onChange={(e) =>
                                            setFormData({ ...formData, masach: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số Lượng</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={formData.soluong}
                                        onChange={(e) =>
                                            setFormData({ ...formData, soluong: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Đơn Giá (VNĐ)</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={formData.dongia}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dongia: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mã Vị Trí</label>
                                    <select
                                        className="form-select"
                                        value={formData.mavitri}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mavitri: e.target.value })
                                        }
                                        disabled={loading || locations.length === 0}
                                    >
                                        <option value="">Chọn mã vị trí</option>
                                        {locations.map((location) => (
                                            <option key={location._id} value={location.mavitri}>
                                                {location.mavitri}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowModalEditBuyBook(false)}
                            disabled={loading}
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalEditBuyBook;