<?php
// File: api/update_boss.php (BẢN V62 - GIỮ NGUYÊN CHỈ SỐ GỐC)
session_start();
header('Content-Type: application/json');
require_once '../db.php';

// Bảo mật chỉ cho Admin
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Quyền Admin!']); exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$level = isset($_POST['level']) ? intval($_POST['level']) : 1;
$scale = isset($_POST['scale']) ? floatval($_POST['scale']) : 1.0;
$class_code = isset($_POST['class_code']) ? $_POST['class_code'] : 'TU_TIEN';

if ($id <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Thiếu ID']); exit;
}

// 🌟 CHỈ CẬP NHẬT THÔNG TIN CƠ BẢN - KHÔNG ĐỤNG VÀO CÔNG THỨC MÁU/DAME
// Để Sếp tự quản lý chỉ số trong Database cho chuẩn AAA
$stmt = $conn->prepare("UPDATE map_monsters SET level=?, scale=?, class_code=? WHERE id=?");
$stmt->bind_param("idsi", $level, $scale, $class_code, $id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'msg' => 'Đã lưu thông số Boss!']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL: ' . $conn->error]);
}
?>