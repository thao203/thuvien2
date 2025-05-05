import React, { useState, useEffect } from 'react';
import request from '../../../../../src/config/Connect';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report = () => {
    const [bookStats, setBookStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchBookStats();
    }, [month, year]);

    const fetchBookStats = async () => {
        try {
            setLoading(true);
            const response = await request.get('api/getBookBorrowByMonth', {
                params: { month, year }
            });
            setBookStats(response.data.data || []);
            setCurrentPage(1);
        } catch (error) {
            setBookStats([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            setLoading(true);
            const response = await request({
                url: '/api/exportBookBorrow',
                method: 'GET',
                responseType: 'blob',
                params: { month, year }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bao_cao_sach_${month}_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // Dữ liệu cho biểu đồ thanh ngang
    const getChartData = () => {
        if (bookStats.length === 0) return {};

        const currentItems = bookStats.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        return {
            labels: currentItems.map(book => book.tensach),
            datasets: [
                {
                    label: 'Số lượt mượn',
                    data: currentItems.map(book => book.tongluotmuon),
                    backgroundColor: currentItems.map(() =>
                        'linear-gradient(90deg, rgba(54, 162, 235, 0.8), rgba(75, 192, 192, 0.8))'
                    ), // Gradient cho từng thanh
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 10, // Bo góc thanh
                    barThickness: 20, // Độ dày thanh
                    hoverBackgroundColor: 'rgba(255, 159, 64, 0.9)', // Màu khi hover
                },
            ],
        };
    };

    // Cấu hình cho biểu đồ thanh ngang
    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 14, family: 'Arial', weight: 'bold' },
                    color: '#333',
                },
            },
            title: {
                display: true,
                text: `Thống kê lượt mượn sách - Tháng ${month}/${year}`,
                font: { size: 20, family: 'Arial', weight: 'bold' },
                color: '#1e90ff',
                padding: { top: 20, bottom: 20 },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 5,
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw} lượt mượn`,
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Số lượt mượn',
                    font: { size: 14, weight: 'bold' },
                    color: '#555',
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)', // Grid nhạt
                },
                ticks: {
                    font: { size: 12 },
                    color: '#666',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Tên sách',
                    font: { size: 14, weight: 'bold' },
                    color: '#555',
                },
                ticks: {
                    font: { size: 12, family: 'Arial' },
                    color: '#333',
                },
            },
        },
        animation: {
            duration: 1500,
            easing: 'easeOutBounce', // Hiệu ứng nảy khi xuất hiện
        },
        elements: {
            bar: {
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.2)', // Bóng đổ cho thanh
            },
        },
    };

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = bookStats.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bookStats.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container py-4">
            <div className="card shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden', background: '#f9f9f9' }}>
                <div className="card-header bg-gradient-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Báo Cáo Thống Kê Sách - Tháng {month}/{year}</h4>
                        <div className="d-flex align-items-center">
                            <select
                                className="form-select me-2 shadow-sm"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                style={{ width: 'auto', borderRadius: '8px' }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="form-select me-2 shadow-sm"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                style={{ width: 'auto', borderRadius: '8px' }}
                            >
                                {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={new Date().getFullYear() - i}>
                                        {new Date().getFullYear() - i}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn btn-light btn-sm shadow-sm"
                                onClick={handleExportExcel}
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            >
                                <i className="bi bi-download me-2"></i>
                                {loading ? 'Đang xuất...' : 'Xuất Excel'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {bookStats.length > 0 && (
                                <div className="mb-5">
                                    <div
                                        className="chart-container shadow-sm"
                                        style={{
                                            height: '400px',
                                            background: '#fff',
                                            borderRadius: '10px',
                                            padding: '15px',
                                        }}
                                    >
                                        <Bar data={getChartData()} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="table table-hover table-striped">
                                    <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Mã sách</th>
                                        <th scope="col">Tên sách</th>
                                        <th scope="col">Mã vị trí</th>
                                        <th scope="col">Cơ sở</th>
                                        <th scope="col">Số kệ</th>
                                        <th scope="col">Số lượt mượn</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((book) => (
                                            <tr key={`${book.masach}-${book.mavitri}`}>
                                                <td>{book.masach}</td>
                                                <td>{book.tensach}</td>
                                                <td>{book.mavitri}</td>
                                                <td>{book.coso}</td>
                                                <td>{book.soke}</td>
                                                <td>{book.tongluotmuon}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                Không có dữ liệu để hiển thị
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {bookStats.length > 0 && (
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center mt-3">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Trước
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <li
                                                key={page}
                                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Sau
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </div>

                <div className="card-footer text-muted">
                    Cập nhật: {new Date().toLocaleString('vi-VN')}
                </div>
            </div>

            <style jsx>{`
                .table th, .table td {
                    vertical-align: middle;
                }
                .table-hover tbody tr:hover {
                    background-color: #f1f3f5;
                }
                .chart-container {
                    position: relative;
                }
                .bg-gradient-primary {
                    background: linear-gradient(45deg, #1e90ff, #00ced1);
                }
                .btn-light:hover {
                    background: #e0e0e0;
                }
            `}</style>
        </div>
    );
};

export default Report;