<?php
// FILE: api/save_drop_rate.php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

// Chỉ có Admin mới được can thiệp Thiên Đạo
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Chỉ Admin mới có quyền!']); exit;
}

$boss_name = trim($_POST['boss_name']);
$item_id = intval($_POST['item_id']);
$drop_rate = floatval($_POST['drop_rate']);

if (empty($boss_name) || $item_id <= 0 || $drop_rate <= 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Dữ liệu không hợp lệ!']); exit;
}

// 🌟 THUẬT TOÁN THÔNG MINH: Nếu đã cài rớt món này cho con Boss này rồi thì Update lại Tỉ lệ, chưa có thì Insert mới!
$stmt_check = $conn->prepare("SELECT id FROM monster_drops WHERE monster_name = ? AND item_id = ?");
$stmt_check->bind_param("si", $boss_name, $item_id);
$stmt_check->execute();
$res = $stmt_check->get_result();

if ($res->num_rows > 0) {
    // Đã có -> Cập nhật
    $row = $res->fetch_assoc();
    $stmt_up = $conn->prepare("UPDATE monster_drops SET drop_rate = ? WHERE id = ?");
    $stmt_up->bind_param("di", $drop_rate, $row['id']);
    if($stmt_up->execute()) {
        echo json_encode(['status' => 'success', 'msg' => 'Đã cập nhật tỉ lệ!']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi DB Update']);
    }
} else {
    // Chưa có -> Tạo mới
    $stmt_in = $conn->prepare("INSERT INTO monster_drops (monster_name, item_id, drop_rate) VALUES (?, ?, ?)");
    $stmt_in->bind_param("sid", $boss_name, $item_id, $drop_rate);
    if($stmt_in->execute()) {
        echo json_encode(['status' => 'success', 'msg' => 'Đã thêm luật rớt đồ!']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Lỗi DB Insert']);
    }
}
?>