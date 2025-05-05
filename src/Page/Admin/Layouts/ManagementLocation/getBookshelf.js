import { useEffect, useState } from 'react';
import request from '../../../../config/Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUser, faBuilding, faCalendar, faMoneyBill, faMapMarkerAlt, faCube } from '@fortawesome/free-solid-svg-icons';

function GetBookshelf() {
    const [bookshelfData, setBookshelfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const coso = urlParams.get('coso');
        const soke = urlParams.get('soke');

        const fetchBookshelf = async () => {
            try {
                if (!coso || !soke) {
                    setError('Vui lòng cung cấp cơ sở và số kệ!');
                    setLoading(false);
                    return;
                }

                const response = await request.get(`/api/getBookshelf?coso=${encodeURIComponent(coso)}&soke=${encodeURIComponent(soke)}`);
                setBookshelfData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Lỗi khi tải thông tin kệ sách: ' + err.message);
                setLoading(false);
            }
        };

        fetchBookshelf();
    }, []);

    return (
        <div className="container my-3">
            <div className="card shadow-sm p-3">
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải thông tin kệ sách...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                ) : bookshelfData?.books?.length > 0 ? (
                    <div className="bookshelf-content">
                        <h2 className="h4 mb-4 text-center text-primary">
                            <FontAwesomeIcon icon={faBook} className="me-2" />
                            Kệ sách - Cơ sở: {bookshelfData.coso}, Số kệ: {bookshelfData.soke}
                        </h2>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                            {bookshelfData.books.map((book, index) => (
                                <div key={index} className="col">
                                    <div className="card h-100 book-card">
                                        {book.img && (
                                            <div className="book-image-container">
                                                <img
                                                    src={book.img}
                                                    className="card-img-top book-image"
                                                    alt={book.tensach}
                                                />
                                            </div>
                                        )}
                                        <div className="card-body p-3">
                                            <h5 className="card-title text-truncate mb-3">{book.tensach}</h5>
                                            <div className="book-details small">
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faCube} className="me-2 text-muted" />
                                                    <strong>Mã:</strong> {book.masach}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faUser} className="me-2 text-muted" />
                                                    <strong>Tác giả:</strong> {book.tacgia}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faBuilding} className="me-2 text-muted" />
                                                    <strong>NXB:</strong> {book.nhaxuatban}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                                    <strong>Năm:</strong> {book.namxb}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faMoneyBill} className="me-2 text-muted" />
                                                    <strong>Giá:</strong> {book.price.toLocaleString()} VNĐ
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                                                    <strong>Vị trí:</strong> {book.mavitri}
                                                </p>
                                                <p className="mb-0">
                                                    <FontAwesomeIcon icon={faBook} className="me-2 text-muted" />
                                                    <strong>Còn:</strong> {book.soluong_con}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning text-center">
                        Không tìm thấy sách nào trên kệ này!
                    </div>
                )}
            </div>

            <style jsx>{`
                .book-image-container {
                    position: relative;
                    padding-top: 100%; /* Tỷ lệ 1:1 cho ảnh vuông */
                    overflow: hidden;
                    background-color: #f8f9fa;
                }

                .book-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .book-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid #e0e0e0; /* Đường kẻ phân biệt */
                    border-radius: 10px;
                    overflow: hidden;
                    background-color: #fff;
                }

                .book-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .book-card:hover .book-image {
                    transform: scale(1.05);
                }

                .book-details {
                    line-height: 1.4;
                }

                .text-truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .card-title {
                    color: #343a40;
                    font-weight: 600;
                }

                @media (max-width: 576px) {
                    .card-body {
                        padding: 1rem !important;
                    }

                    .book-details {
                        font-size: 0.85rem;
                    }

                    h2.h4 {
                        font-size: 1.25rem;
                    }

                    .card-title {
                        font-size: 1rem;
                    }

                    .book-card:hover {
                        transform: none; /* Tắt hiệu ứng hover trên mobile */
                    }
                }
            `}</style>
        </div>
    );
}

export default GetBookshelf;