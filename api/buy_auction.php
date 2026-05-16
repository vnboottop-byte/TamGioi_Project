<?php
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$buyer = $_SESSION['user'];
$auction_id = intval($_POST['auction_id']);

$conn->begin_transaction();
try {
    // 1. Khóa Chợ Đấu Giá (FOR UPDATE để 2 người ko bấm mua 1 món cùng lúc)
  
  
    $stmt = $conn->prepare("SELECT seller_name, item_id, item_type, price_gold, upgrade_level FROM auction_house WHERE id = ? AND status = 'selling' FOR UPDATE");


    $stmt->bind_param("i", $auction_id); $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction) throw new Exception("Món đồ này đã bị người khác mua mất hoặc đã hủy bán!");
    if ($auction['seller_name'] === $buyer) throw new Exception("Không thể tự mua đồ của chính mình!");

    $price = intval($auction['price_gold']);

    // 2. Khóa Ví của người Mua
    $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
    $stmtB->bind_param("s", $buyer); $stmtB->execute();
    $buyer_data = $stmtB->get_result()->fetch_assoc();

    if ($buyer_data['game_gold'] < $price) throw new Exception("Không đủ Linh Thạch (Vàng)!");

    // 3. Trừ Vàng người mua
    $conn->query("UPDATE game_characters SET game_gold = game_gold - $price WHERE username = '$buyer'");

    // 4. Cộng Vàng người bán (Đã trừ 5% thuế phí sân chơi)
    $tax = intval($price * 0.05);
    $final_gold_to_seller = $price - $tax;
    $seller = $auction['seller_name'];
    $conn->query("UPDATE game_characters SET game_gold = game_gold + $final_gold_to_seller WHERE username = '$seller'");

    // 5. Đổi trạng thái Chợ (Thành sold)
    $conn->query("UPDATE auction_house SET status = 'sold' WHERE id = $auction_id");

    // 6. Nhét đồ vào túi người Mua
  
  
  
    $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level) VALUES (?, ?, ?, 0, ?)");
    $in->bind_param("sisi", $buyer, $auction['item_id'], $auction['item_type'], $auction['upgrade_level']);
   
   
   
    $in->execute();

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>