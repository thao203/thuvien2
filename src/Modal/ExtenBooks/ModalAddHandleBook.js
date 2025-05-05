import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, DatePicker, Table, InputNumber, message, Select, Input } from 'antd';
import request from '../../config/Connect';
import moment from 'moment';
import styled from 'styled-components';

const { Option } = Select;

// Styled Components (unchanged)
const StyledModal = styled(Modal)`
    .ant-modal-content {
        border-radius: 12px;
        padding: 16px;
        background: #ffffff;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }
    .ant-modal-header {
        border-bottom: none;
        padding: 16px 24px;
    }
    .ant-modal-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2a44;
    }
    .ant-modal-footer {
        border-top: none;
        padding: 16px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
`;

const StyledForm = styled(Form)`
    .ant-form-item-label > label {
        font-weight: 500;
        color: #344054;
    }
    .ant-form-item {
        margin-bottom: 16px;
    }
`;

const FormRow = styled.div`
    display: flex;
    gap: 16px;
    .ant-form-item {
        flex: 1;
    }
`;

const BookSelectionSection = styled.div`
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const AddBookButton = styled(Button)`
    background: #2563eb;
    border: none;
    border-radius: 6px;
    height: 40px;
    font-weight: 500;
    &:hover {
        background: #1d4ed8;
    }
`;

const CancelButton = styled(Button)`
    border-radius: 6px;
    height: 40px;
    font-weight: 500;
    color: #344054;
    border-color: #d1d5db;
    &:hover {
        border-color: #9ca3af;
        color: #1f2a44;
    }
`;

const SubmitButton = styled(Button)`
    background: #16a34a;
    border: none;
    border-radius: 6px;
    height: 40px;
    font-weight: 500;
    &:hover {
        background: #15803d;
    }
`;

const StyledTable = styled(Table)`
    .ant-table {
        border-radius: 8px;
        overflow: hidden;
    }
    .ant-table-thead > tr > th {
        background: #f1f5f9;
        font-weight: 600;
        color: #1f2a44;
    }
    .ant-table-tbody > tr:hover > td {
        background: #f8fafc;
    }
`;

const ModalAddHandleBook = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [danhSachSach, setDanhSachSach] = useState([]);
    const [dangTai, setDangTai] = useState(false);
    const [danhSachSachApi, setDanhSachSachApi] = useState([]);
    const [danhSachDocGia, setDanhSachDocGia] = useState([]);
    const [tenSach, setTenSach] = useState('');
    const [danhSachViTri, setDanhSachViTri] = useState([]);

    // Fetch books and readers from API
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await request.get('/api/GetBooks');
                const data = Array.isArray(response.data) ? response.data : [];
                setDanhSachSachApi(data);
            } catch (error) {
                message.error('Không thể tải danh sách sách!', 3);
            }
        };

        const fetchReaders = async () => {
            try {
                const response = await request.get('/api/getAllReaders');
                const readers = Array.isArray(response.data.data) ? response.data.data : [];
                console.log('Danh sách độc giả:', readers); // Debug log
                setDanhSachDocGia(readers);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách độc giả:', error);
                message.error('Không thể tải danh sách độc giả!', 3);
            }
        };

        fetchBooks();
        fetchReaders();
    }, []);

    // Handle book selection
    const handleSelectMaSach = (value) => {
        const sach = danhSachSachApi.find((item) => item.masach === value);
        if (sach) {
            setTenSach(sach.tensach || 'Không có tên sách');
            const viTriList = Array.isArray(sach.vitri) ? sach.vitri.map((v) => v.mavitri) : [];
            setDanhSachViTri(viTriList);
            form.setFieldsValue({ mavitri: undefined });
        } else {
            setTenSach('');
            setDanhSachViTri([]);
            form.setFieldsValue({ mavitri: undefined });
        }
    };

    // Table columns
    const cot = [
        {
            title: 'Mã sách',
            dataIndex: 'masach',
            key: 'masach',
        },
        {
            title: 'Tên sách',
            dataIndex: 'tensach',
            key: 'tensach',
        },
        {
            title: 'Mã vị trí',
            dataIndex: 'mavitri',
            key: 'mavitri',
        },
        {
            title: 'Số lượng',
            dataIndex: 'soluong',
            key: 'soluong',
            render: (text, record, index) => (
                <InputNumber
                    min={1}
                    value={text}
                    onChange={(value) => xuLyThayDoiSoLuong(value, index)}
                    style={{ width: '80px', borderRadius: '6px' }}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, __, index) => (
                <Button
                    type="link"
                    danger
                    onClick={() => xoaSach(index)}
                    style={{ fontWeight: 500 }}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    // Handle quantity change
    const xuLyThayDoiSoLuong = (value, index) => {
        const danhSachCapNhat = [...danhSachSach];
        danhSachCapNhat[index].soluong = value;
        setDanhSachSach(danhSachCapNhat);
    };

    // Remove book from list
    const xoaSach = (index) => {
        const danhSachCapNhat = danhSachSach.filter((_, i) => i !== index);
        setDanhSachSach(danhSachCapNhat);
    };

    // Add book to list
    const themSach = async () => {
        try {
            const values = await form.validateFields(['masach', 'mavitri', 'soluong']);
            const sach = danhSachSachApi.find((item) => item.masach === values.masach);
            if (!sach) {
                message.error('Mã sách không hợp lệ!', 3);
                return;
            }
            if (!danhSachViTri.includes(values.mavitri)) {
                message.error('Mã vị trí không hợp lệ cho sách này!', 3);
                return;
            }
            const sachMoi = {
                masach: values.masach,
                tensach: sach.tensach || 'Không xác định',
                mavitri: values.mavitri,
                soluong: values.soluong || 1,
            };
            setDanhSachSach([...danhSachSach, sachMoi]);
            form.resetFields(['masach', 'mavitri', 'soluong']);
            setTenSach('');
            setDanhSachViTri([]);
            message.success('Thêm sách thành công!', 2);
        } catch (error) {
            message.error('Vui lòng kiểm tra lại thông tin sách!', 3);
        }
    };

    // Handle submit request
    const xuLyGuiYeuCau = async () => {
        if (danhSachSach.length === 0) {
            message.error('Vui lòng thêm ít nhất một cuốn sách!', 3);
            return;
        }
        try {
            setDangTai(true);
            const values = await form.validateFields(['masinhvien', 'ngaymuon']);

            // Prepare single payload for all books
            const duLieuGui = {
                masinhvien: values.masinhvien,
                ngaymuon: values.ngaymuon.format('YYYY-MM-DD'),
                books: danhSachSach.map((sach) => ({
                    masach: sach.masach,
                    mavitri: sach.mavitri,
                    soluong: Number(sach.soluong),
                })),
            };

            // Send single request
            console.log('Payload gửi:', JSON.stringify(duLieuGui, null, 2)); // Debug log
            const phanHoi = await request.post('/api/AdminRequestBorrowBook', duLieuGui, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            // Check response
            if (phanHoi.status === 200) {
                message.success('Tạo phiếu mượn sách thành công!', 3);
                form.resetFields();
                setDanhSachSach([]);
                setTenSach('');
                setDanhSachViTri([]);
                onSuccess();
                onCancel();
            } else {
                throw new Error(phanHoi.data.message || 'Lỗi không xác định');
            }
        } catch (error) {
            console.error('Lỗi phía frontend:', error);
            const errorMessage = error.response?.data?.errors || error.response?.data?.message || error.message || 'Có lỗi xảy ra!';

            // Handle specific book errors if returned by backend
            if (Array.isArray(errorMessage)) {
                message.error(
                    <div>
                        Có lỗi khi mượn một số sách:
                        <ul>
                            {errorMessage.map((err, index) => (
                                <li key={index}>
                                    Sách {danhSachSach.find((s) => s.masach === err.masach)?.tensach || err.masach}: {err.message}
                                </li>
                            ))}
                        </ul>
                    </div>,
                    5
                );
            } else {
                message.error(errorMessage, 3);
            }
        } finally {
            setDangTai(false);
        }
    };

    return (
        <StyledModal
            title="Yêu cầu mượn sách"
            open={visible}
            onCancel={onCancel}
            footer={[
                <CancelButton key="cancel" onClick={onCancel} disabled={dangTai}>
                    Hủy
                </CancelButton>,
                <SubmitButton
                    key="submit"
                    type="primary"
                    onClick={xuLyGuiYeuCau}
                    loading={dangTai}
                >
                    Gửi yêu cầu
                </SubmitButton>,
            ]}
            width={960}
            centered
        >
            <StyledForm form={form} layout="vertical">
                <FormRow>
                    <Form.Item
                        name="masinhvien"
                        label="Mã sinh viên"
                        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập mã sinh viên!' }]}
                    >
                        <Select
                            placeholder="Chọn hoặc nhập mã sinh viên"
                            showSearch
                            allowClear
                            style={{ borderRadius: '6px', height: '40px' }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={danhSachDocGia.length ? 'Không tìm thấy mã sinh viên' : 'Đang tải dữ liệu...'}
                        >
                            {danhSachDocGia.map((docgia) => (
                                <Option key={docgia.masinhvien} value={docgia.masinhvien}>
                                    {docgia.masinhvien}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="ngaymuon"
                        label="Ngày mượn"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày mượn!' },
                            {
                                validator: (_, value) =>
                                    value && value.isBefore(moment().startOf('day'))
                                        ? Promise.reject('Ngày mượn không được trước ngày hiện tại!')
                                        : Promise.resolve(),
                            },
                        ]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: '100%', borderRadius: '6px', height: '40px' }}
                            placeholder="Chọn ngày mượn"
                        />
                    </Form.Item>
                </FormRow>

                <BookSelectionSection>
                    <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                        Thêm sách
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <Form.Item
                            name="masach"
                            label="Mã sách"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Vui lòng chọn mã sách!' }]}
                        >
                            <Select
                                placeholder="Chọn hoặc tìm mã sách"
                                onChange={handleSelectMaSach}
                                showSearch
                                style={{ borderRadius: '6px', height: '40px' }}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent="Không tìm thấy mã sách"
                            >
                                {danhSachSachApi.map((sach) => (
                                    <Option key={sach.masach} value={sach.masach}>
                                        {sach.masach}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Tên sách" style={{ flex: 1 }}>
                            <Input
                                value={tenSach}
                                disabled
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    padding: '0 12px',
                                    background: '#f8fafc',
                                    color: '#344054',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="mavitri"
                            label="Mã vị trí"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Vui lòng chọn mã vị trí!' }]}
                        >
                            <Select
                                placeholder="Chọn hoặc tìm mã vị trí"
                                showSearch
                                disabled={!danhSachViTri.length}
                                style={{ borderRadius: '6px', height: '40px' }}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent="Không có mã vị trí"
                            >
                                {danhSachViTri.map((mavitri) => (
                                    <Option key={mavitri} value={mavitri}>
                                        {mavitri}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="soluong"
                            label="Số lượng"
                            style={{ width: '100px' }}
                            initialValue={1}
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng!' },
                                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%', borderRadius: '6px', height: '40px' }}
                            />
                        </Form.Item>
                        <AddBookButton type="primary" onClick={themSach}>
                            Thêm
                        </AddBookButton>
                    </div>
                </BookSelectionSection>

                <StyledTable
                    columns={cot}
                    dataSource={danhSachSach}
                    rowKey={(record, index) => index}
                    pagination={false}
                    locale={{ emptyText: 'Chưa có sách nào được thêm' }}
                />
            </StyledForm>
        </StyledModal>
    );
};

export default ModalAddHandleBook;