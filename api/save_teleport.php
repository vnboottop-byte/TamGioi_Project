<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'Admin') {
    echo json_encode(['status' => 'error']); exit;
}

$name = $_POST['name']; $model = $_POST['model']; $scale = floatval($_POST['scale']);
$px = floatval($_POST['px']); $py = floatval($_POST['py']); $pz = floatval($_POST['pz']);
$dx = floatval($_POST['dx']); $dy = floatval($_POST['dy']); $dz = floatval($_POST['dz']);

$stmt = $conn->prepare("INSERT INTO truyen_tong_tran (ten_dich_den, model_url, scale, pos_x, pos_y, pos_z, dest_x, dest_y, dest_z) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssddddddd", $name, $model, $scale, $px, $py, $pz, $dx, $dy, $dz);

if ($stmt->execute()) echo json_encode(['status' => 'success']);
else echo json_encode(['status' => 'error']);
?>