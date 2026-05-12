<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error']); exit;
}

$name = $_POST['name']; 
$model = $_POST['model']; 
$scale = floatval($_POST['scale']);
$px = floatval($_POST['px']); $py = floatval($_POST['py']); $pz = floatval($_POST['pz']);
$dx = floatval($_POST['dx']); $dy = floatval($_POST['dy']); $dz = floatval($_POST['dz']);

// 🌟 NHẬN 2 BIẾN ZONE TỪ ROM.PHP GỬI SANG
$zone_id = isset($_POST['zone_id']) ? $_POST['zone_id'] : 'TRUNG_CHAU';
$zone_dich_den = isset($_POST['zone_dich_den']) ? $_POST['zone_dich_den'] : 'TRUNG_CHAU';

// 🌟 THÊM 2 CỘT NÀY VÀO SQL
$stmt = $conn->prepare("INSERT INTO truyen_tong_tran (ten_dich_den, model_url, scale, pos_x, pos_y, pos_z, dest_x, dest_y, dest_z, zone_id, zone_dich_den) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

// ssdddddddss = 2 string, 7 double, 2 string ở cuối
$stmt->bind_param("ssdddddddss", $name, $model, $scale, $px, $py, $pz, $dx, $dy, $dz, $zone_id, $zone_dich_den);

if ($stmt->execute()) echo json_encode(['status' => 'success']);
else echo json_encode(['status' => 'error']);
?>