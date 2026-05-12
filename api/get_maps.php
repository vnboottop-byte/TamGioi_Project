<?php
// File: api/get_maps.php
header('Content-Type: application/json');
require_once '../db.php';

// 🌟 THÊM LỌC THEO ZONE_ID
$zone = isset($_GET['zone']) ? $_GET['zone'] : 'TRUNG_CHAU';
$stmt = $conn->prepare("SELECT * FROM map_chunks WHERE zone_id = ?");
$stmt->bind_param("s", $zone);
$stmt->execute();
$res = $stmt->get_result();

$maps = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $maps[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $maps]);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Không thể đọc dữ liệu Map!']);
}
?>