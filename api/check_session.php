<?php
// 📦 MODULE: HẢI QUAN KIỂM TRA ĐĂNG NHẬP NHIỀU NƠI (BẢN VÁ LỖI VÒNG LẶP)
session_start();
require_once '../db.php'; 
header('Content-Type: application/json');

// 🌟 NẾU THIẾU THẺ BÀI (Do acc cũ chưa kịp phát thẻ) -> Hủy diệt Session ngay lập tức để ép đăng nhập lại lấy thẻ!
if (!isset($_SESSION['user']) || !isset($_SESSION['session_token'])) {
    session_unset();
    session_destroy();
    echo json_encode(['valid' => false]);
    exit;
}

$user = $_SESSION['user'];
$local_token = $_SESSION['session_token'];

$stmt = $conn->prepare("SELECT session_token FROM users WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row && $row['session_token'] === $local_token) {
    echo json_encode(['valid' => true]);
} else {
    // 🌟 KHÔNG KHỚP -> HỦY DIỆT SESSION
    session_unset();
    session_destroy();
    echo json_encode(['valid' => false]);
}
?>