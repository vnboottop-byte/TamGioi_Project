<?php
// File: api/get_teleports.php
header('Content-Type: application/json');
require_once '../db.php';

$zone = isset($_GET['zone']) ? $_GET['zone'] : 'TRUNG_CHAU';

// 🌟 BẢN VÁ: Nếu Admin gọi ALL, lôi hết toàn bộ Cổng Truyền Tống ra!
if ($zone === 'ALL') {
    $stmt = $conn->prepare("SELECT * FROM truyen_tong_tran ORDER BY zone_id ASC, id DESC");
    $stmt->execute();
} else {
    $stmt = $conn->prepare("SELECT * FROM truyen_tong_tran WHERE zone_id = ? ORDER BY id DESC");
    $stmt->bind_param("s", $zone);
    $stmt->execute();
}

$res = $stmt->get_result();

$data = [];
if ($res) { 
    while ($row = $res->fetch_assoc()) { 
        $data[] = $row; 
    } 
}
echo json_encode(['status' => 'success', 'data' => $data]);
?>