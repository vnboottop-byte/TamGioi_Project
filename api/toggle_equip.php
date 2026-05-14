<?php
// FILE: api/toggle_equip.php
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) exit;
$username = $_SESSION['user'];
$data = json_decode(file_get_contents('php://input'), true);
$inv_id = intval($data['inv_id']);
$action = $data['action']; // 'equip' hoặc 'unequip'

$conn->begin_transaction();
try {
    // Tìm thông tin món đồ đang tương tác
    $stmt = $conn->prepare("SELECT inv.item_type, shop.model_url, shop.required_class FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id = ? AND inv.username = ?");
    $stmt->bind_param("is", $inv_id, $username);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    if (!$item) throw new Exception("Không tìm thấy đồ!");

    $type = $item['item_type'];
    $url = $item['model_url'];

    // Xác định cột tương ứng trong game_characters
    $col = "";
    if ($type === 'weapon') $col = "current_weapon_url";
    elseif ($type === 'weapon2') $col = "current_weapon2_url";
    elseif ($type === 'mount') $col = "current_mount_url";
    elseif ($type === 'model') $col = "current_model_url";

    if ($action === 'equip') {
        // Lột sạch đồ cùng loại đang mặc
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE username = '$username' AND item_type = '$type'");
        // Mặc món này vào
        $conn->query("UPDATE user_inventory SET is_equipped = 1 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '$url' WHERE username = '$username'");
    } else {
        // THÁO ĐỒ RA (Trả về chuỗi rỗng để engine load đồ mặc định của phái)
        $conn->query("UPDATE user_inventory SET is_equipped = 0 WHERE id = $inv_id");
        if ($col) $conn->query("UPDATE game_characters SET $col = '' WHERE username = '$username'");
    }
    
    $conn->commit();
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error']);
}
?>