<?php
// File: api/get_inventory.php
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1); error_reporting(E_ALL);
require_once '../db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập!']);
    exit;
}

// Kiểm tra xem Sếp đã tạo bảng chưa
$checkTable = $conn->query("SHOW TABLES LIKE 'user_inventory'");
if ($checkTable->num_rows == 0) {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi: Chưa chạy lệnh SQL tạo bảng user_inventory!']);
    exit;
}

$username = $_SESSION['user'];

$sql = "SELECT inv.id as inv_id, inv.item_id, inv.item_type, inv.is_equipped, 
               shop.name, shop.model_url 
        FROM user_inventory inv 
        JOIN shop_items shop ON inv.item_id = shop.id 
        WHERE inv.username = ? 
        ORDER BY inv.item_type DESC, inv.id DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi SQL: ' . $conn->error]); exit;
}
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();

$items = [];
while ($row = $res->fetch_assoc()) {
    $items[] = $row;
}
echo json_encode(['status' => 'success', 'data' => $items]);
?>