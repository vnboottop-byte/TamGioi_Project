<?php
header('Content-Type: application/json');
require_once '../db.php';
$res = $conn->query("SELECT * FROM truyen_tong_tran");
$data = [];
if ($res) { while ($row = $res->fetch_assoc()) { $data[] = $row; } }
echo json_encode(['status' => 'success', 'data' => $data]);
?>