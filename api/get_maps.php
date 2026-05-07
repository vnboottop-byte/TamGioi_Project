<?php
// File: api/get_maps.php
header('Content-Type: application/json');
require_once '../db.php';

$res = $conn->query("SELECT * FROM map_chunks");
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