<?php
// File: api/get_shop.php (BẢN V3 - THỊ TRƯỜNG TỰ DO SANDBOX)
session_start();
header('Content-Type: application/json');
require_once '../db.php'; // Đường dẫn gọi CSDL

// 1. MỞ KHO LẤY HÀNG (KHÔNG PHÂN BIỆT MÔN PHÁI HAY ADMIN)
// Vét sạch đồ trong Database ra, ưu tiên xếp theo loại (Vũ khí -> Thú cưỡi -> Model) rồi đến giá tiền
$sql_shop = "SELECT * FROM shop_items ORDER BY item_type DESC, price ASC";
$res = $conn->query($sql_shop);

$items = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $items[] = $row;
    }
}

// 2. ĐÓNG GÓI BẮN VỀ GIAO DIỆN
echo json_encode(['status' => 'success', 'data' => $items]);
?>