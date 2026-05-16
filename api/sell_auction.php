<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$user = $_SESSION['user'];
$inv_id = intval($_POST['inv_id']);
$price = intval($_POST['price_gold']);

if ($price <= 0) { echo json_encode(['status' => 'error', 'msg' => 'Giá bán phải lớn hơn 0!']); exit; }

$conn->begin_transaction();
try {
    // Kéo đồ từ túi ra
 
    $stmt = $conn->prepare("SELECT item_id, item_type, is_equipped, upgrade_level FROM user_inventory WHERE id = ? AND username = ?");
   
    $stmt->bind_param("is", $inv_id, $user); $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();

    if (!$item || $item['is_equipped'] == 1) throw new Exception("Không tìm thấy vật phẩm hoặc đang mặc!");

    // Đẩy lên bảng auction_house
  
  
    $in = $conn->prepare("INSERT INTO auction_house (seller_name, item_id, item_type, price_gold, upgrade_level) VALUES (?, ?, ?, ?, ?)");
    $in->bind_param("sisii", $user, $item['item_id'], $item['item_type'], $price, $item['upgrade_level']);
  
  
    $in->execute();

    // Xóa khỏi túi đồ
    $conn->query("DELETE FROM user_inventory WHERE id = $inv_id");

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>