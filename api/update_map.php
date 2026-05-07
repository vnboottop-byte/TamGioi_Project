<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Quyền Admin!']); exit;
}

$id = intval($_POST['id']);
$scale = floatval($_POST['scale']);
$rx = floatval($_POST['rot_x']);
$ry = floatval($_POST['rot_y']);
$rz = floatval($_POST['rot_z']);

// 🌟 KIỂM TRA: Nếu có gửi tọa độ lên thì Cập nhật cả tọa độ (Dời Map)
if (isset($_POST['pos_x']) && isset($_POST['pos_y']) && isset($_POST['pos_z'])) {
    $px = floatval($_POST['pos_x']);
    $py = floatval($_POST['pos_y']);
    $pz = floatval($_POST['pos_z']);
    
    $stmt = $conn->prepare("UPDATE map_chunks SET scale = ?, rot_x = ?, rot_y = ?, rot_z = ?, pos_x = ?, pos_y = ?, pos_z = ? WHERE id = ?");
    $stmt->bind_param("dddddddi", $scale, $rx, $ry, $rz, $px, $py, $pz, $id);
} 
// 🌟 KIỂM TRA: Nếu không có tọa độ, chỉ cập nhật Scale và Góc xoay (Chức năng cũ)
else {
    $stmt = $conn->prepare("UPDATE map_chunks SET scale = ?, rot_x = ?, rot_y = ?, rot_z = ? WHERE id = ?");
    $stmt->bind_param("ddddi", $scale, $rx, $ry, $rz, $id);
}

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'msg' => 'Đã cập nhật Map!']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL: ' . $conn->error]);
}
?>