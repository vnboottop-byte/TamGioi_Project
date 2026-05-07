<?php
// File: api/equip_item.php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || !isset($_POST['item_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'Chưa đăng nhập hoặc thiếu ID vật phẩm!']); 
    exit;
}

$username = $_SESSION['user'];
$item_id = intval($_POST['item_id']);

// 1. Soi vật phẩm trong Shop xem nó là loại gì (Vũ khí, Thú cưỡi hay Skin)
$stmt = $conn->prepare("SELECT model_url, item_type FROM shop_items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$item = $stmt->get_result()->fetch_assoc();

if (!$item) {
    echo json_encode(['status' => 'error', 'msg' => 'Vật phẩm không tồn tại!']); 
    exit;
}

$type = $item['item_type'];
$url = $item['model_url'];

$conn->begin_transaction();
try {
    // 2. Tháo toàn bộ đồ CÙNG LOẠI của User này ra (Đang cưỡi rồng thì phải xuống rồng)
    $stmt_off = $conn->prepare("UPDATE user_inventory SET is_equipped = 0 WHERE username = ? AND item_type = ?");
    $stmt_off->bind_param("ss", $username, $type);
    $stmt_off->execute();

    // 3. Mặc món đồ mới vào
    $stmt_on = $conn->prepare("UPDATE user_inventory SET is_equipped = 1 WHERE username = ? AND item_id = ?");
    $stmt_on->bind_param("si", $username, $item_id);
    $stmt_on->execute();

    // 4. Cập nhật Link 3D thẳng vào game_characters để Engine Three.js hốt cho nhanh
    $column = "";
    if ($type == 'model') $column = "current_model_url";
    if ($type == 'weapon') $column = "current_weapon_url";
    if ($type == 'weapon2') $column = "current_weapon2_url";
    if ($type == 'mount') $column = "current_mount_url";

    if ($column != "") {
        $stmt_char = $conn->prepare("UPDATE game_characters SET $column = ? WHERE username = ?");
        $stmt_char->bind_param("ss", $url, $username);
        $stmt_char->execute();
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'msg' => 'Đã trang bị thành công!', 'new_url' => $url, 'type' => $type]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'msg' => 'Lỗi hệ thống CSDL!']);
}
?>