<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error', 'msg' => 'Chỉ Admin mới có quyền!']); exit;
}

$x = floatval($_POST['x']); $y = floatval($_POST['y']); $z = floatval($_POST['z']);
$r = floatval($_POST['radius']);
$zone_id = isset($_POST['zone_id']) ? $_POST['zone_id'] : 'TRUNG_CHAU';

$stmt = $conn->prepare("INSERT INTO safe_zones (pos_x, pos_y, pos_z, radius, zone_id) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("dddds", $x, $y, $z, $r, $zone_id);

if ($stmt->execute()) echo json_encode(['status' => 'success']);
else echo json_encode(['status' => 'error', 'msg' => 'Lỗi DB']);
?>