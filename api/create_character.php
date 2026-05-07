<?php
// File: api/create_character.php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập tài khoản!']); exit;
}

$username = $_SESSION['user'];
$char_name = isset($_POST['char_name']) ? trim($_POST['char_name']) : '';
$class_id = isset($_POST['class_id']) ? intval($_POST['class_id']) : 0;

if (empty($char_name) || $class_id <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Vui lòng nhập Biệt Danh và chọn Môn Phái!']); exit;
}

// 1. Kiểm tra chống spam tạo nhiều nhân vật
$chk = $conn->prepare("SELECT username FROM game_characters WHERE username = ?");
$chk->bind_param("s", $username);
$chk->execute();
if ($chk->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Tài khoản này đã lập nhân vật rồi!']); exit;
}

// 2. Kéo thông số GỐC của Phái Sếp vừa chọn (Tu Tiên, Luyện Thể...)
$stmt_class = $conn->prepare("SELECT * FROM game_classes WHERE id = ?");
$stmt_class->bind_param("i", $class_id);
$stmt_class->execute();
$c = $stmt_class->get_result()->fetch_assoc();

if (!$c) {
    echo json_encode(['status' => 'error', 'msg' => 'Môn phái không tồn tại!']); exit;
}

// 3. GHI DANH VÀO GAME_CHARACTERS
// 🌟 QUAN TRỌNG: Ép current_model, current_weapon, current_mount thành rỗng ("")
// Để file rom.php tự động móc default_model và default_weapon của phái ra dùng!
$empty_str = ""; 

$sql = "INSERT INTO game_characters (username, char_name, class_id, level, exp, hp_max, hp_current, damage, current_model_url, current_weapon_url, current_mount_url) 
        VALUES (?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

// s: string, i: integer
$stmt->bind_param("ssiiiisssss", 
    $username, 
    $char_name, 
    $class_id, 
    $c['base_hp'], 
    $c['base_hp'], 
    $c['base_damage'], 
    $empty_str, 
    $empty_str, 
    $empty_str
);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'msg' => 'Khai tông lập phái thành công! Đang tiến vào Tam Giới...']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi Đăng ký: ' . $conn->error]);
}
?>