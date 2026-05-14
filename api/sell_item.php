<?php
// FILE: api/sell_item.php
session_start(); header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user'])) exit;
$username = $_SESSION['user'];
$data = json_decode(file_get_contents('php://input'), true);
$inv_id = intval($data['inv_id']);

$conn->begin_transaction();
try {
    // Soi giá gốc của món hàng
    $stmt = $conn->prepare("SELECT shop.price, inv.is_equipped FROM user_inventory inv JOIN shop_items shop ON inv.item_id = shop.id WHERE inv.id = ? AND inv.username = ?");
    $stmt->bind_param("is", $inv_id, $username);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    
    if (!$item) throw new Exception("Vật phẩm không tồn tại!");
    if ($item['is_equipped'] == 1) throw new Exception("Phải tháo đồ ra mới được bán!");

    // Định giá bán rác = 10% giá mua (Thu hồi vốn cày cuốc)
    $tienThuVe = max(500, intval($item['price'] * 0.1));

    // Bán rác và lấy tiền
    $conn->query("DELETE FROM user_inventory WHERE id = $inv_id");
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $tienThuVe WHERE username = '$username'");

    $conn->commit();
    echo json_encode(['status' => 'success', 'gold_earned' => $tienThuVe]);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>