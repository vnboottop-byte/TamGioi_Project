<?php
// BƯỚC 1: Bật bộ đệm tàng hình để chặn mọi rác HTML/khoảng trắng từ db.php làm vỡ JSON
ob_start();
session_start();
require_once '../db.php';
$buffer_garbage = ob_get_clean(); // Hút sạch rác đi

// BƯỚC 2: Định dạng chuẩn API
header('Content-Type: application/json; charset=utf-8');

try {
    // Vét sạch kho (Thị trường Sandbox tự do)
    $sql = "SELECT * FROM shop_items ORDER BY item_type DESC, price ASC";
    $res = $conn->query($sql);

    if (!$res) throw new Exception("Lỗi Database: " . $conn->error);

    $items = [];
    while ($row = $res->fetch_assoc()) {
        // Cạo sạch khoảng trắng thừa trong Database nếu Sếp lỡ gõ nhầm
        $row['item_type'] = trim(strtolower($row['item_type']));
        $items[] = $row;
    }

    echo json_encode([
        'status' => 'success', 
        'total' => count($items), 
        'data' => $items,
        'debug_garbage' => $buffer_garbage // In rác ra để Sếp biết db.php có lỗi không
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
exit;
?>