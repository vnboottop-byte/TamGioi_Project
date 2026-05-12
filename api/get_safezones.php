<?php
// File: api/get_safezones.php
header('Content-Type: application/json');
require_once '../db.php';

// 🌟 THÊM LỌC THEO ZONE_ID
$zone = isset($_GET['zone']) ? $_GET['zone'] : 'TRUNG_CHAU';
$stmt = $conn->prepare("SELECT * FROM safe_zones WHERE zone_id = ?");
$stmt->bind_param("s", $zone);
$stmt->execute();
$res = $stmt->get_result();

$data = [];
if ($res) { while ($row = $res->fetch_assoc()) { $data[] = $row; } }
echo json_encode(['status' => 'success', 'data' => $data]);
?>