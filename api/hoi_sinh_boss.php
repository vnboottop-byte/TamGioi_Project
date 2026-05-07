<?php
// File: api/hoi_sinh_boss.php (BẢN V4 - BỌC THÉP BẢO MẬT & ĐỒNG BỘ CHUẨN)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; 

// 🌟 BỌC THÉP: Bắt buộc phải đăng nhập mới được phép kích hoạt hàm hồi sinh
if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Kẻ vô danh không có quyền gọi hồn!']);
    exit;
}

$boss_id = isset($_POST['boss_id']) ? intval($_POST['boss_id']) : 0;

if ($boss_id > 0) {
    // 🌟 Lấy max_hp đè qua hp, và đưa death_time về 0 để dọn sạch án tử
    $stmt = $conn->prepare("UPDATE map_monsters SET hp = max_hp, death_time = 0 WHERE id = ?");
    $stmt->bind_param("i", $boss_id);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'msg' => 'Boss đã được Server bơm đầy máu và hồi sinh!']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL: ' . $conn->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Mã Boss không hợp lệ!']);
}
?>