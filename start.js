const { exec } = require('child_process');
const fs = require('fs');
const ip = require('ip');

// Lấy địa chỉ IP của máy, nếu lỗi thì dùng localhost
let localIP;
try {
    localIP = ip.address();
    console.log(`Địa chỉ IP của máy: ${localIP}`);
} catch (error) {
    localIP = 'localhost';
    console.log('Không lấy được IP, sử dụng localhost');
}

// Nội dung sẽ ghi vào file .env
const envContent = `HOST=${localIP}\nPORT=3000\n`;

// Ghi đè file .env
try {
    fs.writeFileSync('.env', envContent);
    console.log('File .env đã được cập nhật.');
} catch (err) {
    console.error(`Lỗi khi ghi file .env: ${err}`);
}

// Cấu hình lệnh để chạy ReactJS
const startCommand = `react-scripts start`;

// Thực thi lệnh npm start
exec(startCommand, (err, stdout, stderr) => {
    if (err) {
        console.error(`Lỗi: ${err}`);
        return;
    }
    console.log(stdout);
    console.error(stderr);
});