<?php
// FILE: api/buy_auction.php (BẢN V5 - SÀN CHỨNG KHOÁN TIỀN TỆ)
session_start(); header('Content-Type: application/json'); require_once '../db.php';
if (!isset($_SESSION['user'])) exit;

$buyer = $_SESSION['user'];
$auction_id = intval($_POST['auction_id']);

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT seller_name, item_id, item_type, price_gold, upgrade_level FROM auction_house WHERE id = ? AND status = 'selling' FOR UPDATE");
    $stmt->bind_param("i", $auction_id); $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction) throw new Exception("Hàng đã bị nẫng tay trên hoặc hết hạn!");
    if ($auction['seller_name'] === $buyer) throw new Exception("Không thể tự mua đồ của mình!");

    $seller = $auction['seller_name'];

    if ($auction['item_type'] === 'currency') {
        // --- LUỒNG ĐẠI GIA MUA VÀNG BẰNG LINH THẠCH ---
        $soLinhThachTra = intval($auction['price_gold']);
        $soVangNhan = intval($auction['item_id']);

        $stmtBuyerBal = $conn->prepare("SELECT balance FROM users WHERE username = ? FOR UPDATE");
        $stmtBuyerBal->bind_param("s", $buyer); $stmtBuyerBal->execute();
        $buyerBal = $stmtBuyerBal->get_result()->fetch_assoc();
        
        if (!$buyerBal || $buyerBal['balance'] < $soLinhThachTra) throw new Exception("Không đủ Linh Thạch (VNĐ)!");

        // Trừ Linh Thạch người mua, Cộng Vàng cho người mua
        $conn->query("UPDATE users SET balance = balance - $soLinhThachTra WHERE username = '$buyer'");
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $soVangNhan WHERE username = '$buyer'");

        // Thuế sàn Linh Thạch 5% cho NPH
        $tax = intval($soLinhThachTra * 0.05);
        $linhThachThucNhan = $soLinhThachTra - $tax;
        $conn->query("UPDATE users SET balance = balance + $linhThachThucNhan WHERE username = '$seller'");

    } else {
        // --- LUỒNG BÌNH THƯỜNG MUA ĐỒ BẰNG VÀNG ---
        $price = intval($auction['price_gold']);
        $stmtB = $conn->prepare("SELECT game_gold FROM game_characters WHERE username = ? FOR UPDATE");
        $stmtB->bind_param("s", $buyer); $stmtB->execute();
        $buyer_data = $stmtB->get_result()->fetch_assoc();

        if (!$buyer_data || $buyer_data['game_gold'] < $price) throw new Exception("Không đủ Vàng!");
        
        $conn->query("UPDATE game_characters SET game_gold = game_gold - $price WHERE username = '$buyer'");
        $tax = intval($price * 0.05);
        $final_gold_to_seller = $price - $tax;
        $conn->query("UPDATE game_characters SET game_gold = game_gold + $final_gold_to_seller WHERE username = '$seller'");

        $in = $conn->prepare("INSERT INTO user_inventory (username, item_id, item_type, is_equipped, upgrade_level) VALUES (?, ?, ?, 0, ?)");
        $in->bind_param("sisi", $buyer, $auction['item_id'], $auction['item_type'], $auction['upgrade_level']);
        $in->execute();
    }

    $conn->query("UPDATE auction_house SET status = 'sold' WHERE id = $auction_id");

    $conn->commit(); echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback(); echo json_encode(['status' => 'error', 'msg' => $e->getMessage()]);
}
?>