<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập']);
    exit;
}

$username = $_SESSION['user'];
$level_vua_qua = isset($_POST['level_vua_qua']) ? (int)$_POST['level_vua_qua'] : 0;

if ($level_vua_qua <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Level mê cung không hợp lệ!']);
    exit;
}

// 🛑 ANTI-CHEAT: Kiểm tra xem đã nhận thưởng ải này trong tháng này chưa (Chống Spam F5)
$stmt = $conn->prepare("SELECT id FROM maze_records WHERE username = ? AND maze_level = ? AND MONTH(created_at) = MONTH(CURRENT_DATE())");
$stmt->bind_param("si", $username, $level_vua_qua);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Ải này bạn đã phá đảo trong tháng này rồi!']);
    exit;
}

// 🏆 Ghi danh Kỷ lục
$time_passed = 0; // Sau này Sếp làm bộ đếm giây thì update vào đây
$stmt_insert = $conn->prepare("INSERT INTO maze_records (username, maze_level, time_passed) VALUES (?, ?, ?)");
$stmt_insert->bind_param("sii", $username, $level_vua_qua, $time_passed);
$stmt_insert->execute();

// 💎 Trao thưởng 
$thuong_lt = 500 * $level_vua_qua; // Ví dụ: Qua LV2 được 1000, LV5 được 2500 LT
$conn->query("UPDATE users SET balance = balance + $thuong_lt WHERE username = '$username'");

echo json_encode([
    'status' => 'success', 
    'msg' => 'Phá đảo Mê cung thành công!', 
    'thuong_linh_thach' => $thuong_lt
]);
?>